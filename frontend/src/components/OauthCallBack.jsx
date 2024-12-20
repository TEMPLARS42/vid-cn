import React, { useEffect } from 'react'
import { useAuth0 } from "@auth0/auth0-react";
import { toasty } from '../configs/toasty.config';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '../store/user-slice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function OauthCallBack() {
    const { user, isAuthenticated, isLoading, logout } = useAuth0();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) handleOauthLogin();
    }, [isAuthenticated])

    const handleOauthLogin = async () => {
        try {
            const response = await axios.post("/api/oauth-login", {
                email: user.email,
                name: user.name,
                profilePicture: user.picture,
                oauthId: user.sub
            });
            localStorage.setItem('echo', response.data.token);
            // save into redux store.....
            dispatch(setUserInfo(response.data.user));
            window.location.href = "/videos";
        }
        catch (error) {
            console.error(error);
            toasty.error(error?.response?.data?.message || "Something went wrong");
            if (error?.response?.status === 401 && error?.response?.data?.message == "USER_EXISTS") logout({ returnTo: "http://localhost:3000/" });
            else navigate("/login");
        }
    };
    return (
        <div>Loading...</div>
    )
}

export default OauthCallBack