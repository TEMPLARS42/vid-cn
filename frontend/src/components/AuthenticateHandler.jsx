import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import axios from 'axios'
import Loader from './Loader';
import { setUserInfo } from '../store/user-slice';

const AuthenticateHandler = ({ children }) => {

    const [isSessionLoading, setIsSessionLoading] = useState(true)
    const dispatch = useDispatch();

    useEffect(() => {
        getUserSession()
    }, [])

    const getUserSession = async () => {
        try {
            if (localStorage.getItem("echo")) {
                const response = await axios({
                    url: "/api/session",
                    method: "POST",
                });
                dispatch(setUserInfo(response.data.userInfo));
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSessionLoading(false)
        }
    }

    return (
        <>
            {isSessionLoading
                ? <Loader isLoading={true} />
                : children
            }
        </>
    )
}

export default AuthenticateHandler