import React from 'react';

const VideoPreview = ({ url }) => {
    return (
        <div className="video-preview">
            <video
                src={url}
                controls
                className="w-100 rounded"
                style={{ maxHeight: '300px' }}
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default VideoPreview;