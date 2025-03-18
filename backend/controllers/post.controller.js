const sharp = require("sharp");
const cloudinary = require("../utils/cloudinary.js");
const  Post  = require("../models/post.model.js");
const  User  = require("../models/user.model.js");
const  Comment  = require("../models/comment.model.js");
const { getReceiverSocketId, io } = require("../socket/socket.js");

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

exports.getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });
        return res.status(200).json({
            posts,
            success: true
        });
    } catch (error) {
        console.log(error);
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
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username profilePicture'
            }
        });
        return res.status(200).json({
            posts,
            success: true
        });
    } catch (error) {
        console.log(error);
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
        await post.save();

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

