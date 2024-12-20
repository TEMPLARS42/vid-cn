const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'video' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    likes: { type: Number, default: 0 },
    createdBy: { type: String }
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } });

const Comment = mongoose.model('comment', commentSchema);

module.exports = Comment;
