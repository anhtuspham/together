import React, {useEffect, useState} from "react";
import { Box, Typography, Avatar, Button } from "@mui/material";
import { useSelector } from "react-redux";

const GroupListItem = ({ groupId, name, description, picturePath }) => {
    const [isJoined, setIsJoined] = useState(false);
    const currentUserId = useSelector((state) => state.user._id);
    const [isAdmin, setIsAdmin] = useState(false);
    const token = useSelector((state) => state.token);

    useEffect(() => {
        const checkMembership = async () => {
            try {
                const response = await fetch(`http://localhost:3001/group/${groupId}/${currentUserId}/status`, {
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
            const response = await fetch(`http://localhost:3001/group/${groupId}/${currentUserId}/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setIsJoined(true); // Cập nhật trạng thái tham gia
            } else {
                console.error("Failed to join group");
            }
        } catch (error) {
            console.error("Error joining group:", error);
        }
    };

    return (
        <Box display="flex" alignItems="center" gap="1rem">
            {picturePath && (
                <Avatar
                    src={`http://localhost:3001${picturePath}`}
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
        </Box>
    );
};

export default GroupListItem;
