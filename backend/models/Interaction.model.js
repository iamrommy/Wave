// models/UserPostInteraction.js

const mongoose = require('mongoose');

const userPostInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  score: {
    type: Number,
    default: 0
  }
});

userPostInteractionSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model('UserPostInteraction', userPostInteractionSchema);
