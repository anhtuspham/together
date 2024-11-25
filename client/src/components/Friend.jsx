import {PersonAddOutlined, PersonRemoveOutlined} from "@mui/icons-material";
import {Box, IconButton, Typography, useTheme} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {removeSentFriend, setFriends, setSentFriends} from "../state";
import FlexBetween from "./FlexBetween";
import UserImage from "./UserImage";

const Friend = ({friendId, name, subtitle, userPicturePath}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {_id} = useSelector((state) => state.user);
    const token = useSelector((state) => state.token);
    const friends = useSelector((state) => state.user.friends);
    const [friendStatus, setFriendStatus] = useState(null);
    const [error, setError] = useState(null);

    const {palette} = useTheme();
    const primaryLight = palette.primary.light;
    const primaryDark = palette.primary.dark;
    const main = palette.neutral.main;
    const medium = palette.neutral.medium;

    const isFriend = friends.find((friend) => friend._id === friendId);
    const isSelf = friendId === _id;

    const getFriendStatus = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/users/${_id}/${friendId}/friend-status`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                });
            const data = await response.json();
            return data.status;
        } catch (e) {
            setError(e.message);
        }
    }

    useEffect(() => {
        const fetchFriendStatus = async () => {
            const status = await getFriendStatus();
            setFriendStatus(status);
        };
        fetchFriendStatus();
    }, [friendId, _id]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    const removeFriend = async () => {
        try {
            const response = await fetch(
                `http://localhost:3001/users/${_id}/${friendId}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Failed to update friend status");
            }
            const data = await response.json();
            dispatch(setFriends({friends: data}));
        } catch (error) {
            setError(error.message);
        }
    };

    const addNewFriendRequest = async (senderId, receiverId) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_PORT_BACKEND}/users/add-friend`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({senderId, receiverId}),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to send friend request");
            }
            const data = await response.json();
            console.log('data sent friend in friendjsx,', data);
            dispatch(setSentFriends({sentFriends: data.friendship}));
        } catch (error) {
            setError(error.message);
        }
    };

    const acceptFriendRequest = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/users/${friendId}/accept-friend`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({userId: _id}),
            });
            if (!response.ok) {
                throw new Error("Failed to send friend request");
            }
            const data = await response.json();

        } catch (e) {
            setError(e.message);
        }
    }

    const rejectFriendRequest = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/users/${friendId}/reject-friend`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({userId: _id}),
            });
            if (!response.ok) {
                throw new Error("Failed to send friend request");
            }
            const data = await response.json();

        } catch (e) {
            setError(e.message);
        }
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <FlexBetween>
            <FlexBetween gap="1rem">
                <UserImage image={userPicturePath} size="55px"/>
                <Box
                    onClick={() => {
                        navigate(`/profile/${friendId}`);
                        navigate(0);
                    }}
                >
                    <Typography
                        color={main}
                        variant="h5"
                        fontWeight="500"
                        sx={{
                            "&:hover": {
                                cursor: "pointer",
                            },
                        }}
                    >
                        {name}
                    </Typography>
                    <Typography color={medium} fontSize="0.75rem">
                        {subtitle}
                    </Typography>
                </Box>
            </FlexBetween>
            {!isSelf && (
                <Box display="flex" alignItems="center" gap="0.5rem">
                    <Typography>{friendStatus ? `Status: ${friendStatus}` : "Loading..."}</Typography>
                    {/* Tùy chỉnh nút dựa trên trạng thái quan hệ bạn bè */}
                    {friendStatus === "friend" && (
                        <IconButton
                            onClick={async () => {
                                try {
                                    await removeFriend();
                                } catch (error) {
                                    console.error("Error removing friend:", error.message);
                                }
                            }}
                            sx={{backgroundColor: primaryLight, p: "0.6rem"}}
                        >
                            <PersonRemoveOutlined sx={{color: primaryDark}}/>
                        </IconButton>
                    )}
                    {friendStatus === "none" && (
                        <IconButton
                            onClick={async () => {
                                try {
                                    await addNewFriendRequest(_id, friendId);
                                } catch (error) {
                                    console.error("Error sending friend request:", error.message);
                                }
                            }}
                            sx={{backgroundColor: primaryLight, p: "0.6rem"}}
                        >
                            <PersonAddOutlined sx={{color: primaryDark}}/>
                        </IconButton>
                    )}
                    {friendStatus === "waiting" && (
                        <Typography
                            color={main}
                            variant="body2"
                            fontWeight="500"
                            sx={{p: "0.6rem", backgroundColor: primaryLight, borderRadius: "8px"}}
                        >
                            Waiting...
                        </Typography>
                    )}
                    {friendStatus === "requested" && (
                        <>
                            <IconButton
                                onClick={async () => {
                                    try {
                                        await acceptFriendRequest();
                                    } catch (error) {
                                        console.error("Error accepting friend request:", error.message);
                                    }
                                }}
                                sx={{backgroundColor: primaryLight, p: "0.6rem"}}
                            >
                                <Typography sx={{color: primaryDark, fontSize: "0.75rem"}}>
                                    Accept
                                </Typography>
                            </IconButton>
                            <IconButton
                                onClick={async () => {
                                    try {
                                        await rejectFriendRequest();
                                    } catch (error) {
                                        console.error("Error declining friend request:", error.message);
                                    }
                                }}
                                sx={{backgroundColor: palette.error.light, p: "0.6rem"}}
                            >
                                <Typography sx={{color: palette.error.dark, fontSize: "0.75rem"}}>
                                    Decline
                                </Typography>
                            </IconButton>
                        </>
                    )}
                </Box>
            )}
        </FlexBetween>
    );
};

export default Friend;
