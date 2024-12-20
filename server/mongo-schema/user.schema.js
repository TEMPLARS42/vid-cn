const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    type: { type: String, required: true, enum: ["local", "oauth"] },
    oauthId: { type: String }, // for oauth users
    firebaseDeviceToken: { type: String },
    profilePicture: { type: String, default: "" },
    resetPasswordToken: { type: String },
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } });

const User = mongoose.model('user', userSchema);

module.exports = User;
