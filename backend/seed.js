// const mongoose = require("mongoose");
// const { faker } = require('@faker-js/faker');
// const User = require("./models/user.model.js");
// const Post = require("./models/post.model.js");
// const Comment = require("./models/comment.model.js");
// const { Conversation } = require("./models/conversation.model.js");
// const { Message } = require("./models/message.model.js");
// const { default: axios } = require("axios");

// // // Define categories and some sample hashtags
// // const categories = {
// //     Fitness: ["#gym", "#workout", "#fitlife", "#healthgoals", "#strength"],
// //     Travel: ["#wanderlust", "#travelmore", "#vacationvibes", "#adventuretime"],
// //     Food: ["#foodie", "#foodcravings", "#tasty", "#foodlovers"],
// //     Fashion: ["#fashionfit", "#trendystyle", "#dailylook", "#wearitright"],
// //     Tech: ["#codinglife", "#techupdates", "#developerlife", "#buildinpublic"],
// //     Art: ["#createart", "#sketchtime", "#digitalart", "#artsyvibes"],
// //     Music: ["#musicmood", "#nowplaying", "#songvibes", "#audiowave"],
// //     Beauty: ["#glowup", "#beautyroutine", "#skingoals", "#makeuplove"],
// //     Movies: ["#filmreview", "#moviemagic", "#cinemavibes", "#watchthis"],
// //     Nature: ["#greenplanet", "#earthvibes", "#outdoorsoul", "#natureshots"],
// //     General: ["#wave", "#vibe", "#connect", "#trendingonwave", "#wavecommunity"]
// // };

// // const sampleImages = [
// //     "https://source.unsplash.com/random/600x400?sig=", // Append index to get different images
// // ];

// // const connectDB = async () => {
// //     try {
// //         await mongoose.connect('mongodb+srv://ramanjotsingh8574:7MXutNJqls4WgLfY@cluster0.4t7ydo5.mongodb.net/Wave');
// //         console.log("MongoDB connected successfully.");
// //     } catch (error) {
// //         console.log(error);
// //     }
// // };

// // async function seed() {
// //     try {
// //         console.log("Connecting to DB...");
// //         connectDB();

// //         console.log("Clearing old data...");
// //         await Comment.deleteMany();
// //         await Post.deleteMany();
// //         await User.deleteMany();
// //         await Message.deleteMany();
// //         await Conversation.deleteMany();

// //         const users = [];

// //         // Step 1: Create Users
// //         for (let i = 0; i < 150; i++) {
// //             const username = faker.internet.username().toLowerCase(); // Corrected deprecated method
// //             const email = faker.internet.email();
// //             const password = "hashedpassword123"; // Use a hashed password in real setup
// //             const gender = faker.helpers.arrayElement(["male", "female"]); // Corrected deprecated method

// //             const user = new User({
// //                 username,
// //                 email,
// //                 password,
// //                 gender,
// //                 bio: faker.lorem.sentence(),
// //                 profilePicture: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
// //             });

// //             await user.save();
// //             users.push(user);
// //         }

// //         const posts = [];

// //         // Step 2: Create Posts
// //         for (const user of users) {
// //             const categoryNames = Object.keys(categories);
// //             const selectedCategory = faker.helpers.arrayElement(categoryNames); // Corrected deprecated method
// //             const selectedHashtags = faker.helpers.arrayElements(categories[selectedCategory], faker.number.int({ min: 1, max: 3 })); // Corrected method

// //             const postCount = faker.number.int({ min: 5, max: 10 });

// //             for (let i = 0; i < postCount; i++) {
// //                 const captionText = faker.lorem.sentence();
// //                 const caption = `${captionText} ${selectedHashtags.join(" ")}`;

// //                 const image = `${sampleImages[0]}${Math.floor(Math.random() * 1000)}`;

// //                 const post = new Post({
// //                     caption,
// //                     image,
// //                     author: user._id,
// //                 });

// //                 await post.save();
// //                 posts.push(post);

// //                 // Add post to user's posts
// //                 user.posts.push(post._id);
// //             }

// //             await user.save();
// //         }

// //         // Step 3: Generate Likes and Comments
// //         for (const post of posts) {
// //             const likeCount = faker.number.int({ min: 10, max: 50 });
// //             const likedBy = faker.helpers.arrayElements(users, likeCount); // Corrected method

// //             for (const user of likedBy) {
// //                 post.likes.push(user._id); // Only users who exist should like the post
// //             }

// //             const commentCount = faker.number.int({ min: 2, max: 10 });
// //             for (let i = 0; i < commentCount; i++) {
// //                 const commenter = faker.helpers.arrayElement(users); // Corrected method
// //                 const comment = new Comment({
// //                     text: faker.lorem.sentence(),
// //                     author: commenter._id,
// //                     post: post._id,
// //                 });

// //                 await comment.save();
// //                 post.comments.push(comment._id); // Add the comment to the post
// //             }

// //             await post.save(); // Save the post with the updated likes and comments
// //         }

// //         // Step 4: Follow Random Users
// //         for (const user of users) {
// //             const followingCount = faker.number.int({ min: 5, max: 20 });
// //             const randomFollows = faker.helpers.arrayElements(users.filter(u => u._id !== user._id), followingCount); // Corrected method

// //             for (const followed of randomFollows) {
// //                 if (!user.following.includes(followed._id)) {
// //                     user.following.push(followed._id);
// //                     followed.followers.push(user._id);
// //                     await followed.save();
// //                 }
// //             }

// //             await user.save();
// //         }

// //         console.log("✅ Fake data generated successfully!");
// //         process.exit();
// //     } catch (err) {
// //         console.error("❌ Error seeding data:", err);
// //         process.exit(1);
// //     }
// // }

// // seed();


// // const bcrypt = require('bcryptjs');
// // const User = require("./models/user.model.js");

// // async function updatePasswords() {

// //     const connectDB = async () => {
// //         try {
// //             await mongoose.connect('mongodb+srv://ramanjotsingh8574:7MXutNJqls4WgLfY@cluster0.4t7ydo5.mongodb.net/Wave');
// //             console.log("MongoDB connected successfully.");
// //         } catch (error) {
// //             console.log(error);
// //         }
// //     };
// //     connectDB();

// //     // Get all users from the database
// //     const users = await User.find();

// //     // The password you want to set for all users
// //     const plainPassword = 'password@123';

// //     // Hash the password once
// //     const hashedPassword = await bcrypt.hash(plainPassword, 10);

// //     // Update the password for each user
// //     for (const user of users) {
// //         user.password = hashedPassword; // Set the password to the hashed value
// //         await user.save();  // Save the updated user
// //     }

// //     console.log("All user passwords updated to password@123 successfully!");
// // }

// // updatePasswords();


// // const axios = require('axios');

// // const fetchRandomImages = async () => {
// //   try {
// //     const res = await axios.get('https://api.unsplash.com/photos/random', {
// //       headers: {
// //         Authorization: 'Client-ID lgqJQJTEBeXngPhJRgpvaz-yg93vYVG9MctsbXOquME'
// //       },
// //       params: {
// //         count: 10,
// //         query: 'technology'
// //       }
// //     });
// //     console.log(res.data); // each item has a `urls` object
// //   } catch (err) {
// //     console.error(err.response.data);
// //   }
// // };

// // fetchRandomImages();


// const MONGODB_URI = "mongodb+srv://ramanjotsingh8574:7MXutNJqls4WgLfY@cluster0.4t7ydo5.mongodb.net/Wave";

// const UNSPLASH_KEYS = [
//   '5b9nGFjneREKT3BggABOWIB2WdWpwkhdqDmW_ouraVI', 'HsPd1AFO_I8-kiLyF9zSgnvYSHbroBd7_trOlHUL92g', 
//   'ZdkJsczSFkOvhPN6gX-whP0doGjuIURNk1c5P8SCoXY', 'fNiUUGFcvuFUk1VtVuItliXkcIhkB66k5SuRfGQDZQc',
//   'Y-wDxQ78LVbTavTDbW9Emxbarq7c2_Z-sXdYaVKSSTs', 'TNjI4he_TNfclFa7eCUoYYaazmQYWOkHOmbqw7M2EsM',
//   'fCxcAQLkwyq8tCp-RV29-2SYe5azsjMCsoAF0qPrZlw', 'xEt0dSyOkx8l59NTE3Yh1ZOsIphyWUq7plPoMLop4sM',
//   'ulWUXuWNSkgHe-NxDRIlJ7tyFG7c6zBDn3XM6YHAWek', 'Gw5DDBo666Rk76fzT2bQZ4ai9KMkvcfon12bmmGENKI',
//   'vNmlF6aOBf-8aM0cBdJwhrJoqgICsWm5wjYFGH2aP_8', 'ykygjnwst_W35mMl4pTeRhICnXGAE_kYqE0lIyztHOc',
//   'nxSCmPxchcL83xtV-Y08a7jbpqJnTYAGG2g6-XxYVTI', '2qn47_E4PrMVqa1Ik6v_eSmQF_lnRTVrNVf3HL33mb0',
//   'ruBC8Xz-Y7KOG2BPBN-np8hkk7TtDnwM4tqumXTZIf8', '45mFKvqhYNgf7_QGghSwWH0iqsPHzqKBqYO0775iy5E',
//   '8pK6rvdf9tfbS3JvYIvvE4t0GdOiGlmypWHULF1p_Ww', 'weP-U1-NzCfxqek0BKbLmBtmr40lCRz9wyr9SA0Kj_M',
//   'DSD9WXxMTkw8lATLt3psydM68WfWIyIRWxbItpQil3Q', 'WoaB7YrdmsMKvzaqZ_cUrOnc6a_PXCbZYkl5tcUC8io',
//   'd7mCtVTovS3S7Rq-GOpQwj68JsIJi-HMOq2PbDbB7Ak', '11RD8ciuWBY-eEGqJFVQPFZHA4BntqIb-ePlEVXVb5g',
//   'LuRSsXgXN_NvXnUhy2w5Nig_DCvS_RWInbYhHNaT0Eo', 'xByVYsisHMPz2DcpqrvHjlBTAo08aGnzswaSMlAOz24'
// ];

// const categories = {
//   Fitness: ["#gym", "#workout", "#fitlife", "#healthgoals", "#strength"],
//   Travel: ["#wanderlust", "#travelmore", "#vacationvibes", "#adventuretime"],
//   Food: ["#foodie", "#foodcravings", "#tasty", "#foodlovers"],
//   Fashion: ["#fashionfit", "#trendystyle", "#dailylook", "#wearitright"],
//   Tech: ["#codinglife", "#techupdates", "#developerlife", "#buildinpublic"],
//   Art: ["#createart", "#sketchtime", "#digitalart", "#artsyvibes"],
//   Music: ["#musicmood", "#nowplaying", "#songvibes", "#audiowave"],
//   Beauty: ["#glowup", "#beautyroutine", "#skingoals", "#makeuplove"],
//   Movies: ["#filmreview", "#moviemagic", "#cinemavibes", "#watchthis"],
//   Nature: ["#greenplanet", "#earthvibes", "#outdoorsoul", "#natureshots"],
//   General: ["#wave", "#vibe", "#connect", "#trendingonwave", "#wavecommunity"]
// };
// const allCategories = Object.keys(categories);

// let currentKeyIndex = 0;
// let usageCount = 0;

// async function fetchUnsplashImage(category) {
//   if (usageCount >= 50) {
//     currentKeyIndex++;
//     usageCount = 0;
//     if (currentKeyIndex >= UNSPLASH_KEYS.length) throw new Error("All keys exhausted");
//   }

//   const key = UNSPLASH_KEYS[currentKeyIndex];
//   try {
//     const res = await axios.get(
//       `https://api.unsplash.com/photos/random?query=${category}&orientation=squarish`,
//       {
//         headers: { Authorization: `Client-ID ${key}` }
//       }
//     );
//     usageCount++;
//     return res.data.urls?.regular || null;
//   } catch (err) {
//     console.error(`❌ Fetch failed [Key ${currentKeyIndex}] Category: ${category} — ${err.message}`);
//     return null;
//   }
// }

// async function updatePosts() {
//   await mongoose.connect(MONGODB_URI);
//   console.log("✅ Connected to MongoDB");

//   const posts = await Post.find().limit(1150);
//   console.log(`🔄 Updating ${posts.length} posts...`);

//   for (let i = 0; i < posts.length; i++) {
//     const post = posts[i];
//     const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
//     const hashtags = categories[randomCategory];
//     const imageUrl = await fetchUnsplashImage(randomCategory.toLowerCase());

//     if (imageUrl) {
//       post.image = imageUrl;
//       post.caption = faker.lorem.sentence() + " " + faker.helpers.shuffle(hashtags).slice(0, 2).join(" ");
//       await post.save();
//       console.log(`✅ [${i + 1}/${posts.length}] Updated post ID: ${post._id}`);
//     } else {
//       console.warn(`⚠️  [${i + 1}/${posts.length}] Skipped (image fetch failed)`);
//     }
//   }

//   console.log("🎉 All posts updated successfully.");
//   await mongoose.disconnect();
// }

// updatePosts().catch((err) => {
//   console.error("❌ Script failed:", err);
// });


// // ['QDT4WMI8XU-jU9Q_p8PTLsjK7bRjoBIA8a2ZWPVEK8s', 
// //     'xByVYsisHMPz2DcpqrvHjlBTAo08aGnzswaSMlAOz24',
// //         'ZdkJsczSFkOvhPN6gX-whP0doGjuIURNk1c5P8SCoXY', 
// //         'fNiUUGFcvuFUk1VtVuItliXkcIhkB66k5SuRfGQDZQc',
// //         'Y-wDxQ78LVbTavTDbW9Emxbarq7c2_Z-sXdYaVKSSTs',
// //         'TNjI4he_TNfclFa7eCUoYYaazmQYWOkHOmbqw7M2EsM',
// //         'fCxcAQLkwyq8tCp-RV29-2SYe5azsjMCsoAF0qPrZlw',
// //         'xEt0dSyOkx8l59NTE3Yh1ZOsIphyWUq7plPoMLop4sM',
// //         'ulWUXuWNSkgHe-NxDRIlJ7tyFG7c6zBDn3XM6YHAWek',
// //         'Gw5DDBo666Rk76fzT2bQZ4ai9KMkvcfon12bmmGENKI',
// //         'vNmlF6aOBf-8aM0cBdJwhrJoqgICsWm5wjYFGH2aP_8',
// //         'ykygjnwst_W35mMl4pTeRhICnXGAE_kYqE0lIyztHOc',
// //         'nxSCmPxchcL83xtV-Y08a7jbpqJnTYAGG2g6-XxYVTI',
// //         '2qn47_E4PrMVqa1Ik6v_eSmQF_lnRTVrNVf3HL33mb0',
// //         'ruBC8Xz-Y7KOG2BPBN-np8hkk7TtDnwM4tqumXTZIf8',
// //         '45mFKvqhYNgf7_QGghSwWH0iqsPHzqKBqYO0775iy5E',
// //         '8pK6rvdf9tfbS3JvYIvvE4t0GdOiGlmypWHULF1p_Ww',
// //         'weP-U1-NzCfxqek0BKbLmBtmr40lCRz9wyr9SA0Kj_M',
// //         'DSD9WXxMTkw8lATLt3psydM68WfWIyIRWxbItpQil3Q',
// //         'WoaB7YrdmsMKvzaqZ_cUrOnc6a_PXCbZYkl5tcUC8io',
// //         'd7mCtVTovS3S7Rq-GOpQwj68JsIJi-HMOq2PbDbB7Ak',
// //         '11RD8ciuWBY-eEGqJFVQPFZHA4BntqIb-ePlEVXVb5g',
// //         'LuRSsXgXN_NvXnUhy2w5Nig_DCvS_RWInbYhHNaT0Eo'
    
// //     ]
