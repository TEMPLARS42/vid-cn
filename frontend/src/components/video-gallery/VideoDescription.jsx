import React, { useState } from 'react';

const VideoDescription = ({ description }) => {
    const [expanded, setExpanded] = useState(false);

    const shortDescription = description.slice(0, 200);
    const hasMore = description.length > 200;

    return (
        <div className="video-description bg-dark border border-secondary rounded p-3">
            <p className="mb-2 text-white">
                {expanded ? description : shortDescription}
                {!expanded && hasMore && '...'}
            </p>
            {hasMore && (
                <button
                    className="btn btn-dark btn-sm"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? 'Show less' : 'Show more'}
                </button>
            )}
        </div>
    );
};

export default VideoDescription;