import React, {useEffect, useState} from "react";
import {Box, Typography, Avatar, Button, Snackbar} from "@mui/material";
import { useSelector } from "react-redux";

const GroupListItem = ({ groupId, name, description, picturePath }) => {
    const [isJoined, setIsJoined] = useState(false);
    const currentUserId = useSelector((state) => state.auth.user._id);
    const [isAdmin, setIsAdmin] = useState(false);
    const token = useSelector((state) => state.auth.token);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

    useEffect(() => {
        const checkMembership = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/group/${groupId}/${currentUserId}/status`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsJoined(data.isMember);
                    setIsAdmin(data.isAdmin);
                }
            } catch (error) {
                console.error("Error checking membership status:", error);
            }
        };

        checkMembership();
    }, [groupId, token]);

    // Hàm xử lý tham gia nhóm
    const handleJoinGroup = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/group/${groupId}/${currentUserId}/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setIsJoined(true);
            } else {
                console.error("Failed to join group");
            }
            if(response.status === 201 || response.status === 200){
                setOpenSnackbar(true);
                setSnackbarMessage('Yêu cầu thành công')
            }
        } catch (error) {
            console.error("Error joining group:", error);
        }
    };

    return (
        <Box display="flex" alignItems="center" gap="1rem">
            {picturePath && (
                <Avatar
                    src={`${import.meta.env.VITE_PORT_BACKEND}${picturePath}`}
                    alt={name}
                    sx={{ width: 40, height: 40 }}
                />
            )}
            <Box flex="1">
                <Typography variant="h6">{name}</Typography>
                <Typography variant="body2">{description}</Typography>
            </Box>
            {!isAdmin && (
                <Button
                    variant="contained"
                    color={isJoined ? "success" : "primary"}
                    onClick={handleJoinGroup}
                    disabled={isJoined}
                >
                    {isJoined ? "Đã tham gia" : "Tham gia"}
                </Button>
            )}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
            />
        </Box>
    );
};

export default GroupListItem;
