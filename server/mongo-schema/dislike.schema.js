const mongoose = require('mongoose');

const dislikeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } });

const Dislike = mongoose.model('dislike', dislikeSchema);
module.exports = Dislike;
