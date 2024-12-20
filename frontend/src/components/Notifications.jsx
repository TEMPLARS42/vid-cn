import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toasty } from '../configs/toasty.config';
import Loader from './Loader';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
import { getRelativeTime } from '../util';
import { updateNotificationCount } from '../store/user-slice';

const Notifications = () => {
    const unreadNotificationCount = useSelector((state) => state.user.userInfo.unreadNotificationCount);
    const dispatch = useDispatch();

    const [isOpen, setIsOpen] = useState(false);
    const [notificationsList, setNotificationsList] = useState([]);
    const popupRef = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);

    const [hasMore, setHasMore] = useState(true);
    const [skip, setSkip] = useState(0);
    const limit = 10;

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

    const fetchNotifications = async (isScroll = false) => {
        try {
            if (isScroll) {
                setIsScrolling(true);
            }
            else setIsLoading(true);
            const response = await axios({
                url: "/api/notifications",
                method: "GET",
                params: {
                    skip: isScroll ? skip + limit : 0,
                    limit: limit,
                }
            })

            if (response?.data?.notifications) {
                let _notifications = response.data.notifications;
                setHasMore(_notifications.length == limit);

                if (isScroll) {
                    setNotificationsList(prevMembers => [...prevMembers, ..._notifications]);
                    setSkip(prevSkip => prevSkip + limit);
                } else {
                    setNotificationsList(_notifications);
                    setSkip(limit);
                }
            }
        }
        catch (error) {
            console.error(error);
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
            dispatch(updateNotificationCount(-1))
        }
        catch (error) {
            console.error(error);
            toasty.error(error?.response?.data?.message || "Something went wrong");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.patch("/api/mark-read", { markAllRead: true });

            setNotificationsList(prev =>
                prev.map(notification => ({ ...notification, isUnread: false }))
            );
            dispatch(updateNotificationCount(-unreadNotificationCount))
        }
        catch (error) {
            console.error(error);
            toasty.error(error?.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="position-relative" ref={popupRef}>
            <button
                className="btn btn-dark position-relative p-2"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell size={20} />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {unreadNotificationCount}
                    <span className="visually-hidden">unread notifications</span>
                </span>
            </button>

            {isOpen && (
                <div className="position-absolute end-0 mt-2 notification-popup bg-dark border border-secondary rounded-3 shadow-lg"
                    style={{
                        width: '320px',
                        maxHeight: '480px',
                        zIndex: 1050,
                        right: '-10px'
                    }}>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary">
                        <h6 className="mb-0 fw-semibold">Notifications</h6>
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

                    {/* Notifications List */}
                    <div className="notifications-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notificationsList.length > 0 ? (
                            <InfiniteScroll
                                className='h-100'
                                dataLength={notificationsList.length}
                                hasMore={hasMore}
                                next={() => fetchNotifications(true)}
                                scrollableTarget="scrollableFolderList"
                                loader={<Loader isLoading={isScrolling} />}
                            >
                                {notificationsList.map(notification => (
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
                                ))}
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