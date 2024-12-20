const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    message: { type: String },
    userId: { type: String },
    isUnread: { type: Boolean, default: true }
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } });

const Notification = mongoose.model('notification', notificationSchema);

module.exports = Notification;
