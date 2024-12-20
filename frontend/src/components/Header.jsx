import React from 'react';
import { Upload, Video } from 'lucide-react';
import { Outlet } from 'react-router-dom'
import { isUserExists } from '../util';
import { useNavigate } from 'react-router-dom';
import Notifications from './Notifications';
import { useAuth0 } from "@auth0/auth0-react";
import { useSelector } from "react-redux";
import axios from 'axios';
import { toasty } from '../configs/toasty.config';

const Header = () => {
    const navigate = useNavigate();
    const { logout } = useAuth0();

    const userInfo = useSelector((state) => state.user.userInfo);

    const onUpload = () => {
        console.log('Upload clicked');
        // Implement upload functionality
        navigate("/upload");
    };

    const handleLogout = async () => {
        try {
            await axios.post("/api/logout");
            localStorage.clear();
            window.location.href = "/login"

            if (userInfo.type == "oauth") logout({ returnTo: process.env.CONFIG_BASE_URL });
        }
        catch (error) {
            console.error(error);
            toasty.error(error?.response?.data?.message || "Something went wrong");
        }
    };
    return (
        <div>
            {isUserExists() && <header className="bg-black border-bottom border-secondary sticky-top">
                <div className="container-fluid py-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="col-auto d-flex align-items-center">
                            <Video size={24} className="text-primary me-2" />
                            <h1 className="text-light mb-0 h4 d-none d-sm-block">Vid-CN</h1>
                        </div>
                        {/* <div className="col-lg-6 d-flex gap-2"> */}
                        <div className="col-auto d-flex align-items-end gap-3">
                            <Notifications />
                            <button
                                onClick={onUpload}
                                className="btn btn-primary d-flex align-items-center gap-2"
                            >
                                <Upload size={20} />
                                <span className="d-none d-sm-inline">Upload</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="btn btn-primary d-flex align-items-center gap-2"
                            >
                                <Upload size={20} />
                                <span className="d-none d-sm-inline">Log Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>}
            <Outlet />
        </div>
    );
};

export default Header;