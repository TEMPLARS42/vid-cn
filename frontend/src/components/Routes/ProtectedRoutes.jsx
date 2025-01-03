import { lazy } from 'react'
import { Navigate } from 'react-router-dom';
import UploadVideo from '../upload-video/UploadVideo';
import VideoGallery from '../video-gallery/VideoGallery';

/**
 * @type {import('react-router-dom').RouteObject[]}
 */
const ProtectedRoutes = [
    { path: "/videos/:videoId?", element: <VideoGallery /> },
    { path: "/upload", element: <UploadVideo /> },
    { path: "/", element: <Navigate to='/videos' /> },
    { path: "/*", element: <Navigate to='/videos' state={{ redirectUrl: window.location.pathname }} /> },
]

export default ProtectedRoutes;