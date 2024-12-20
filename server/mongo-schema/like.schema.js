const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } });

const Like = mongoose.model('like', likeSchema);
module.exports = Like;


