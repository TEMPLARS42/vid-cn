const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    thumbnail: { type: String },
    path: { type: String },
    uploadStatus: { type: String, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'ERROR'], default: 'PENDING' },
    isArchived: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    description: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    createdBy: { type: String }
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } });

const Video = mongoose.model('video', videoSchema);

module.exports = Video;
