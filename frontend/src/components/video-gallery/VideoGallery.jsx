import React, { useEffect, useRef, useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import VideoCard from './VideoCard';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';
import { useNavigate, useParams } from 'react-router-dom';
import SearchBar from '../SearchBar';
import InfiniteScroll from 'react-infinite-scroll-component';
import { initializeFirebaseConnection } from '../../configs/firebase.config';

const VideoGallery = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [skip, setSkip] = useState(0);
    const [search, setSearch] = useState('');
    const [videos, setVideos] = useState([]);
    const [openVideoPlayer, setOpenVideoPlayer] = useState(false);

    const limit = 12;
    const { videoId } = useParams();
    const navigate = useNavigate();
    const timeoutId = useRef(null);

    useEffect(() => {
        initializeFirebaseConnection()
    }, [])

    useEffect(() => {
        if (videoId) {
            setOpenVideoPlayer(true);
        } else {
            setOpenVideoPlayer(false);
            fetchVideos(false);
        }
    }, [videoId, search]);

    const debouncedSearch = (value) => {
        if (timeoutId.current) clearTimeout(timeoutId.current);
        timeoutId.current = setTimeout(() => {
            setSearch(value);
        }, 500);
    };

    const fetchVideos = async (isScroll = false) => {
        try {
            setIsLoading(true);
            const response = await axios({
                url: "/api/videos",
                method: "GET",
                params: {
                    search: search,
                    skip: isScroll ? skip + limit : 0,
                    limit: limit,
                }
            });

            if (response?.data?.videos) {
                const newVideos = response.data.videos;
                setHasMore(newVideos.length === limit);

                if (isScroll) {
                    setVideos(prev => [...prev, ...newVideos]);
                    setSkip(prev => prev + limit);
                } else {
                    setVideos(newVideos);
                    setSkip(limit);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const onSearch = (query) => {
        debouncedSearch(query);
    };

    const onVideoClick = (videoId) => navigate("/videos/" + videoId);

    if (openVideoPlayer) {
        return <VideoPlayer videoUrl={"http://localhost:5000/uploads/courses/sonic@1234/stream"} />;
    }

    return (
        <div className="min-vh-100 bg-dark">
            <div className="container-fluid container-xl py-4">
                {/* Search Bar */}
                <div className="row justify-content-center mb-4">
                    <div className="col-12 col-md-8 col-lg-6">
                        <SearchBar onSearch={onSearch} />
                    </div>
                </div>

                {/* Video Grid */}
                <InfiniteScroll
                    dataLength={videos.length}
                    next={() => fetchVideos(true)}
                    hasMore={hasMore}
                    loader={
                        <div className="d-flex justify-content-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    }
                    endMessage={
                        <div className="text-center py-4 text-secondary">
                            No more videos to load
                        </div>
                    }
                    className="overflow-hidden"
                >
                    {videos.length > 0 ? (
                        <div className="row g-4">
                            {videos.map((video) => (
                                <div key={video._id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                                    <VideoCard
                                        videoInfo={video}
                                        onVideoClick={onVideoClick}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        !isLoading && (
                            <div className="text-center py-5">
                                <div className="display-1 text-secondary mb-3">
                                    <Plus size={64} className="mx-auto" />
                                </div>
                                <h3 className="h4 text-light mb-2">
                                    No videos yet
                                </h3>
                                <p className="text-secondary">
                                    Upload your first video to get started
                                </p>
                            </div>
                        )
                    )}
                </InfiniteScroll>

                {/* Initial Loading State */}
                {isLoading && videos.length === 0 && (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoGallery;