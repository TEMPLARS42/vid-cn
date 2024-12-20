const UserModal = require('../mongo-schema/user.schema');
const NotificationModal = require('../mongo-schema/notification.schema');
const LoginTokenModal = require('../mongo-schema/login-token.schema');
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const bcrypt = require('bcrypt');
const { generateRandomString } = require("../utils/crypto.util");
const JWT = require('jsonwebtoken');
const { sendSystemMail } = require('../service/smtp.service');
const { JWT_SECRET_KEY, CLIENT_BASE_URL } = process.env;

const handleSignUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // encrypting passowrd..........
        const isUserExists = await UserModal.exists({ email });
        if (isUserExists) return res.status(401).send({ message: 'User already exists.' });

        const encryptedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
        const user = await UserModal.create({ name, email, password: encryptedPassword });

        return res.status(200).send({ message: "Signed up successfull" })
    }
    catch (error) {
        console.log(error);
    }
}

const handleOauthLogin = async (req, res) => {
    try {
        const { email, oauthId, name, profilePicture, rememberMe } = req.body;

        if (!email || !oauthId || !name) return res.status(401).send({ message: 'Invalid request.' });
        const isLocalUserExists = await UserModal.exists({ email, type: "local" });
        if (isLocalUserExists) return res.status(401).send({ message: 'USER_EXISTS' });

        let userInfo = null;
        const isOauthUserExists = await UserModal.findOne({ email, type: "oauth", oauthId }).lean();
        if (isOauthUserExists) userInfo = isOauthUserExists;
        else {
            userInfo = await UserModal.create({ name, email, type: "oauth", oauthId, profilePicture });
        }

        const accessToken = generateRandomString(32)
        const refreshToken = generateRandomString(32)

        const signedAccessToken = JWT.sign({ token: accessToken }, JWT_SECRET_KEY, { expiresIn: '1h' });
        let signedRefreshToken = null;

        if (rememberMe) {
            signedRefreshToken = JWT.sign({ token: refreshToken }, JWT_SECRET_KEY);
        }

        await LoginTokenModal.create({
            userId: userInfo._id,
            accessToken,
            refreshToken: rememberMe ? refreshToken : null,
            useragent: req.headers['user-agent']
        });

        const unreadNotificationCount = await NotificationModal.countDocuments({ userId: userInfo._id, isUnread: true });

        return res.status(200).send({ user: { ...userInfo, unreadNotificationCount }, token: signedAccessToken, refreshToken: signedRefreshToken });
    }
    catch (error) {
        console.log(error);
    }
}

const handleLogin = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        const userInfo = await UserModal.findOne({ email }).lean();
        if (!userInfo) return res.status(401).send({ message: 'Invalid email or password.' });

        // decrypting password..........
        const decryptedPassword = await bcrypt.compare(password, userInfo.password);
        if (!decryptedPassword) return res.status(401).send({ message: 'Invalid email or password.' });

        const accessToken = generateRandomString(32)
        const refreshToken = generateRandomString(32)

        const signedAccessToken = JWT.sign({ token: accessToken }, JWT_SECRET_KEY, { expiresIn: '1h' });
        let signedRefreshToken = null;

        if (rememberMe) {
            signedRefreshToken = JWT.sign({ token: refreshToken }, JWT_SECRET_KEY);
        }

        await LoginTokenModal.create({
            userId: userInfo._id,
            accessToken,
            refreshToken: rememberMe ? refreshToken : null,
            useragent: req.headers['user-agent']
        });

        const unreadNotificationCount = await NotificationModal.countDocuments({ userId: userInfo._id, isUnread: true });

        return res.status(200).send({ user: { ...userInfo, unreadNotificationCount }, token: signedAccessToken, refreshToken: signedRefreshToken });
    }
    catch (error) {
        console.log(error);
    }
}


const createSession = async (req, res) => {
    try {
        const { userId } = req;
        const userInfo = await UserModal.findOne({ _id: new ObjectId(userId) }, { name: 1, email: 1, type: 1, profilePicture: 1 }).lean();
        const unreadNotificationCount = await NotificationModal.aggregate([
            {
                $match: {
                    userId: new ObjectId(userId),
                    isUnread: true
                }
            }
        ])
        // const unreadNotificationCount = await NotificationModal.find({ userId: new ObjectId(userId), isUnread: true }).lean();
        // console.log(unreadNotificationCount, "pppp", { userId: new ObjectId(userId), isUnread: true })
        res.status(200).send({ userInfo: { ...userInfo, unreadNotificationCount: unreadNotificationCount.length } });
    }
    catch (error) {
        console.log(error);
    }
}

const subscribeNotifications = async (req, res) => {
    try {
        const { userId } = req;
        const { deviceToken } = req.body;

        if (userId) {
            await UserModal.updateOne({ _id: new ObjectId(userId) }, { $set: { firebaseDeviceToken: deviceToken } });
            return res.status(200).send({});
        }
        else return res.status(401).send({});
    }
    catch (error) {
        console.log(error);
    }
}

const handleLogout = async (req, res) => {
    try {
        const token = req.headers.authorization;

        if (token) {
            const decodedToken = JWT.decode(token, JWT_SECRET_KEY);
            if (decodedToken.token) {
                await LoginTokenModal.deleteOne({ accessToken: decodedToken.token });
            }
        }

        res.clearCookie('refresh_token', { path: '/' });
        return res.status(200).send({});
    } catch (error) {
        return res.status(500).send({ message: "Internal server error" })
    }
}

const handleForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const userInfo = await UserModal.findOne({ email }).lean();
        if (!userInfo) return res.status(401).send({ message: 'Invalid email or password.' });

        const encryptedString = await bcrypt.hash(`${generateRandomString(32)}-${userInfo._id}`, await bcrypt.genSalt(10));
        const token = JWT.sign({ resetPasswordToken: encryptedString }, JWT_SECRET_KEY);

        const payload = {
            subject: 'Reset Password',
            to: email,
            html: `<h1>Reset Password</h1>
            <p>Please click the following link to reset your password.</p>
            <p><a href="${CLIENT_BASE_URL}/reset-password/${token}">Reset Password</a></p>
            <p>If you did not request a password reset, please ignore this email.</p>
            <p>Thanks,<br />
            <strong>Team Vid-cn</strong></p>`
        };

        await UserModal.updateOne({ email }, { $set: { resetPasswordToken: encryptedString } });
        await sendSystemMail(payload);

        return res.status(200).send({ message: 'Password reset link send successfully.' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal server error" })
    }
}

const handleResetPassword = async (req, res) => {
    try {
        const { password, token } = req.body;

        const decodedToken = JWT.decode(token, JWT_SECRET_KEY).resetPasswordToken;

        const userInfo = await UserModal.findOne({ resetPasswordToken: decodedToken }, { password: 1 }).lean();
        if (!userInfo) return res.status(401).send({ message: 'Invalid token.' });

        const isSamePassword = await bcrypt.compare(password, userInfo.password);
        if (isSamePassword) return res.status(401).send({ message: 'New password can not be same as old password.' });

        const encryptedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
        await UserModal.updateOne({ _id: new ObjectId(userId) }, { $set: { password: encryptedPassword }, $unset: { resetPasswordToken: 1 } });

        return res.status(200).send({ message: 'Password updated successfully.' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal server error" })
    }
}

module.exports = {
    handleSignUp,
    handleLogin,
    createSession,
    subscribeNotifications,
    handleOauthLogin,
    handleLogout,
    handleForgotPassword,
    handleResetPassword
}
