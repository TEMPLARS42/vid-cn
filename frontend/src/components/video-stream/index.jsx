import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const ScreenCapture = () => {
    const [isStreaming, setIsStreaming] = useState(false);
    const videoRef = useRef(null);
    const socketRef = useRef(null);

    // Connect to the backend using Socket.IO
    useEffect(() => {
        socketRef.current = io('http://localhost:8000');
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    // Start screen capture and stream to the backend
    const startScreenCapture = async () => {
        try {
            // Request the screen media stream
            socketRef.current.emit('initialize-stream', "12346");
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false,  // You can set this to true if you also want to capture audio
            });

            // Set the video element to display the captured screen
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            setIsStreaming(true);

            // Get the video tracks from the stream
            const [track] = stream.getVideoTracks();
            const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp8' });

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0 && socketRef.current) {
                    // Send the binary data to the backend via Socket.IO
                    socketRef.current.emit('screen-stream', event.data);
                }
            };

            recorder.start(1000); // Send data every second (adjust as needed)

            // Stop streaming when the track ends (i.e., when the user stops sharing their screen)
            track.onended = () => {
                recorder.stop();
                setIsStreaming(false);
            };
        } catch (error) {
            console.error('Error capturing screen:', error);
        }
    };

    return (
        <div>
            <h2>Screen Capture Stream</h2>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: 'auto' }} />
            {!isStreaming ? (
                <button onClick={startScreenCapture}>Start Screen Capture</button>
            ) : (
                <p>Streaming... Stop sharing the screen to end.</p>
            )}
        </div>
    );
};

export default ScreenCapture;
