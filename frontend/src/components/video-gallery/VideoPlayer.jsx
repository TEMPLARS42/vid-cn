import React, { useRef, useEffect, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { ThumbsUp, ThumbsDown, Share2, User, MessageCircle } from 'lucide-react';
import axios from "axios";
import { useParams } from "react-router-dom";
import Loader from "../Loader";
import VideoComments from './VideoComments';
import VideoDescription from './VideoDescription';
// import "videojs-hls-quality-selector";
import 'jb-videojs-hls-quality-selector';
import "videojs-contrib-quality-levels"
import { getRelativeTime } from "../../util";

// Utility function to format numbers
const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
};

export const VideoPlayer = () => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const { videoId } = useParams();

    const [videoInfo, setVideoInfo] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [localLikes, setLocalLikes] = useState(0);
    const [localDislikes, setLocalDislikes] = useState(0);

    const qualitySourcesMap = {
        "360p": 0,
        "720p": 1,
        "1080p": 2,
    };

    // Set initial video quality based on network
    const getOptimalQuality = () => {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            const { effectiveType } = connection;
            switch (effectiveType) {
                case 'slow-2g':
                case '2g':
                    return "360p";
                case '3g':
                    return "720p";
                case '4g':
                case '5g':
                default:
                    return "1080p";
            }
        }
        // Return a default quality if no network information is available
        return "360p";
    };

    // Initialize video player
    useEffect(() => {
        if (!videoInfo.path) return;

        if (!playerRef.current) {
            const videoElement = document.createElement("video-js");
            videoElement.classList.add("vjs-big-play-centered", "vjs-custom-theme");
            videoRef.current.appendChild(videoElement);

            playerRef.current = videojs(videoElement, {
                controls: true,
                autoplay: false,
                preload: "auto",
                fluid: true,
                responsive: true,
                playbackRates: [0.5, 1, 1.5, 2],
                sources: [{ src: videoInfo.path, type: "application/x-mpegURL" }],
                html5: {
                    nativeAudioTracks: true,
                    nativeVideoTracks: true,
                    nativeTextTracks: true,
                    hls: {
                        overrideNative: true,
                    },
                },
            });

            playerRef.current.hlsQualitySelector();

            const qualityLevels = playerRef.current.qualityLevels();
            qualityLevels.selectedIndex_ = qualitySourcesMap[getOptimalQuality()]
            qualityLevels.trigger({ type: 'change', selectedIndex: qualitySourcesMap[getOptimalQuality()] });
            // Access quality levels and listen for changes

            // qualityLevels.on("change", () => {
            //     const selectedLevelIndex = qualityLevels.selectedIndex_; // Selected quality level
            //     const selectedQualityLevel = qualityLevels[selectedLevelIndex];
            //     console.log("Quality changed to:", selectedQualityLevel, selectedLevelIndex, getOptimalQuality());
            // });
        } else {
            const player = playerRef.current;
            player.src([{ src: videoInfo.path, type: "application/x-mpegURL" }]);
            player.load();
        }

        return () => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, [videoInfo?.path]);

    // Fetch video info and cleanup
    useEffect(() => {
        fetchVideoInfo();
    }, []);

    const fetchVideoInfo = async () => {
        try {
            const response = await axios.get("/api/video/" + videoId);
            const info = response.data.videoInfo;
            setVideoInfo({
                ...info,
                // path: "https://vid-cn.s3.ap-south-1.amazonaws.com/uploads/videos/6744cdb27abf86d90d83acb3/62d4f137ddc5e8e6d22a222749dbb0fh/master.m3u8"
            });
            setIsLiked(info.isLiked);
            setIsDisliked(info.isDisliked);
            setLocalLikes(info.likes || 0);
            setLocalDislikes(info.dislikes || 0);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLike = async () => {
        try {
            await axios.post("/api/like", { videoId, action: !isLiked });
            if (!isLiked) {
                setLocalLikes(prev => prev + 1);
                if (isDisliked) {
                    setIsDisliked(false);
                    setLocalDislikes(prev => prev - 1);
                }
            } else {
                setLocalLikes(prev => prev - 1);
            }
            setIsLiked(!isLiked);
        } catch (error) {
            console.error('Failed to update like:', error);
        }
    };

    const handleDislike = async () => {
        try {
            await axios.post("/api/dislike", { videoId, action: !isDisliked });
            if (!isDisliked) {
                setLocalDislikes(prev => prev + 1);
                if (isLiked) {
                    setIsLiked(false);
                    setLocalLikes(prev => prev - 1);
                }
            } else {
                setLocalDislikes(prev => prev - 1);
            }
            setIsDisliked(!isDisliked);
        } catch (error) {
            console.error('Failed to update dislike:', error);
        }
    };

    return (
        <Loader isLoading={isLoading}>
            <div className="video-player-container">
                <div className="video-content">
                    <div className="main-content">
                        {/* Video Player */}
                        <div className="player-wrapper" data-vjs-player>
                            <div ref={videoRef} />
                        </div>

                        {/* Video Info */}
                        <div className="video-info">
                            <h1 className="video-title">{videoInfo.title}</h1>
                            <div className="video-meta">
                                <div className="creator-info">
                                    <div className="creator-avatar">
                                        {videoInfo.profilePicture ? (
                                            <img src={videoInfo.profilePicture} alt={videoInfo.createdBy} />
                                        ) : (
                                            <User />
                                        )}
                                    </div>
                                    <div className="creator-details">
                                        <h2>{videoInfo.createdBy}</h2>
                                        <div className="video-stats">
                                            <span>{videoInfo.views || 0} views</span>
                                            <span className="dot">•</span>
                                            <span>{getRelativeTime(videoInfo.createdOn)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Video Controls */}
                        <div className="video-controls">
                            <div className="control-buttons">
                                <button
                                    className={`control-btn ${isLiked ? 'active' : ''}`}
                                    onClick={handleLike}
                                >
                                    <ThumbsUp />
                                    <span>{formatNumber(localLikes)}</span>
                                </button>

                                <button
                                    className={`control-btn ${isDisliked ? 'active dislike' : ''}`}
                                    onClick={handleDislike}
                                >
                                    <ThumbsDown />
                                    <span>{formatNumber(localDislikes)}</span>
                                </button>

                                <button className="control-btn share-btn">
                                    <Share2 />
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>
                        {/* Description */}
                        <VideoDescription description={videoInfo.description || ""} />

                        {/* Comments Section */}
                        <div className="mt-4">
                            <button
                                className="btn btn-dark d-flex align-items-center gap-2 mb-3"
                                onClick={() => setShowComments(!showComments)}
                            >
                                <MessageCircle size={20} />
                                <span>Comments</span>
                            </button>
                            {true && <VideoComments videoId={videoId} />}
                        </div>
                    </div>

                    <div className="sidebar-content">
                        {/* Suggested videos will go here */}
                    </div>
                </div>
            </div>
        </Loader>
    );
};

export default VideoPlayer;
