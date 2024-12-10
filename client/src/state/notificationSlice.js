import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
    name: 'notification',
    initialState: {
        message: '',
        type: 'info', // 'info', 'success', 'error', 'warning'
        isOpen: false,
    },
    reducers: {
        showNotification: (state, action) => {
            state.message = action.payload.message;
            state.type = action.payload.type || 'info';
            state.isOpen = true;
        },
        hideNotification: (state) => {
            state.isOpen = false;
        },
    },
});

export const { showNotification, hideNotification } = notificationSlice.actions;

export default notificationSlice.reducer;
