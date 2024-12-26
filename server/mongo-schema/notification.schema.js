const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    message: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    isUnread: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } });

const Notification = mongoose.model('notification', notificationSchema);

module.exports = Notification;
