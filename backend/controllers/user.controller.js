const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const getDataUri = require("../utils/datauri.js");
const sharp = require('sharp');
const fs = require('fs');
const cloudinary = require("../utils/cloudinary.js");
const Post = require("../models/post.model.js");

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                message: "Try different email",
                success: false,
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            email,
            password: hashedPassword
        });
        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        let user = await User.findOne({ email })
                            .populate('following')
                            .populate('followers')
                            .exec();

        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }

        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { });

        const populatedPosts = await Promise.all(
            user.posts.map(async (postId) => {
                const post = await Post.findById(postId);
                if (post.author.equals(user._id)) {
                    return post;
                }
                return null;
            })
        );
        
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user?.bio,
            bookmarks: user?.bookmarks,
            gender: user?.gender,
            followers: user.followers,
            following: user.following,
            posts: populatedPosts
        };
        return res.cookie('token', token, { 
            httpOnly: true, 
            secure: true,  // Ensure secure cookies are sent over HTTPS
            sameSite: 'none',  // Allow cookies to be sent across different origins
        }).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user
        });
        
    } catch (error) {
        console.log(error);
    }
};

const logout = async (_, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: 'Logged out successfully.',
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId)
            .populate({
                path: 'posts',
                options: { sort: { createdAt: -1 } },
                populate: [
                    {
                        path: 'author',
                        select: 'username profilePicture _id'
                    },
                    {
                        path: 'comments',
                        populate: {
                            path: 'author',
                            select: 'username profilePicture _id'
                        }
                    }
                ]
            })
            .populate({
                path: 'bookmarks',
                options: { sort: { createdAt: -1 } },
                populate: [
                    {
                        path: 'author',
                        select: 'username profilePicture _id'
                    },
                    {
                        path: 'comments',
                        populate: {
                            path: 'author',
                            select: 'username profilePicture _id'
                        }
                    }
                ]
            })
            .populate('followers')
            .populate('following')
            .exec();

        return res.status(200).json({
            user,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        // Find the user in the database
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        }

        // If a profile picture is provided, upload it to Cloudinary
        if (profilePicture) {
            // Optimize image using sharp
            const optimizedImageBuffer = await sharp(profilePicture.buffer)
                .resize({ width: 500, height: 500, fit: 'inside' })
                .toFormat('jpeg', { quality: 80 })
                .toBuffer();

            // Save optimized image to temporary file
            const tempFilePath = `./temp-${Date.now()}.jpg`;
            await sharp(optimizedImageBuffer).toFile(tempFilePath);

            // Upload image to Cloudinary with a folder
            cloudResponse = await cloudinary.uploader.upload(tempFilePath, {
                folder: process.env.FOLDER_NAME,
                resource_type: 'image'
            });

            // Delete temp file after upload
            fs.unlinkSync(tempFilePath);

            // Delete old profile picture from Cloudinary (if exists)
            if (user.profilePicture && user.profilePicture.includes('cloudinary')) {
                const publicId = user.profilePicture.split('/').pop().split('.')[0]; // Extract public ID from URL
                await cloudinary.uploader.destroy(`${process.env.FOLDER_NAME}/${publicId}`);
            }

            // Update profile picture URL in the database
            user.profilePicture = cloudResponse.secure_url;
        }

        // Update other profile details
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;

        await user.save();

        return res.status(200).json({
            message: 'Profile updated successfully.',
            success: true,
            user
        });
    } catch (error) {
        console.error("Error in editProfile:", error);
        return res.status(500).json({
            message: 'Internal Server Error',
            success: false
        });
    }
};

// const getSuggestedUsers = async (req, res) => {
//     try {
//         // Fetch the logged-in user to get the list of users they've followed
//         const loggedInUser = await User.findById(req.id).select("following");

//         if (!loggedInUser) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // Exclude logged-in user and already followed users
//         const suggestedUsers = await User.find({
//             _id: { $ne: req.id, $nin: loggedInUser.following }
//         }).select("-password");

//         if (suggestedUsers.length === 0) {
//             return res.status(400).json({
//                 message: 'No suggested users available',
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             users: suggestedUsers
//         });

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };


const getSuggestedUsers = async (req, res) => {
    try {
        const loggedInUser = await User.findById(req.id).select("following");

        if (!loggedInUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const following = loggedInUser.following;

        let suggestedUsers;

        if (following.length === 0) {
            // New user: suggest 10 random users excluding self
            suggestedUsers = await User.aggregate([
                { $match: { _id: { $ne: loggedInUser._id } } },
                { $sample: { size: 10 } },
                { $project: { password: 0 } }
            ]);
        } else {
            // Fetch followings of followings
            const followingsOfFollowings = await User.find({
                _id: { $in: following }
            }).select("following");

            const suggestionsSet = new Set();

            followingsOfFollowings.forEach(user => {
                user.following.forEach(id => {
                    // Avoid adding self or already-followed users
                    if (
                        id.toString() !== loggedInUser._id.toString() &&
                        !following.includes(id.toString())
                    ) {
                        suggestionsSet.add(id.toString());
                    }
                });
            });

            // Convert to array and get only 10 random suggestions
            const suggestionsArray = Array.from(suggestionsSet);

            // Shuffle and limit to 10
            const shuffled = suggestionsArray.sort(() => 0.5 - Math.random());
            const finalSuggestions = shuffled.slice(0, 10);

            suggestedUsers = await User.find({
                _id: { $in: finalSuggestions }
            }).select("-password");
        }

        return res.status(200).json({
            success: true,
            users: suggestedUsers
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const followOrUnfollow = async (req, res) => {
    try {
        const followKrneWala = req.id;
        const jiskoFollowKrunga = req.params.id;

        if (followKrneWala === jiskoFollowKrunga) {
            return res.status(400).json({
                message: 'You cannot follow/unfollow yourself',
                success: false
            });
        }

        let user = await User.findById(followKrneWala);
        let targetUser = await User.findById(jiskoFollowKrunga);

        if (!user || !targetUser) {
            return res.status(400).json({
                message: 'User not found',
                success: false
            });
        }

        const isFollowing = user.following.includes(jiskoFollowKrunga);

        if (isFollowing) {
            // Unfollow
            user = await User.findByIdAndUpdate(followKrneWala, { $pull: { following: jiskoFollowKrunga } }, {new:true});
            await User.findByIdAndUpdate(jiskoFollowKrunga, { $pull: { followers: followKrneWala } });

        } else {
            // Follow
            user = await User.findByIdAndUpdate(followKrneWala, { $push: { following: jiskoFollowKrunga } }, {new:true});
            await User.findByIdAndUpdate(jiskoFollowKrunga, { $push: { followers: followKrneWala } });
        }

        // Populate targetUser's followers and following
        targetUser = await User.findById(jiskoFollowKrunga)
        .populate({
            path: 'posts',
            options: { sort: { createdAt: -1 } },
            populate: [
                {
                    path: 'author',
                    select: 'username profilePicture _id'
                },
                {
                    path: 'comments',
                    populate: {
                        path: 'author',
                        select: 'username profilePicture _id'
                    }
                }
            ]
        })
        .populate({
            path: 'bookmarks',
            options: { sort: { createdAt: -1 } },
            populate: [
                {
                    path: 'author',
                    select: 'username profilePicture _id'
                },
                {
                    path: 'comments',
                    populate: {
                        path: 'author',
                        select: 'username profilePicture _id'
                    }
                }
            ]
        })
        .populate('followers')
        .populate('following')
        .exec();
            
        
        user = await User.findById(followKrneWala)
        .populate({
            path: 'posts',
            options: { sort: { createdAt: -1 } },
            populate: [
                {
                    path: 'author',
                    select: 'username profilePicture _id'
                },
                {
                    path: 'comments',
                    populate: {
                        path: 'author',
                        select: 'username profilePicture _id'
                    }
                }
            ]
        })
        .populate({
            path: 'bookmarks',
            options: { sort: { createdAt: -1 } },
            populate: [
                {
                    path: 'author',
                    select: 'username profilePicture _id'
                },
                {
                    path: 'comments',
                    populate: {
                        path: 'author',
                        select: 'username profilePicture _id'
                    }
                }
            ]
        })
        .populate('followers')
        .populate('following')
        .exec();

        return res.status(200).json({ 
            message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
            success: true,
            user,
            targetUser
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

const searchUser = async (req, res) => {
    try {
      const { searchTerm } = req.query;
  
      if (!searchTerm) {
        return res.status(400).json({ success: false, message: "Search term is required" });
      }
  
      // Perform case-insensitive search using regex
      const users = await User.find({
        username: { $regex: searchTerm, $options: "i" }
      }).select("username profilePicture");
  
      // Sort results based on position of searchTerm in username
      const sortedUsers = users.sort((a, b) => {
        const aIndex = a.username.toLowerCase().indexOf(searchTerm.toLowerCase());
        const bIndex = b.username.toLowerCase().indexOf(searchTerm.toLowerCase());
        return aIndex - bIndex;
      });
  
      res.status(200).json({ success: true, users: sortedUsers });
    } catch (error) {
      console.error("Error searching user:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };  
  

module.exports = { register, login, logout, getProfile, editProfile, getSuggestedUsers, followOrUnfollow, searchUser };
