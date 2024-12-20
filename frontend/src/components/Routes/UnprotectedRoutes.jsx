import { lazy } from 'react'
import { Navigate } from 'react-router-dom';
import OauthCallBack from '../OauthCallBack';
import ForgotPassword from '../ForgotPassword';
import ResetPassword from '../ResetPassword';
const SignUp = lazy(() => import('../Signup'));
const Login = lazy(() => import('../Login'));

/**
 * @type {import('react-router-dom').RouteObject[]}
 */
const UnprotectedRoutes = [
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <SignUp /> },
    { path: "/oauth-callback", element: <OauthCallBack /> },
    { path: "/reset-password/:token", element: <ResetPassword /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/", element: <Navigate to='/login' /> },
    { path: "/*", element: <Navigate to='/login' state={{ redirectUrl: window.location.pathname }} /> },

]

export default UnprotectedRoutes;