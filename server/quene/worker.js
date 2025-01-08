const { Worker } = require('bullmq');
const { convertToAdaptiveStreaming, deleteLocalFolder, deleteLocalFile } = require('../service/adaptiveUpload.service');
const { REDIS_CONNECTION } = require('../confgis/redis-connection.config');
const { notificationQuene } = require('./quene');
const UserModal = require("../mongo-schema/user.schema");
const VideoModal = require("../mongo-schema/video.schema");
const NotificationModal = require('../mongo-schema/notification.schema');
const mongoose = require("mongoose");
const { sendSystemMail } = require('../service/smtp.service');
const { messaging } = require('../confgis/firebase-admin.config');
const { ObjectId } = mongoose.Types;

const videoWorker = new Worker('video-processing', async (job) => {
  const { file, outputPath, userId, s3Path, videoId, fileName } = job.data;

  try {
    await convertToAdaptiveStreaming(file, outputPath, s3Path);
    console.log(`Video conversion for user ${userId} is completed.`);

    await VideoModal.updateOne({ _id: new ObjectId(videoId) }, { $set: { uploadStatus: 'COMPLETED' } });

    // adding notification to the quene............
    await notificationQuene.add('send-notification', {
      fileName,
      userId
    });

    // deleting local folder..........
    deleteLocalFolder(outputPath);
    deleteLocalFile(file.path.toString());
  } catch (error) {
    console.error('Error during video conversion:', error);
    await VideoModal.updateOne({ _id: new ObjectId(videoId) }, { $set: { uploadStatus: 'PROCESSING' } });
    await retryVideoWorker(job);
  }
}, {
  connection: REDIS_CONNECTION
});

const notificationWorker = new Worker('send-notification', async (job) => {
  const { fileName, userId } = job.data;

  try {
    const userInfo = await UserModal.findById(String(userId), { firebaseDeviceToken: 1, email: 1 }).lean();

    if (!userInfo) return;

    const message = {
      token: userInfo.firebaseDeviceToken,
      notification: {
        title: "Video Uploded",
        body: `${fileName} uploaded successfully`,
      },
    };

    const res = await NotificationModal.create({
      subject: "Video Uploded",
      message: `Video titled as ${fileName} uploaded successfully`,
      userId,
    })

    // sending push notification to the user....
    const response = await messaging.send(message);
    // sending email notification to the user....
    const payload = {
      subject: 'Video Uploaded',
      to: userInfo.email,
      html: `<h1>Video Uploaded</h1>
      <p>Your video has been uploaded successfully.</p>
      <p>Thanks,<br />
      <strong>Team Vid-cn</strong></p>`
    };

    await sendSystemMail(payload);
    console.log('Notification sent successfully:', response);
  } catch (error) {
    console.error('Error during notification sending:', error);
  }
}, {
  connection: REDIS_CONNECTION
});

const retryVideoWorker = async (job) => {
  const { file, outputPath, userId, s3Path, videoId, fileName } = job.data;

  try {
    const videoInfo = await VideoModal.findById(String(videoId), { uploadStatus: 1, userId: 1, retries: 1 }).lean();

    if (!videoInfo) return;
    if (videoInfo.retries > 3) return;

    await VideoModal.updateOne({ _id: new ObjectId(videoId) }, { $set: { uploadStatus: 'PROCESSING' } });

    // adding video to the quene............
    await videoQuene.add('video-processing', {
      file: file,
      outputPath: outputPath,
      userId,
      s3Path: s3Path,
      videoId,
      fileName: fileName
    });
  }
  catch (error) {
    console.error('Error during retry video:', error);
  }
}


module.exports = { videoWorker, notificationWorker };

// "360p": "http://localhost:9000/uploads/courses/sonic@1234/stream_360p.m3u8", // Replace with actual URLs
// "720p": "http://localhost:9000/uploads/courses/sonic@1234/stream_720p.m3u8", // Replace with actual URLs
// "1080p": "http://localhost:9000/uploads/courses/sonic@1234/stream_1080p.m3u8", // Replace with actual URLs
