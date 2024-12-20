const express = require('express');
const router = express.Router();
const upload = require("../utils/multer.util");
const authenticationController = require("../controller/authentication.controller");
const videoProcessingController = require("../controller/video-processing.controller");
const notificationController = require("../controller/notification.controller");
const { authenticate } = require('../middleware/authentication.middleware');

// authenticarion routes
router.post('/signup', authenticationController.handleSignUp)
router.post('/login', authenticationController.handleLogin)
router.post('/oauth-login', authenticationController.handleOauthLogin)
router.post('/logout', authenticationController.handleLogout)
router.post('/forgot-password', authenticationController.handleForgotPassword)
router.post('/reset-password', authenticationController.handleResetPassword) 
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

// Notification routes
router.get('/notifications', authenticate, notificationController.fetchNotifications);


router.post('/save-user', () => { })

module.exports = router;
