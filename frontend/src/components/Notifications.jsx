import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import axios from 'axios';
import { toasty } from '../configs/toasty.config';
import { updateNotificationCount } from '../store/user-slice';
import { getRelativeTime } from '../util';

const Notifications = () => {
    const unreadNotificationCount = useSelector((state) => state.user.userInfo.unreadNotificationCount);
    const dispatch = useDispatch();
    const popupRef = useRef(null);

    const [isOpen, setIsOpen] = useState(false);
    const [notificationsList, setNotificationsList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [skip, setSkip] = useState(0);
    const [isFirstTimeMounting, setIsFirstTimeMounting] = useState(true);
    const limit = 7;

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
            const handleClickOutside = (event) => {
                if (popupRef.current && !popupRef.current.contains(event.target)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isFirstTimeMounting) {
            setIsFirstTimeMounting(false);
            return;
        }
        toasty.info("You have a new notification !!")
    }, [unreadNotificationCount])

    const fetchNotifications = async (isLoadMore = false) => {
        try {
            setIsLoading(true);
            const response = await axios({
                url: "/api/notifications",
                method: "GET",
                params: {
                    skip: isLoadMore ? skip : 0,
                    limit
                }
            });

            if (response?.data?.notifications) {
                const newNotifications = response.data.notifications;
                setHasMore(newNotifications.length === limit);

                if (isLoadMore) {
                    setNotificationsList(prev => [...prev, ...newNotifications]);
                    setSkip(prev => prev + limit);
                } else {
                    setNotificationsList(newNotifications);
                    setSkip(limit);
                }
            }
        } catch (error) {
            console.error(error);
            toasty.error(error?.response?.data?.message || "Failed to load notifications");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await axios.patch("/api/mark-read", { notificationId: id, markAllRead: false });
            setNotificationsList(prev =>
                prev.map(notification =>
                    notification._id === id ? { ...notification, isUnread: false } : notification
                )
            );
            dispatch(updateNotificationCount(-1));
        } catch (error) {
            console.error(error);
            toasty.error(error?.response?.data?.message || "Failed to mark notification as read");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.patch("/api/mark-read", { markAllRead: true });
            setNotificationsList(prev =>
                prev.map(notification => ({ ...notification, isUnread: false }))
            );
            dispatch(updateNotificationCount(-unreadNotificationCount));
        } catch (error) {
            console.error(error);
            toasty.error(error?.response?.data?.message || "Failed to mark all notifications as read");
        }
    };

    const renderNotificationItem = (notification) => (
        <div
            key={notification._id}
            className={`notification-item p-3 border-bottom border-secondary ${!notification.isUnread ? 'bg-dark' : 'bg-black bg-opacity-50'
                }`}
        >
            <div className="d-flex justify-content-between align-items-start gap-3">
                <div className="flex-grow-1">
                    <p className="mb-1 text-light" style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                        {notification.message}
                    </p>
                    <small className="text-secondary">{getRelativeTime(notification.createdOn)}</small>
                </div>
                {notification.isUnread && (
                    <button
                        className="btn btn-dark btn-sm p-1 flex-shrink-0"
                        onClick={() => handleMarkRead(notification._id)}
                        title="Mark as read"
                    >
                        <Check size={14} className="text-primary" />
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="position-relative" ref={popupRef}>
            <button
                className="btn btn-dark position-relative p-2"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadNotificationCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {unreadNotificationCount}
                        <span className="visually-hidden">unread notifications</span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notifications-popup">
                    <div className="notifications-header">
                        <h6 className="mb-0 fw-semibold text-light">Notifications</h6>
                        {unreadNotificationCount > 0 && (
                            <button
                                className="btn btn-dark btn-sm d-flex align-items-center gap-1"
                                onClick={handleMarkAllRead}
                            >
                                <CheckCheck size={14} />
                                <span className="text-primary">Mark all read</span>
                            </button>
                        )}
                    </div>

                    <div id="notifications-container" className="notifications-container">
                        {isLoading && notificationsList.length === 0 ? (
                            <div className="notification-loader">
                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : notificationsList.length > 0 ? (
                            <InfiniteScroll
                                dataLength={notificationsList.length}
                                next={() => fetchNotifications(true)}
                                hasMore={hasMore}
                                loader={
                                    <div className="notification-loader">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                }
                                scrollableTarget="notifications-container"
                                className="notifications-scroll"
                                endMessage={
                                    <div className="text-center py-3 text-secondary">
                                        No more notifications
                                    </div>
                                }
                            >
                                {notificationsList.map(renderNotificationItem)}
                            </InfiniteScroll>
                        ) : (
                            <div className="text-center py-4 text-secondary">
                                No notifications
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;