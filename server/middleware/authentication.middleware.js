const UserModal = require('../mongo-schema/user.schema');
const LoginTokenModal = require('../mongo-schema/login-token.schema');
const { generateRandomString } = require('../utils/crypto.util');
const { log } = require('../utils/logger.util');
const JWT = require('jsonwebtoken');
const { JWT_SECRET_KEY } = process.env;
const rateLimit = require('express-rate-limit');

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const refreshToken = req.cookies?.refresh_token;

        if (token) {
            let decodedToken = null;
            let findObject = {};

            // session expiration check...................
            try {
                decodedToken = JWT.decode(token, JWT_SECRET_KEY);
                JWT.verify(token, JWT_SECRET_KEY);

                findObject = { accessToken: decodedToken.token }
            } catch (error) {
                if (refreshToken) {
                    try {
                        JWT.verify(refreshToken, JWT_SECRET_KEY);

                        // creating and setting new access token................
                        const accessToken = generateRandomString(32)
                        const signedAccessToken = JWT.sign({ token: accessToken }, JWT_SECRET_KEY, { expiresIn: '1h' });

                        await LoginTokenModal.updateOne({ accessToken: decodedToken.token }, { $set: { accessToken: accessToken } });

                        res.setHeader('echo', `${signedAccessToken}`);

                        findObject = { accessToken: accessToken }
                    } catch (error) {
                        if (decodedToken?.token) await removeLoginTokens(decodedToken.token)
                        res.clearCookie('refresh_token', { path: '/' });
                        return res.status(401).send({ status: "TERMINATE" })
                    }
                } else {
                    if (decodedToken?.token) await removeLoginTokens(decodedToken.token)
                    res.clearCookie('refresh_token', { path: '/' });
                    return res.status(401).send({ status: "TERMINATE" })
                }
            }

            const loginTokenInfo = await LoginTokenModal.findOne(findObject).lean();

            /****************************** validations ************************ */
            if (!loginTokenInfo) {
                await removeLoginTokens(decodedToken.token)
                res.clearCookie('refresh_token', { path: '/' });
                return res.status(401).send({ status: "TERMINATE" })
            }

            const user = await UserModal.findById(loginTokenInfo.userId).lean();

            if (!user) {
                await removeLoginTokens(decodedToken.token)
                res.clearCookie('refresh_token', { path: '/' });
                return res.status(401).send({ status: "TERMINATE" })
            }

            req['user'] = user;
            req['userId'] = user._id.toString();
            req['loginTokenId'] = loginTokenInfo._id;
            next();
        } else {
            res.clearCookie('refresh_token', { path: '/' });
            return res.status(401).send({ status: "TERMINATE" })
        }
    } catch (error) {
        log(error, { headers: req.headers });
        res.clearCookie('refresh_token', { path: '/' });
        return res.status(401).send({ status: "TERMINATE" })
    }
}

const removeLoginTokens = async (accessToken) => {
    await LoginTokenModal.deleteOne({ accessToken: accessToken })
}

const signUpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many signup attempts from this IP, please try again later',
  });

module.exports = {
    authenticate,
    signUpLimiter
};
