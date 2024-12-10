import React, { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import { hideNotification } from '../../state/notificationSlice.js'

const Notification = () => {
    const { message, type, isOpen } = useSelector((state) => state.notification);
    const dispatch = useDispatch();

    useEffect(() => {
        if (isOpen) {
            toast[type](message, {
                onClose: () => dispatch(hideNotification()),
            });
        }
    }, [isOpen, message, type, dispatch]);

    return <ToastContainer position="bottom-left" autoClose={1000}/>;
};

export default Notification;
