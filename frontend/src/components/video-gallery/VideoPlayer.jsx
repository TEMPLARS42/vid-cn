import React, { useRef, useEffect, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, User } from 'lucide-react';
import VideoComments from './VideoComments';
import VideoDescription from './VideoDescription';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../Loader';
import axios from 'axios';
import { getRelativeTime } from "../../util";

export const VideoPlayer = () => {
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const [selectedQuality, setSelectedQuality] = useState("720p");
    const [showComments, setShowComments] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [localLikes, setLocalLikes] = useState(0);
    const [localDislikes, setLocalDislikes] = useState(0);

    const [videoInfo, setVideoInfo] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const { videoId } = useParams();

    const qualitySources = {
        "360p": `${videoInfo.path}_360p.m3u8`,
        "720p": `${videoInfo.path}_720p.m3u8`,
        "1080p": `${videoInfo.path}_1080p.m3u8`,
    };

    useEffect(() => {
        if (!videoInfo.path) return;

        if (!playerRef.current) {
            const videoElement = document.createElement("video-js");
            videoElement.classList.add("vjs-big-play-centered", "vjs-dark-theme");
            videoRef.current.appendChild(videoElement);

            playerRef.current = videojs(videoElement, {
                controls: true,
                autoplay: false,
                preload: "auto",
                fluid: true,
                responsive: true,
                playbackRates: [0.5, 1, 1.5, 2],
                sources: [{ src: qualitySources[selectedQuality], type: "application/x-mpegURL" }],
            });
        } else {
            const player = playerRef.current;
            player.src([{ src: qualitySources[selectedQuality], type: "application/x-mpegURL" }]);
            player.load();
        }
    }, [selectedQuality, videoInfo]);

    useEffect(() => {
        fetchVideoInfo();

        return () => {
            if (playerRef.current && !playerRef.current.isDisposed()) {
                playerRef.current.dispose();
                playerRef.current = null;
            }
        };
    }, []);

    const fetchVideoInfo = async () => {
        try {
            const response = await axios.get("/api/video/" + videoId);
            setVideoInfo({ ...response.data.videoInfo, path: "https://vid-cn.s3.ap-south-1.amazonaws.com/uploads/kdkd2389/stream" });
            setIsLiked(response.data.videoInfo.isLiked);
            setIsDisliked(response.data.videoInfo.isDisliked);
            setLocalLikes(response.data.videoInfo.likes);
            setLocalDislikes(response.data.videoInfo.dislikes);
        }
        catch (error) {
            console.error(error);
        }
        finally {
            setIsLoading(false);
        }
    }

    const handleQualityChange = (quality) => {
        setSelectedQuality(quality);
    };

    const handleLike = async () => {
        // api calling............
        await axios.post("/api/like", { videoId, action: !isLiked });

        if (!isLiked) {
            setLocalLikes(prev => prev + 1);
            if (isDisliked) {
                // setLocalDislikes(prev => prev - 1);
                setIsDisliked(false);
                handleDislike();
            }
        } else {
            setLocalLikes(prev => prev - 1);
        }
        setIsLiked(!isLiked);
    };

    const handleDislike = async () => {
        // api calling............
        await axios.post("/api/dislike", { videoId, action: !isDisliked });

        if (!isDisliked) {
            setLocalDislikes(prev => prev + 1);
            if (isLiked) {
                // setLocalLikes(prev => prev - 1);
                setIsLiked(false);
                handleLike();
            }
        } else {
            setLocalDislikes(prev => prev - 1);
        }
        setIsDisliked(!isDisliked);
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num;
    };

    return (
        <Loader isLoading={isLoading}>
            <div className="container-fluid bg-dark text-light py-4">
                <div className="row">
                    <div className="col-lg-8">
                        {/* Video Player */}
                        <div data-vjs-player className="mb-3">
                            <div ref={videoRef} />
                        </div>

                        {/* Video Info */}
                        <div className="mb-4">
                            <h1 className="h3 mb-2">{videoInfo.title}</h1>
                            <div className="d-flex justify-content-between align-items-center flex-wrap">
                                <div className="d-flex align-items-center gap-2">
                                    <div
                                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center overflow-hidden mr-5"
                                        style={{ width: '40px', height: '40px' }}
                                    >
                                        {videoInfo.profilePicture ? (
                                            <img
                                                src={videoInfo.profilePicture}
                                                className="w-100 h-100"
                                                style={{ objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <User size={20} className="text-light" />
                                        )}
                                    </div>
                                    <div className="">
                                        <h6 className="mb-0">{videoInfo.createdBy}</h6>
                                        <small className="text-secondary">{videoInfo.views || 0} views • {getRelativeTime(videoInfo.createdOn)}</small>
                                    </div>
                                </div>

                                <div className="d-flex gap-3 mt-2 mt-sm-0">
                                    {/* Like/Dislike Buttons */}
                                    <button
                                        className={`btn btn-dark d-flex align-items-center gap-2 ${isLiked ? 'text-primary' : ''}`}
                                        onClick={handleLike}
                                    >
                                        <ThumbsUp size={20} />
                                        <span>{formatNumber(localLikes || 0)}</span>
                                    </button>
                                    <button
                                        className={`btn btn-dark d-flex align-items-center gap-2 ${isDisliked ? 'text-danger' : ''}`}
                                        onClick={handleDislike}
                                    >
                                        <ThumbsDown size={20} />
                                        <span>{formatNumber(localDislikes || 0)}</span>
                                    </button>
                                    <button className="btn btn-dark d-flex align-items-center gap-2">
                                        <Share2 size={20} />
                                        <span>Share</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quality Selection */}
                        <div className="mb-4">
                            <div className="btn-group">
                                {Object.keys(qualitySources).map(quality => (
                                    <button
                                        key={quality}
                                        className={`btn ${selectedQuality === quality ? 'btn-primary' : 'btn-dark'}`}
                                        onClick={() => handleQualityChange(quality)}
                                    >
                                        {quality}
                                    </button>
                                ))}
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
                            {true && <VideoComments />}
                        </div>
                    </div>

                    {/* Suggested Videos Column */}
                    <div className="col-lg-4">
                        {/* Add suggested videos component here */}
                    </div>
                </div>
            </div>
        </Loader>
    );
};

export default VideoPlayer;