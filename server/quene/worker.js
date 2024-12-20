const { Worker } = require('bullmq');
const { convertToAdaptiveStreaming } = require('../service/adaptiveUpload.service');
const { REDIS_CONNECTION } = require('../confgis/redis-connection.config');
const { notificationQuene } = require('./quene');
const UserModal = require("../mongo-schema/user.schema");
const VideoModal = require("../mongo-schema/video.schema");
const NotificationModal = require('../mongo-schema/notification.schema');
const mongoose = require("mongoose");
const { sendSystemMail } = require('../service/smtp.service');
const { ObjectId } = mongoose.Types;

const videoWorker = new Worker('video-processing', async (job) => {
  const { file, outputPath, userId, s3Path } = job.data;

  try {
    await convertToAdaptiveStreaming(file, outputPath, s3Path);
    // console.log(`Video conversion for user ${userId} is completed.`);

    setTimeout(() => {
      console.log(`Video conversion for user ${userId} is completed.`);
    }, 5000)

    VideoModal.updateOne({ _id: new ObjectId(videoId) }, { $set: { uploadStatus: 'COMPLETED' } });

    // adding notification to the quene............
    await notificationQuene.add('send-notification', {
      fileName: req.files[0].originalname,
      userId
    });
  } catch (error) {
    console.error('Error during video conversion:', error);
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

    await NotificationModal.create({
      subject: "Video Uploded",
      message: `${fileName} uploaded successfully`,
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

module.exports = { videoWorker, notificationWorker };

// "360p": "http://localhost:9000/uploads/courses/sonic@1234/stream_360p.m3u8", // Replace with actual URLs
// "720p": "http://localhost:9000/uploads/courses/sonic@1234/stream_720p.m3u8", // Replace with actual URLs
// "1080p": "http://localhost:9000/uploads/courses/sonic@1234/stream_1080p.m3u8", // Replace with actual URLs
