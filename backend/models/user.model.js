const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: '' },
    bio: { type: String, default: '' },
    gender: { type: String, enum: ['male', 'female'] },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
        value: { type: Number, min: 0, max: 10 } 
      }
    ],
    averageRating: { type: Number, default: 0 }
  }, { timestamps: true });
  

const User = mongoose.model('User', userSchema);

module.exports = User;
