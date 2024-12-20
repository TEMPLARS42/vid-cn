const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require('fs');
const { uploadFolderToS3 } = require('./s3Helper.service');

// Helper function to generate HLS streams at different resolutions
const generateHLSStream = (file, outputPath, resolution, hlsPath, videoBitrate, size) => {
    return new Promise((resolve, reject) => {
        ffmpeg(file.path.toString())
            .outputOptions([
                '-codec:v libx264',       // Video codec (H.264)
                `-b:v ${videoBitrate}`,   // Bitrate for the video stream
                '-codec:a aac',           // Audio codec (AAC)
                '-hls_time 10',           // Segment duration (10 seconds)
                '-hls_playlist_type vod', // VOD playlist type
                `-hls_segment_filename ${outputPath}/segment_${resolution}_%03d.ts`, // Naming pattern for segments
                '-start_number 0',        // Start segment numbering at 0
                `-vf scale=${size}`       // Scale the video to the target resolution
            ])
            .on('start', function () {
                console.log(`Generating HLS stream for ${resolution}`);
            })
            .on('end', function () {
                console.log(`HLS stream generation for ${resolution} complete`);
                resolve();
            })
            .on('error', function (err) {
                console.error(`Error generating ${resolution} HLS stream:`, err.message);
                reject(err);
            })
            .save(`${hlsPath}.m3u8`);  // Save the HLS playlist for this resolution
    });
};

const convertToAdaptiveStreaming = async (file, outputPath, s3Path) => {
    try {
        // Define the resolutions, bitrates, and output sizes for adaptive streaming
        const resolutions = [
            { resolution: '360p', bitrate: '800k', size: '640x360' },
            { resolution: '720p', bitrate: '2500k', size: '1280x720' },
            { resolution: '1080p', bitrate: '5000k', size: '1920x1080' }
        ];

        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }

        // Process each resolution and generate its HLS stream
        for (const { resolution, bitrate, size } of resolutions) {
            const hlsPath = `${outputPath}/stream_${resolution}`;
            await generateHLSStream(file, outputPath, resolution, hlsPath, bitrate, size);
        }

        // After all streams are generated, create a master playlist
        await createMasterPlaylist(outputPath, resolutions);

        // uplading files into s3 bucket
        await uploadFolderToS3(outputPath, s3Path)
        // deleteLocalFile(outputPath);
        // deleting local files..........

        console.log('Adaptive streaming conversion complete');
    } catch (error) {
        console.error('Error during adaptive streaming conversion:', error);
    }
};

// Function to create a master playlist for adaptive streaming
const createMasterPlaylist = (outputPath, resolutions) => {
    return new Promise((resolve, reject) => {
        const masterPlaylistPath = `${outputPath}/master.m3u8`;

        let playlistContent = '#EXTM3U\n';

        // Add each resolution to the master playlist
        resolutions.forEach(({ resolution, bitrate }) => {
            playlistContent += `#EXT-X-STREAM-INF:BANDWIDTH=${bitrate.replace('k', '')}000,RESOLUTION=${resolution}\n`;
            playlistContent += `stream_${resolution}.m3u8\n`;
        });

        // Write the master playlist to the output path
        fs.writeFile(masterPlaylistPath, playlistContent, (err) => {
            if (err) {
                console.error('Error writing master playlist:', err);
                return reject(err);
            }

            console.log('Master playlist created');
            resolve();
        });
    });
};

const captureThumbnail = async (file, thumbnailPath, outputPath) => {
    try {
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }

        await new Promise((resolve, reject) => {
            ffmpeg(file.path)  // Input video file
                .output(thumbnailPath)  // Output thumbnail file
                .outputOptions([
                    '-vframes 1',  // Capture one frame
                    '-ss 00:00:01',  // Start at 1 second
                    '-s 1280x720',  // Resize to 1280x720
                    '-q:v 1',  // High-quality thumbnail
                    '-f image2'  // Output as image format
                ])
                .on('end', () => {
                    console.log('Thumbnail captured');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('Error capturing thumbnail:', err.message);
                    reject(err);
                })
                .run();
        });
    } catch (error) {
        console.error('Error capturing thumbnail:', error);
    }
};

const deleteLocalFile = (filePath) => {
    try {
        fs.unlinkSync(filePath);
    } catch (error) {
        console.error('Error deleting local file:', error);
    }
}


module.exports = {
    convertToAdaptiveStreaming,
    captureThumbnail,
    deleteLocalFile
}
