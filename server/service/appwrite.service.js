const { Client, Storage, InputFile } = require('node-appwrite')
const { APPWRITE_END_POINT, APPWRITE_PROJECT_ID, APPWRITE_BUCKET_ID } = process.env;

const client = new Client()
    .setEndpoint(APPWRITE_END_POINT)
    .setProject(APPWRITE_PROJECT_ID);

const storage = new Storage(client);

const createFile = async (filePath, fileName) => {
    try {

        const fileStream = InputFile.fromPath(filePath, fileName)
        
        const uploadedFile = await storage.createFile(
            APPWRITE_BUCKET_ID,
            fileName,
            fileStream
        );
        
        return fetchStreamableUrl(APPWRITE_BUCKET_ID, uploadedFile.$id);
    }
    catch (error) {
        console.log(error);
        return new Error();
    }
}

// Function to fetch a file
async function fetchFile(bucketId, fileId) {
    try {
        // Get the file
        const response = await storage.getFile(bucketId, fileId);
        console.log(response, "pppp")

    } catch (error) {
        console.error('Error fetching the file:', error);
    }
}

const fetchStreamableUrl = (bucketId, fileId) => {
    const endpoint = APPWRITE_END_POINT;
    const projectId = APPWRITE_PROJECT_ID

    // Constructing the URL
    const url = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
    return url;
};

// fetchStreamableUrl('6640dfe70035f7d0ab84','VID-20240614-WA0000.mp4')

module.exports = {
    createFile,
    fetchFile,
    fetchStreamableUrl
}
