const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const { S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY, S3_COMMON_BUCKET, S3_BUCKET } = process.env

// Configure AWS SDK with your credentials and region
const s3Client = new S3Client({
    region: S3_REGION,  // Replace with your AWS region
    credentials: {
        accessKeyId: S3_ACCESS_KEY,   // Replace with your AWS access key
        secretAccessKey: S3_SECRET_KEY,   // Replace with your AWS secret key
    }
});

// Bucket name and folder path
const bucketName = S3_BUCKET; // Replace with your S3 bucket name

// Function to upload a single file to S3
const uploadFile = async (filePath, s3Folder) => {
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const params = {
        Bucket: bucketName,
        Key: `${s3Folder}/${fileName}`,  // S3 path
        Body: fileContent,
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        console.log(`Successfully uploaded ${fileName}`);
    } catch (error) {
        console.error(`Error uploading ${fileName}:`, error);
    }
};

// Function to recursively upload a folder to S3
const uploadFolderToS3 = async (folderPath, s3Folder = '') => {
    const files = await fse.readdir(folderPath);

    for (const file of files) {
        const fullPath = path.join(folderPath, file);
        const stats = fs.statSync(fullPath);

        if (stats.isFile()) {
            // Upload file
            await uploadFile(fullPath, s3Folder);
        } else if (stats.isDirectory()) {
            // Recursively upload subfolders
            await uploadFolderToS3(fullPath, `${s3Folder}/${file}`);
        }
    }
};

const generatePublicS3Url = (path) => `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${path}/master.m3u8`;

module.exports = {
    uploadFolderToS3,
    uploadFile,
    generatePublicS3Url
}
