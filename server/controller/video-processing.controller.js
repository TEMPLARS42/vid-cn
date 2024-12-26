const UserModal = require('../mongo-schema/user.schema');
const VideoModal = require('../mongo-schema/video.schema');
const NotificationModal = require('../mongo-schema/notification.schema');
const CommentModal = require('../mongo-schema/comment.schema');
const CommentLikeModal = require('../mongo-schema/comment-like.schema');
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const { videoQueue } = require('../quene/quene');
const { generateRandomString } = require("../utils/crypto.util");
const { captureThumbnail, deleteLocalFile } = require('../service/adaptiveUpload.service');
const { createFile } = require('../service/appwrite.service');
const { messaging } = require('../confgis/firebase-admin.config');
const LikeModal = require("../mongo-schema/like.schema");
const DislikeModal = require("../mongo-schema/dislike.schema");
const path = require('path');
const { generatePublicS3Url } = require('../service/s3Helper.service');

const handleUpload = async (req, res) => {
    try {
        const { userId, user, body } = req;
        const data = JSON.parse(body.data);
        const uniqueVideoName = generateRandomString(16);
        const actualPath = `/uploads/videos/${userId}`;
        const outputPath = `.${actualPath}/${uniqueVideoName}`;
        const s3Path = `uploads/videos/${userId}/${uniqueVideoName}`;

        // thumbnail creation.................
        const thumbnailLocalPath = `${outputPath}/${generateRandomString(32)}-thumbnail.jpg`;
        const fileNameWithoutExt = path.basename(req.files[0].originalname, path.extname(req.files[0].originalname,));
        await captureThumbnail(req.files[0], thumbnailLocalPath, outputPath);
        const thumbnailUrl = await createFile(thumbnailLocalPath, fileNameWithoutExt);
        deleteLocalFile(thumbnailLocalPath);

        const videoInfo = await VideoModal.create(
            {
                title: data.title,
                description: data.description,
                path: s3Path,
                uploadStatus: 'PROCESSING',
                thumbnail: thumbnailUrl,
                userId,
                createdBy: user.name
            });

        // Add job to BullMQ queue
        await videoQueue.add('video-processing', {
            file: req.files[0],
            outputPath,
            s3Path,
            fileName: fileNameWithoutExt,
            videoId: videoInfo._id,
            userId
        });

        // Respond immediately, job will be processed in background
        res.status(200).send({ message: 'Video is being processed. You will be notified once completed.' });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Video processing failed.' });
    }
};

const getUploadStatus = async (req, res) => {
    try {
        const { userId } = req;

        const { uploadStatus } = await UserModal.findOne({ _id: new ObjectId(userId) }, { uploadStatus: 1 }).lean();

        res.status(200).send({ uploadStatus });
    }
    catch (error) {
        console.log(error);
    }
}

const fetchVideos = async (req, res) => {
    try {
        const { limit, skip, search } = req.query;
        const videos = await VideoModal.aggregate([
            {
                $match: {
                    isArchived: false,
                    $or: [
                        { title: { $regex: search, $options: 'i' } },
                    ]
                }
            },
            { $sort: { createdOn: -1, _id: 1 } },
            { $skip: parseInt(skip) },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'createdByInfo'
                }
            },
            {
                $unwind: {
                    path: '$createdByInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    title: 1,
                    thumbnail: 1,
                    views: 1,
                    createdBy: 1,
                    uploadStatus: 1,
                    profilePicture: "$createdByInfo.profilePicture",
                }
            }
        ])

        res.status(200).send({ videos });
    }
    catch (error) {
        console.log(error);
    }
}


const fetchVideoById = async (req, res) => {
    try {
        const { videoId } = req.params;
        // increase view count as well.....
        const videoInfo = await VideoModal.findOneAndUpdate({ _id: videoId }, { $inc: { views: 1 } }, { new: true });
        const videoCreatorInfo = await UserModal.findOne({ _id: videoInfo.userId }, { profilePicture: 1 }).lean();
        const isLiked = await LikeModal.exists({ videoId, userId: req.user._id });
        const isDisliked = await DislikeModal.exists({ videoId, userId: req.user._id, });

        res.status(200).send({
            videoInfo: {
                ...videoInfo.toObject(),
                isLiked: !!isLiked,
                isDisliked: !!isDisliked,
                profilePicture: videoCreatorInfo.profilePicture,
                path: generatePublicS3Url(videoInfo.path)
            }
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal server error" });
    }
}

const handleVideoLiked = async (req, res) => {
    try {
        const { userId } = req;
        const { videoId, action } = req.body;

        if (JSON.parse(action)) {
            await LikeModal.create({
                userId,
                videoId
            });
        }
        else {
            await LikeModal.deleteOne({ userId, videoId });
        }

        await VideoModal.updateOne({ _id: videoId }, { $inc: { likes: JSON.parse(action) ? 1 : -1 } });
        res.status(200).send({ message: 'Video liked successfully' });

    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

const handleVideoDisliked = async (req, res) => {
    try {
        const { userId } = req;
        const { videoId, action } = req.body;

        if (JSON.parse(action)) {
            await DislikeModal.create({
                userId,
                videoId
            });
        }
        else {
            await DislikeModal.deleteOne({ userId, videoId });
        }

        await VideoModal.updateOne({ _id: videoId }, { $inc: { dislikes: JSON.parse(action) ? 1 : -1 } });
        res.status(200).send({ message: 'Video Disliked successfully' });

    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

const handleVideoMarked = async (req, res) => {
    try {
        const { userId } = req;
        const { notificationId, markAllRead } = req.body;

        if (JSON.parse(markAllRead)) {
            await NotificationModal.updateMany({ userId }, { isUnread: false });
        }
        else {
            await NotificationModal.updateOne({ _id: new ObjectId(notificationId) }, { isUnread: false });
        }

        res.status(200).send({});

    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

const sendNotification = async (token, notification) => {
    try {
        const userInfo = await UserModal.findOne({ _id: new ObjectId("6744cdb27abf86d90d83acb3") }, { firebaseDeviceToken: 1 }).lean();
        const message = {
            token: userInfo.firebaseDeviceToken,
            notification: {
                title: "it is",
                body: "the body",
            },
        };
        const response = await messaging.send(message);
        console.log('Notification sent successfully:', response);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

const fetchComments = async (req, res) => {
    try {
        const { userId } = req;
        const { videoId, limit, skip } = req.query;
        const comments = await CommentModal.aggregate([
            {
                $match: {
                    videoId: new ObjectId(videoId)
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: parseInt(skip) },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'createdByInfo'
                }
            },
            {
                $unwind: {
                    path: '$createdByInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    text: 1,
                    videoId: 1,
                    userId: 1,
                    createdBy: 1,
                    createdOn: 1,
                    likes: 1,
                    profilePicture: "$createdByInfo.profilePicture",
                }
            }
        ]);

        for (let comment of comments) {
            const isLiked = await CommentLikeModal.exists({ commentId: comment._id, userId: new ObjectId(userId) });
            comment.isLiked = !!isLiked;
        }

        res.status(200).send({ comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
}

const handleVideoCommented = async (req, res) => {
    try {
        const { userId } = req;
        const { videoId, text } = req.body;

        const comment = await CommentModal.create({
            userId,
            videoId,
            text,
            createdBy: req.user.name
        });

        res.status(200).send({ comment });

    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

const handleCommentLiked = async (req, res) => {
    try {
        const { userId } = req;
        const { commentId, action } = req.body;

        if (JSON.parse(action)) {
            await CommentModal.updateOne({ _id: commentId }, { $inc: { likes: 1 } });
            await CommentLikeModal.create({
                userId,
                commentId
            });
        }
        else {
            await CommentModal.updateOne({ _id: commentId }, { $inc: { likes: -1 } });
            await CommentLikeModal.deleteOne({ userId, commentId });
        }

        res.status(200).send({});

    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

// sendNotification()


module.exports = {
    handleUpload,
    getUploadStatus,
    fetchVideos,
    fetchVideoById,
    sendNotification,
    handleVideoLiked,
    handleVideoDisliked,
    handleVideoMarked,
    handleVideoCommented,
    fetchComments,
    handleCommentLiked
}
