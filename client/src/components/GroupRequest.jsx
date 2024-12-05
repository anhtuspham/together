import React, { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useSelector } from "react-redux";

const GroupRequests = ({ groupId }) => {
    const [requests, setRequests] = useState([]);
    const token = useSelector((state) => state.token);
    const [isAdmin, setIsAdmin] = useState(false);
    const currentUserId = useSelector((state) => state.user._id);

    // Lấy danh sách yêu cầu
    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                console.log('group Id: ', groupId)
                const response = await fetch(`http://localhost:3001/group/${groupId}/${currentUserId}/status`, {
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
                const response = await fetch(`http://localhost:3001/group/${groupId}/${currentUserId}/get-request`, {
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

    // Phê duyệt yêu cầu
    const handleApprove = async (userId) => {
        try {
            const response = await fetch(
                `http://localhost:3001/group/${groupId}/requests/${userId}/${currentUserId}/accept`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                setRequests((prev) => prev.filter((req) => req._id !== userId));
            }
        } catch (error) {
            console.error("Error approving request:", error);
        }
    };

    // Từ chối yêu cầu
    const handleDeny = async (userId) => {
        try {
            const response = await fetch(
                `http://localhost:3001/groups/${groupId}/requests/${userId}/${currentUserId}/reject`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                setRequests((prev) => prev.filter((req) => req._id !== userId));
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
