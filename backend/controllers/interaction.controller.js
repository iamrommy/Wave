const UserPostInteraction = require('../models/Interaction.model');

const updateInteractionScore = async (userId, postId, actionType) => {
  let weight = 0;

  if (actionType === 'like') weight = 1;
  else if (actionType === 'comment') weight = 2;
  else if (actionType === 'bookmark') weight = 3;
  else if (actionType === 'dislike') weight = -1;
  else if (actionType === 'uncomment') weight = -2;
  else if (actionType === 'unbookmark') weight = -3;

  try {
    await UserPostInteraction.findOneAndUpdate(
      { userId, postId },
      { $inc: { score: weight } },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('Error updating interaction score:', err);
  }
};

module.exports = updateInteractionScore;
