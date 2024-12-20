const mongoose = require('mongoose');

const commentLikeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'commen' },
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } });

const CommentLike = mongoose.model('comment-like', commentLikeSchema);
module.exports = CommentLike;


