import React, {useEffect, useState} from "react";
import {Box, Card, CardContent, Typography, Button} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {toast, ToastContainer} from "react-toastify";
import {showNotification} from "../../state/notificationSlice.js";

const AdminGroups = ({userId}) => {
    const token = useSelector((state) => state.auth.token);
    const [groups, setGroups] = useState([]);
    const [groupRequests, setGroupRequests] = useState({});
    const currentUserId = useSelector((state) => state.auth.user._id);
    const dispatch = useDispatch();


    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/group/${userId}/admin`, {
                    method: "GET",
                    headers: {Authorization: `Bearer ${token}`},
                });
                const data = await response.json();
                if (response.ok) {
                    const adminGroups = data.filter(
                        (group) => group.admin._id.toString() === userId
                    );
                    setGroups(adminGroups);

                    adminGroups.forEach((group) => {
                        fetchRequests(group._id);
                    });
                } else {
                    dispatch(
                        showNotification({
                            message: "Không thể kiểm tra trạng thái admin!",
                            type: "error",
                        })
                    );
                }

            } catch (error) {
                console.error("Error fetching admin groups:", error);
            }
        };

        const fetchRequests = async (groupId) => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_PORT_BACKEND}/group/${groupId}/${userId}/get-request`,
                    {
                        method: "GET",
                        headers: {Authorization: `Bearer ${token}`},
                    }
                );
                const data = await response.json();
                setGroupRequests((prev) => ({
                    ...prev,
                    [groupId]: data.requests,
                }));
            } catch (error) {
                console.error("Error fetching group requests:", error);
            }
        };

        fetchGroups();
    }, [userId, token]);

    const handleAcceptRequest = async (groupId, userId) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_PORT_BACKEND}/group/${groupId}/requests/${userId}/${currentUserId}/accept`,
                {
                    method: "POST",
                    headers: {Authorization: `Bearer ${token}`},
                }
            );
            // const data = await response.json();
            if (response.ok) {
                setGroupRequests((prev) => {
                    const updatedRequests = prev[groupId]?.filter(
                        (req) => req._id !== userId
                    );
                    return {
                        ...prev,
                        [groupId]: updatedRequests,
                    };
                });

                dispatch(
                    showNotification({
                        message: "Đã chấp nhận!",
                        type: "success",
                    })
                );

                fetchRequests(groupId);
            }
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    };

    const handleRejectRequest = async (groupId, userId) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_PORT_BACKEND}/group/${groupId}/requests/${userId}/${currentUserId}/reject`,
                {
                    method: "POST",
                    headers: {Authorization: `Bearer ${token}`},
                }
            );
            // const data = await response.json();
            if (response.ok) {
                setGroupRequests((prev) => {
                    const updatedRequests = prev[groupId]?.filter(
                        (req) => req._id !== userId
                    );
                    return {
                        ...prev,
                        [groupId]: updatedRequests,
                    };
                });

                dispatch(
                    showNotification({
                        message: "Đã từ chối!",
                        type: "success",
                    })
                );

                fetchRequests(groupId);
            }
        } catch (error) {
            console.error("Error rejecting request:", error);
        }
    };

    const notify = () => toast("Wow so easy!");


    return (
        <Box>
            <h3>Nhóm do bạn quản trị</h3>
            {groups && groups.length > 0 ? groups.map((group) => (
                <Box key={group._id} sx={{marginBottom: "0.8rem"}}>
                    <Card>
                        <CardContent sx={{position: "relative"}}>
                            <Typography variant="h6">{group.name}</Typography>
                            <Typography variant="body2">{group.description}</Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    backgroundColor: group.isPublic ? "green" : "red",
                                    color: "white",
                                    padding: "2px 8px",
                                    borderRadius: "5px",
                                }}
                            >
                                {group.isPublic ? "Public" : "Private"}
                            </Typography>
                        </CardContent>
                    </Card>

                    {groupRequests[group._id] && groupRequests[group._id].length > 0 && (
                        <Box sx={{marginTop: "1rem", padding: "0 2rem"}}>
                            <Typography variant="h6">Yêu cầu tham gia:</Typography>
                            {groupRequests[group._id].map((request) => (
                                <Box key={request._id} sx={{
                                    marginTop: "1rem",
                                    padding: "0 1rem",
                                    backgroundColor: "#f5f5f5",
                                    borderLeft: "5px solid #00796b",
                                    borderRadius: "5px",
                                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                    paddingBottom: "1rem",
                                }}>
                                    <Typography variant="body2">
                                        {request.firstName} {request.lastName}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleAcceptRequest(group._id, request._id)}
                                    >
                                        Chấp nhận
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => handleRejectRequest(group._id, request._id)}
                                    >
                                        Từ chối
                                    </Button>
                                    <Button onClick={notify}>Notify!</Button>

                                </Box>
                            ))}
                        </Box>
                    )}
                </Box>
            )) : <Typography>Không có </Typography>}
        </Box>
    );
};

export default AdminGroups;
