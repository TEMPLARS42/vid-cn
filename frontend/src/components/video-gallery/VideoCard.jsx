import React from 'react';
import { User, Eye, Clock, Upload } from 'lucide-react';

const VideoCard = ({ videoInfo, onVideoClick }) => {
    const { title, thumbnail, profilePicture, addedBy, views, timestamp, uploadStatus } = videoInfo;
    const isProcessing = uploadStatus === 'PROCESSING';

    // Utility function for formatting view counts
    const formatViews = (count) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count;
    };

    // Render user avatar with profile picture or fallback icon
    const renderAvatar = () => (
        <div className="flex-shrink-0">
            <div
                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center overflow-hidden"
                style={{ width: '40px', height: '40px' }}
            >
                {profilePicture ? (
                    <img
                        src={profilePicture}
                        alt={addedBy}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <User size={20} className="text-light" />
                )}
            </div>
        </div>
    );

    // Render video information
    const renderVideoInfo = () => (
        <div className="flex-grow-1 min-width-0">
            <h3 className="h6 text-light mb-1 text-truncate">
                {title}
            </h3>
            <p className="text-secondary small mb-1">{addedBy}</p>
            <div className="d-flex align-items-center text-secondary small">
                <Eye size={14} className="me-1" />
                <span>{formatViews(views)} views</span>
                <span className="mx-2">•</span>
                <span>{timestamp}</span>
            </div>
        </div>
    );

    // Render video thumbnail with duration and processing overlay
    const renderThumbnail = () => (
        <div className="position-relative">
            <img
                src={thumbnail}
                alt={title}
                className={`card-img-top ${isProcessing ? 'blur' : ''}`}
                style={{ aspectRatio: '16/9', objectFit: 'cover' }}
            />
            {isProcessing && (
                <div className="processing-overlay">
                    <div className="processing-content">
                        <Upload className="processing-icon" size={24} />
                        <span className="processing-text">Processing...</span>
                    </div>
                </div>
            )}
            <div className="position-absolute bottom-0 end-0 m-2">
                <span className="badge bg-dark bg-opacity-75 d-flex align-items-center gap-1">
                    <Clock size={14} />
                    {timestamp}
                </span>
            </div>
        </div>
    );

    return (
        <div
            className={`card bg-dark h-100 border-secondary ${isProcessing ? 'processing' : 'cursor-pointer'}`}
            onClick={() => !isProcessing && onVideoClick(videoInfo._id)}
            style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseOver={(e) => {
                if (!isProcessing) {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.3)';
                }
            }}
            onMouseOut={(e) => {
                if (!isProcessing) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                }
            }}
        >
            {renderThumbnail()}

            <div className="card-body">
                <div className="d-flex gap-3">
                    {renderAvatar()}
                    {renderVideoInfo()}
                </div>
            </div>
        </div>
    );
};

export default VideoCard;