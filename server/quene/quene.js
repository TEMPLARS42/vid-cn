const { Queue } = require('bullmq');
const { REDIS_CONNECTION } = require('../confgis/redis-connection.config');

const videoQueue = new Queue('video-processing', {
  connection: REDIS_CONNECTION
});

const notificationQuene = new Queue('send-notification', {
  connection: REDIS_CONNECTION
});

module.exports = { videoQueue, notificationQuene };
