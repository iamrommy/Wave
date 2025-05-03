const sharp = require("sharp");
const cloudinary = require("../utils/cloudinary.js");
const  Post  = require("../models/post.model.js");
const  User  = require("../models/user.model.js");
const  UserPostInteraction  = require("../models/Interaction.model.js");
const  Comment  = require("../models/comment.model.js");
const { getReceiverSocketId, io } = require("../socket/socket.js");
const updateInteractionScore = require('./interaction.controller.js');

exports.addNewPost = async (req, res) => { 
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;
        // console.log(caption, image, authorId)
        if (!image) return res.status(400).json({ message: 'Image required' });

        // Optimize image using sharp
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        // Save optimized image to temporary file (Cloudinary requires a file path)
        const tempFilePath = `./temp-${Date.now()}.jpg`;
        await sharp(optimizedImageBuffer).toFile(tempFilePath);

        // Upload to Cloudinary with folder support
        const cloudResponse = await cloudinary.uploader.upload(tempFilePath, {
            folder: process.env.FOLDER_NAME,
            resource_type: 'image'
        });

        // Delete temp file after upload (Optional, but good practice)
        const fs = require('fs');
        fs.unlinkSync(tempFilePath);

        // Save post in DB
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        });

        // Add post reference to user
        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' });

        return res.status(201).json({
            message: 'New post added',
            post,
            success: true,
        });

    } catch (error) {
        console.log("Error in addNewPost:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

function extractHashtags(caption) {
    const matches = caption.match(/#\w+/g);
    return matches ? matches.map(tag => tag.toLowerCase()) : [];
}

exports.getAllPost = async (req, res) => {
    try {
        const loggedInUser = await User.findById(req.id).select("following");

        if (!loggedInUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get 50 random posts from all posts
        const posts = await Post.aggregate([
            { $sample: { size: 60 } }
        ]);

        // Populate author and comments like before
        const populatedPosts = await Post.populate(posts, [
            {
                path: 'author',
                select: 'username profilePicture'
            },
            {
                path: 'comments',
                options: { sort: { createdAt: 1 } },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            }
        ]);

        return res.status(200).json({
            posts: populatedPosts,
            success: true
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getRecommendedPosts = async (req, res) => {
  try {
    const userId = req.id;
    const page = parseInt(req.query.page) || 0;
    const interactions = await UserPostInteraction.find({ userId });

    if (interactions.length === 0) {
      const randomPosts = await Post.aggregate([{ $sample: { size: 60 * (page + 1) } }]);
      const paginated = randomPosts.slice(page * 60, (page + 1) * 60);
      const populated = await Post.populate(paginated, [
        {
          path: 'author',
          select: 'username profilePicture'
        },
        {
          path: 'comments',
          options: { sort: { createdAt: 1 } },
          populate: {
            path: 'author',
            select: 'username profilePicture'
          }
        },
        {
          path: 'likes',
          options: { sort: { createdAt: 1 } }
        } 
      ]);
      return res.json({ success: true, posts: populated });
    }

    const hashtagScores = {};
    const now = Date.now();

    for (let { postId, score, createdAt } of interactions) {
      const post = await Post.findById(postId).select("caption");
      if (!post) continue;

      const tags = extractHashtags(post.caption);
      const timeDecay = Math.exp(-(now - new Date(createdAt)) / (1000 * 3600 * 24 * 7)); // 7-day decay

      for (let tag of tags) {
        hashtagScores[tag] = (hashtagScores[tag] || 0) + score * timeDecay;
      }
    }

    const sortedTags = Object.entries(hashtagScores).sort((a, b) => b[1] - a[1]);
    const topHashtags = sortedTags.slice(0, 5).map(([tag]) => tag);
    const secondaryHashtags = sortedTags.slice(5).map(([tag]) => tag);

    // High-interest: 25 posts
    const highInterest = await Post.aggregate([
      {
        $addFields: {
          tags: {
            $map: {
              input: {
                $filter: {
                  input: { $split: ['$caption', ' '] },
                  as: 'w',
                  cond: { $regexMatch: { input: '$$w', regex: /^#/ } }
                }
              },
              as: 'tag',
              in: { $toLower: '$$tag' }
            }
          }
        }
      },
      {
        $addFields: {
          matchCount: {
            $size: {
              $filter: {
                input: '$tags',
                as: 't',
                cond: { $in: ['$$t', topHashtags] }
              }
            }
          }
        }
      },
      { $match: { matchCount: { $gt: 0 } } },
      { $sort: { matchCount: -1, createdAt: -1 } },
      { $limit: 25 }
    ]);

    // Medium-interest: 5 posts
    let mediumInterest = [];
    if (secondaryHashtags.length) {
      mediumInterest = await Post.aggregate([
        {
          $match: {
            caption: {
              $regex: secondaryHashtags.join('|'),
              $options: 'i'
            }
          }
        },
        { $sample: { size: 5 } }
      ]);
    }

    // Trending: 15 posts
    const trendingPosts = await Post.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
      .sort({ likesCount: -1, commentsCount: -1 })
      .limit(15);

    // Serendipity: 20 posts
    const seenTags = new Set([...topHashtags, ...secondaryHashtags]);
    const serendipity = await Post.aggregate([
      {
        $addFields: {
          tags: {
            $map: {
              input: {
                $filter: {
                  input: { $split: ['$caption', ' '] },
                  as: 'w',
                  cond: { $regexMatch: { input: '$$w', regex: /^#/ } }
                }
              },
              as: 'tag',
              in: { $toLower: '$$tag' }
            }
          }
        }
      },
      {
        $match: {
          tags: {
            $elemMatch: {
              $nin: Array.from(seenTags)
            }
          }
        }
      },
      { $sample: { size: 20 } }
    ]);

    // Combine and dedupe
    const seen = new Set();
    const combined = [...highInterest, ...mediumInterest, ...trendingPosts, ...serendipity];
    const deduped = combined.filter(post => {
      const id = post._id.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    // Shuffle
    for (let i = deduped.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deduped[i], deduped[j]] = [deduped[j], deduped[i]];
    }

    let finalPosts = deduped.slice(0, 60);

    // If nothing matched, fallback to 60 random
    if (finalPosts.length === 0) {
      const fallback = await Post.aggregate([{ $sample: { size: 60 } }]);
      finalPosts = fallback;
    }

    const populated = await Post.populate(finalPosts, [
      {
          path: 'author',
          select: 'username profilePicture'
      },
      {
          path: 'comments',
          options: { sort: { createdAt: 1 } },
          populate: {
              path: 'author',
              select: 'username profilePicture'
          }
      },
      {
         path: 'likes',
         options: {sort: {createdAt: 1}},
      }
  ]);

    res.json({ success: true, posts: populated });

  } catch (err) {
    
    console.error('Error in explore feed:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username profilePicture'
        }).populate({
            path: 'comments',
            sort: { createdAt: 1 },
            populate: {
                path: 'author',
                select: 'username profilePicture'
            }
        }).populate({path: 'likes', sort:{createdAt:1}})
        ;
        return res.status(200).json({
            posts,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

exports.getFeedPost = async (req, res) => {
  try {
      const authorId = req.id;
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const skip = (page - 1) * limit;

      const user = await User.findById(authorId).select('following');
      if (!user) {
          return res.status(404).json({ success: false, message: "User not found" });
      }

      const posts = await Post.find({ author: { $in: user.following } })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate({
              path: 'author',
              select: 'username profilePicture'
          })
          .populate({
              path: 'comments',
              options: { sort: { createdAt: 1 } },
              populate: {
                  path: 'author',
                  select: 'username profilePicture'
              }
          }).populate({path: 'likes', options:{sort:{createdAt:1}}});

      // 🔀 Shuffle
      for (let i = posts.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [posts[i], posts[j]] = [posts[j], posts[i]];
      }

      return res.status(200).json({
          success: true,
          posts
      });
  } catch (error) {
      console.error("Error fetching feed posts:", error);
      return res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.likePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id;
        // console.log(likeKrneWalaUserKiId, postId)
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        // like logic started
        await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
        // await post.save();

        // implement socket io for real-time notification
        const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');

        const postOwnerId = post.author.toString();
        if (postOwnerId !== likeKrneWalaUserKiId) {
            // emit a notification event
            const notification = {
                type: 'like',
                userId: likeKrneWalaUserKiId,
                userDetails: user,
                postId,
                message: 'Your post was liked'
            };
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }

        await updateInteractionScore(likeKrneWalaUserKiId, postId, 'like');
        return res.status(200).json({ message: 'Post liked', success: true });
    } catch (error) {
        console.log(error);
    }
};

exports.dislikePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        // like logic started
        await post.updateOne({ $pull: { likes: likeKrneWalaUserKiId } });
        await post.save();

        // implement socket io for real-time notification
        const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if (postOwnerId !== likeKrneWalaUserKiId) {
            // emit a notification event
            const notification = {
                type: 'dislike',
                userId: likeKrneWalaUserKiId,
                userDetails: user,
                postId,
                message: 'Your post was disliked'
            };
            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification);
        }

        await updateInteractionScore(likeKrneWalaUserKiId, postId, 'dislike');
        return res.status(200).json({ message: 'Post disliked', success: true });
    } catch (error) {
        console.log(error);
    }
};

exports.addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const commentKrneWalaUserKiId = req.id;

        const { text } = req.body;

        const post = await Post.findById(postId);

        if (!text) return res.status(400).json({ message: 'Text is required', success: false });

        const comment = await Comment.create({
            text,
            author: commentKrneWalaUserKiId,
            post: postId
        });

        await comment.populate({
            path: 'author',
            select: "username profilePicture"
        });

        post.comments.push(comment._id);
        await post.save();
        
        await updateInteractionScore(commentKrneWalaUserKiId, postId, 'comment');
        return res.status(201).json({
            message: 'Comment Added',
            comment,
            success: true
        });

    } catch (error) {
        console.log(error);
    }
};

exports.getCommentsOfPost = async (req, res) => {
    try {
        const postId = req.params.id;

        const comments = await Comment.find({ post: postId }).populate('author', 'username profilePicture');

        if (!comments) return res.status(404).json({ message: 'No comments found for this post', success: false });

        return res.status(200).json({ success: true, comments });

    } catch (error) {
        console.log(error);
    }
};

exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        if (post.author.toString() !== authorId) return res.status(403).json({ message: 'Unauthorized' });

        // Extract public ID from Cloudinary URL
        const imageUrl = post.image;
        const publicId = imageUrl.split('/').pop().split('.')[0];

        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(`${process.env.FOLDER_NAME}/${publicId}`);

        // Delete post from database
        await Post.findByIdAndDelete(postId);

        // Remove post reference from user
        let user = await User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        // Remove post from all users' bookmarks
        await User.updateMany(
            { bookmarks: postId },
            { $pull: { bookmarks: postId } }
        );

        // Delete associated comments
        await Comment.deleteMany({ post: postId });

        return res.status(200).json({
            success: true,
            message: 'Post deleted'
        });

    } catch (error) {
        console.log("Error in deletePost:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


exports.bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found', success: false });

        const action = (await User.findById(authorId)).bookmarks.includes(post._id) ? '$pull' : '$addToSet';

        const updatedUser = await User.findByIdAndUpdate(
            authorId,
            { [action]: { bookmarks: post._id } },
            { new: true } // This ensures the updated document is returned
        );

        await updateInteractionScore(authorId, postId, `${action === '$pull' ? 'unbookmark':'bookmark'}`);

        return res.status(200).json({
            type: action === '$pull' ? 'unsaved' : 'saved',
            message: action === '$pull' ? 'Post removed from bookmarks' : 'Post bookmarked',
            success: true,
            user: updatedUser // Now it contains the latest bookmarks array
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong', success: false });
    }
};

