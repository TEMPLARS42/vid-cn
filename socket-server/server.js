require('dotenv').config();
const http = require('http');
const express = require('express');
const { Server: SocketIO } = require('socket.io');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const { PassThrough } = require('stream');  // To handle stream data
const { CLIENT_URL } = process.env;

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"]
    }
});

// Set FFmpeg binary path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

io.on('connection', (socket) => {
    console.log('Socket Connected', socket.id);

    // Declare stream and ffmpeg command initially
    const stream = new PassThrough();
    let command;

    // Handle binary data stream and set stream key dynamically
    socket.on('initialize-stream', (streamKey) => {
        console.log(`Stream Key: ${streamKey}`);

        command = ffmpeg()
            .input(stream)
            .inputFormat('webm')
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions([
                '-preset ultrafast',
                '-tune zerolatency',
                '-crf 25',
                '-r 25',
                '-g 50',
                '-keyint_min 25',
                '-pix_fmt yuv420p',
                '-sc_threshold 0',
                '-profile:v main',
                '-level 3.1',
                '-f flv'
            ])
            .output(`rtmp://localhost:1935/live/${streamKey}`)  // Dynamic stream key
            .on('start', (commandLine) => {
                console.log('FFmpeg process started with command:', commandLine);
            })
            .on('stderr', (stderrLine) => {
                console.log('FFmpeg stderr:', stderrLine);
            })
            .on('end', () => {
                console.log('FFmpeg process finished successfully');
            })
            .on('error', (err) => {
                console.error('FFmpeg error:', err.message);
            });

        command.run();
    });

    socket.on('screen-stream', (data) => {
        console.log("incomingg data")
        stream.write(data);  // Write incoming data to stream
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        stream.end();
    });
});

server.listen(8000, () => console.log(`Server running on PORT 8000`));
