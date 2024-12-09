import React, {useEffect, useState} from "react";
import {Box, Typography, Button} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {toast, ToastContainer} from "react-toastify";
import {showNotification} from "../state/notificationSlice.js";

const GroupRequests = ({groupId}) => {
    const [requests, setRequests] = useState([]);
    const token = useSelector((state) => state.auth.token);
    const [isAdmin, setIsAdmin] = useState(false);
    const currentUserId = useSelector((state) => state.auth.user._id);
    const dispatch = useDispatch();


    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/group/${groupId}/${currentUserId}/status`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.isAdmin) {
                        setIsAdmin(true);
                        fetchRequests();
                    }
                }
            } catch (error) {
                console.error("Error checking admin status:", error);
            }
        };

        const fetchRequests = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/group/${groupId}/${currentUserId}/get-request`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setRequests(data.requests);
                }
            } catch (error) {
                console.error("Error fetching group requests:", error);
            }
        };

        checkAdminStatus();
    }, [groupId, token]);

    const handleApprove = async (userId) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_PORT_BACKEND}/group/${groupId}/requests/${userId}/${currentUserId}/accept`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                setRequests((prev) => prev.filter((req) => req._id !== userId));
                dispatch(
                    showNotification({
                        message: "Đã đồng ý!",
                        type: "success",
                    })
                );
            }
        } catch (error) {
            console.error("Error approving request:", error);
        }
    };

    const handleDeny = async (userId) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_PORT_BACKEND}/groups/${groupId}/requests/${userId}/${currentUserId}/reject`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                setRequests((prev) => prev.filter((req) => req._id !== userId));
                dispatch(
                    showNotification({
                        message: "Đã từ chối!",
                        type: "success",
                    })
                );
            }
        } catch (error) {
            console.error("Error denying request:", error);
        }
    };

    if (!isAdmin) {
        return <Typography variant="body2"></Typography>;
    }

    return (
        <Box>
            <Typography variant="h6">Yêu cầu vào nhóm</Typography>
            {requests.length > 0 ? (
                requests.map((user) => (
                    <Box key={user._id} display="flex" justifyContent="space-between" alignItems="center">
                        <Typography>{user.name}</Typography>
                        <Box>
                            <Button variant="contained" color="success" onClick={() => handleApprove(user._id)}>
                                Thêm
                            </Button>
                            <Button variant="contained" color="error" onClick={() => handleDeny(user._id)}>
                                Xóa
                            </Button>
                        </Box>
                    </Box>

                ))
            ) : (
                <Typography>Không có yêu cầu nào</Typography>
            )}
        </Box>
    );
};

export default GroupRequests;
