const express = require('express');
const router = express.Router();
const upload = require("../utils/multer.util");
const authenticationController = require("../controller/authentication.controller");
const videoProcessingController = require("../controller/video-processing.controller");
const notificationController = require("../controller/notification.controller");
const { authenticate, signUpLimiter } = require('../middleware/authentication.middleware');

// authenticarion routes
router.post('/signup', signUpLimiter, authenticationController.handleSignUp)
router.post('/login', signUpLimiter, authenticationController.handleLogin)
router.post('/oauth-login', signUpLimiter, authenticationController.handleOauthLogin)
router.post('/logout', signUpLimiter, authenticationController.handleLogout)
router.post('/forgot-password', signUpLimiter, authenticationController.handleForgotPassword)
router.post('/reset-password', signUpLimiter, authenticationController.handleResetPassword)
router.post('/session', authenticate, authenticationController.createSession)
router.post('/subscribe-notifications', authenticate, authenticationController.subscribeNotifications)

// video processing routes
router.get('/', (req, res) => res.send({ message: "success" }))
router.get('/upload-status', authenticate, videoProcessingController.getUploadStatus)
router.get('/videos', authenticate, videoProcessingController.fetchVideos)
router.get('/video/:videoId', authenticate, videoProcessingController.fetchVideoById)
router.post('/upload', upload.array('files'), authenticate, videoProcessingController.handleUpload)
router.post('/like', authenticate, videoProcessingController.handleVideoLiked);
router.post('/dislike', authenticate, videoProcessingController.handleVideoDisliked);
router.patch('/mark-read', authenticate, videoProcessingController.handleVideoMarked);
router.get('/comments', authenticate, videoProcessingController.fetchComments);
router.post('/comment', authenticate, videoProcessingController.handleVideoCommented);
router.patch('/comment-like', authenticate, videoProcessingController.handleCommentLiked);

router.post('/generate-description', authenticate, videoProcessingController.generateDescription);

// Notification routes
router.get('/notifications', authenticate, notificationController.fetchNotifications);


router.post('/save-user', () => { })

module.exports = router;
