const mongoose = require('mongoose');

const loginTokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true },
    accessToken: { type: String, index: true },
    refreshToken: { type: String, index: true },
    useragent: { type: String }
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } });

const User = mongoose.model('loginToken', loginTokenSchema);

module.exports = User;
