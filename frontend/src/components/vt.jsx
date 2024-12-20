import React, { useRef, useEffect, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import 'videojs-hls-quality-selector';

export const VideoPlayer = (props) => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const { options, onReady } = props;

    // State to manage selected quality
    const [selectedQuality, setSelectedQuality] = useState("720p");

    // Quality sources mapping
    const qualitySources = {
        "360p": "http://localhost:9000/uploads/courses/sonic@1234/stream_360p.m3u8", // Replace with actual URLs
        "720p": "http://localhost:9000/uploads/courses/sonic@1234/stream_720p.m3u8", // Replace with actual URLs
        "1080p": "http://localhost:9000/uploads/courses/sonic@1234/stream_1080p.m3u8", // Replace with actual URLs
    };

    useEffect(() => {
        // Make sure Video.js player is only initialized once
        if (!playerRef.current) {
            const videoElement = document.createElement("video-js");
            videoElement.classList.add("vjs-big-play-centered");
            videoRef.current.appendChild(videoElement);

            const player = (playerRef.current = videojs(videoElement, options, () => {
                videojs.log("player is ready");
                onReady && onReady(player);
            }));

            // Initialize the quality selector
            player.hlsQualitySelector({
                displayCurrentQuality: true,
            });
        } else {
            const player = playerRef.current;

            // Update the video source when the quality changes
            player.src([{ src: qualitySources[selectedQuality], type: "application/x-mpegURL" }]);
            player.load(); // Load the new source
            player.play(); // Start playing the video
        }
    }, [options, videoRef, selectedQuality]);

    // Dispose the Video.js player when the functional component unmounts
    useEffect(() => {
        const player = playerRef.current;

        return () => {
            if (player && !player.isDisposed()) {
                player.dispose();
                playerRef.current = null;
            }
        };
    }, [playerRef]);

    // Function to handle quality change
    const handleQualityChange = (quality) => {
        setSelectedQuality(quality);
    };

    return (
        <div>
            <div data-vjs-player style={{ width: "600px" }}>
                <div ref={videoRef} />
            </div>
            <div style={{ marginTop: "10px" }}>
                <button onClick={() => handleQualityChange("360p")}>360p</button>
                <button onClick={() => handleQualityChange("720p")}>720p</button>
                <button onClick={() => handleQualityChange("1080p")}>1080p</button>
            </div>
        </div>
    );
};

export default VideoPlayer;
