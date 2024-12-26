const NotificationModal = require('../mongo-schema/notification.schema');
const LoginTokenModal = require('../mongo-schema/login-token.schema');
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const fetchNotifications = async (req, res) => {
    try {
        const { userId } = req;
        const { limit, skip } = req.query;
        const notifications = await NotificationModal.aggregate([
            {
                $match: {
                    userId: new ObjectId(userId)
                }
            },
            { $sort: { createdOn: -1 } },
            { $skip: parseInt(skip) },
            { $limit: parseInt(limit) },
        ])

        res.status(200).send({ notifications });
    }
    catch (error) {
        console.log(error);
    }
}

module.exports = {
    fetchNotifications
}