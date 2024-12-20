const multer = require('multer');
const generateFileName = () => `playground-${Date.now()}${Math.round(Math.random() * 1e4)}`

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads")
    },
    filename: function (_req, file, cb) {
        const extension = file.originalname.split('.').pop();
        const fileNameWithExtension = generateFileName() + `${extension ? '.' + extension : ''}`;
        file.ext = extension
        cb(null, fileNameWithExtension);
    },
});

const upload = multer({
    storage,
});

module.exports = upload
