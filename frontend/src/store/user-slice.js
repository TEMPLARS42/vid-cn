// src/features/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userInfo: null, // Initial state of the user info
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserInfo: (state, action) => {
            state.userInfo = action.payload; // Store the user info from login
        },
        clearUserInfo: (state) => {
            state.userInfo = null; // Clear user info on logout or reset
        },
        updateNotificationCount: (state, action) => {
            if (state.userInfo) {
                state.userInfo.unreadNotificationCount += action.payload;
            }
        },
    },
});

export const { setUserInfo, clearUserInfo, updateNotificationCount } = userSlice.actions;
export default userSlice.reducer;
