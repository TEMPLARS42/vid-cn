import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getRelativeTime } from '../../util';
import { useSelector } from "react-redux";

const VideoComments = () => {
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [skip, setSkip] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const userInfo = useSelector((state) => state.user.userInfo);
    const { videoId } = useParams();
    const limit = 10;

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async (isScroll = false) => {
        try {
            setIsLoading(true);
            const response = await axios({
                url: "/api/comments",
                method: "GET",
                params: {
                    videoId: videoId,
                    skip: isScroll ? skip + limit : 0,
                    limit: limit,
                }
            });

            if (response?.data?.comments) {
                const newComments = response.data.comments;
                setHasMore(newComments.length === limit);

                if (isScroll) {
                    setComments(prev => [...prev, ...newComments]);
                    setSkip(prev => prev + limit);
                } else {
                    setComments(newComments);
                    setSkip(limit);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        const response = await axios({
            url: "/api/comment",
            method: "POST",
            data: {
                videoId,
                text: comment
            }
        });

        setComments([{ ...response.data.comment, profilePicture: userInfo.profilePicture }, ...comments]);
        setComment('');
    };

    const handleCommentLiked = async (commentId, action) => {
        try {
            await axios.patch(`/api/comment-like`, { commentId, action });
            const newComments = comments.map(comment => {
                if (comment._id === commentId) {
                    comment.likes = action ? comment.likes + 1 : comment.likes - 1;
                }
                return comment;
            });
            setComments(newComments);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="comments-section">
            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-4">
                <div className="d-flex gap-3">
                    <div
                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center overflow-hidden mr-5"
                        style={{ width: '40px', height: '40px' }}
                    >
                        {userInfo.profilePicture ? (
                            <img
                                src={userInfo.profilePicture}
                                className="w-100 h-100"
                                style={{ objectFit: 'cover' }}
                            />
                        ) : (
                            <User size={20} className="text-light" />
                        )}
                    </div>
                    <div className="flex-grow-1">
                        <input
                            type="text"
                            className="form-control bg-dark text-light border-secondary"
                            placeholder="Add a comment..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <div className="d-flex justify-content-end mt-2">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={!comment.trim()}
                            >
                                Comment
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="comments-list">
                {comments.map((comment) => (
                    <div key={comment._id} className="d-flex gap-3 mb-4">
                        <div
                            className="rounded-circle bg-secondary d-flex align-items-center justify-content-center overflow-hidden mr-5"
                            style={{ width: '40px', height: '40px' }}
                        >
                            {comment.profilePicture ? (
                                <img
                                    src={comment.profilePicture}
                                    className="w-100 h-100"
                                    style={{ objectFit: 'cover' }}
                                />
                            ) : (
                                <User size={20} className="text-light" />
                            )}
                        </div>
                        <div>
                            <div className="d-flex align-items-center gap-2">
                                <h6 className="mb-0">{comment.author}</h6>
                                <small className="text-secondary">{getRelativeTime(comment.createdOn)}</small>
                            </div>
                            <p className="mb-1 mt-1 text-light">{comment.text}</p>
                            <div className="d-flex align-items-center gap-3">
                                <button className="btn btn-dark btn-sm" type='button' onClick={() => handleCommentLiked(comment._id, !comment.isLiked)}>
                                    👍 {comment.likes}
                                </button>
                                {/* <button className="btn btn-dark btn-sm">Reply</button> */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VideoComments;