const NodeMailer = require('nodemailer');
const { log } = require('../utils/logger.util');
const { MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, NODE_ENV } = process.env

const connection = NodeMailer.createTransport({
    host: MAIL_HOST,
    port: MAIL_PORT,
    secure: true,
    auth: {
        user: MAIL_USERNAME,
        pass: MAIL_PASSWORD,
    },
});

const sendSystemMail = async ({ to, subject, html, attachments, cc, bcc }) => {
    try {
        await connection.sendMail({ from: MAIL_USERNAME, to, subject, html, cc, bcc, attachments })

        if (NODE_ENV === 'development') console.log("Email Send Successfully")
        return { success: true }
    } catch (error) {
        log(error, { to, subject, html, attachments, cc });
        return { success: false }
    }
}

module.exports = {
    sendSystemMail
}