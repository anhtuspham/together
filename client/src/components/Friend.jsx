import {PersonAddOutlined, PersonRemoveOutlined} from "@mui/icons-material";
import {Box, IconButton, Snackbar, Typography, useTheme} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {setFriends, setReceivedFriend, setSentFriends} from "../state";
import FlexBetween from "./FlexBetween";
import UserImage from "./UserImage";
import {showNotification} from "../state/notificationSlice.js";

const Friend = ({friendId, name, subtitle, userPicturePath}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {_id} = useSelector((state) => state.auth.user);
    const token = useSelector((state) => state.auth.token);

    const [friendStatus, setFriendStatus] = useState({status: null, isSender: null});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const receivedFriends = useSelector((state) => state.auth.user.receivedFriends);
    const sentFriends = useSelector((state) => state.auth.user.sentFriends);

    const {palette} = useTheme();
    const primaryLight = palette.primary.light;
    const primaryDark = palette.primary.dark;
    const main = palette.neutral.main;
    const medium = palette.neutral.medium;

    const isSelf = friendId === _id;

    const fetchFriendStatus = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/users/${_id}/${friendId}/friend-status`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                });
            if (!response.ok) throw new Error("Failed to fetch friend status");
            const data = await response.json();
            setFriendStatus({status: data.status, isSender: data.isSender});
        } catch (error) {
            setError(error.message);
        }
    }

    const getSentFriendsRequest = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_PORT_BACKEND}/users/${_id}/sent-friend-requests`,
                {
                    method: "GET",
                    headers: {Authorization: `Bearer ${token}`},
                }
            );
            const data = await response.json();
            dispatch(setSentFriends({sentFriends: data}));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getReceivedFriendsRequest = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_PORT_BACKEND}/users/${_id}/received-friend-requests`,
                {
                    method: "GET",
                    headers: {Authorization: `Bearer ${token}`},
                }
            );
            const data = await response.json();
            dispatch(setReceivedFriend({receivedFriends: data}));

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const addNewFriendRequest = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_PORT_BACKEND}/users/add-friend`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({senderId: _id, receiverId: friendId}),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to send friend request");
            }

            if (response.ok) {
                await fetchFriendStatus();
                await getSentFriendsRequest();
                await getReceivedFriendsRequest();

                dispatch(
                    showNotification({
                        message: "Đã gửi lời mời!",
                        type: "success",
                    })
                );
            }

        } catch (error) {
            setError(error.message);
        }
    };

    const getFriends = async () => {
        const response = await fetch(
            `${import.meta.env.VITE_PORT_BACKEND}/users/${_id}/friends`,
            {
                method: "GET",
                headers: {Authorization: `Bearer ${token}`},
            }
        );
        const data = await response.json();
        dispatch(setFriends({friends: data}));
    };


    useEffect(() => {
        const init = async () => {
            await fetchFriendStatus();
            await getSentFriendsRequest();
            await getReceivedFriendsRequest();
            await getFriends();
        };
        init();
    }, [_id]);

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
            await getReceivedFriendsRequest();
            await fetchFriendStatus();
            await getFriends();

            if (response.ok) {
                dispatch(
                    showNotification({
                        message: "Kết bạn thành công!",
                        type: "success",
                    })
                );
            }

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
            } else if (response.ok) {
                await getReceivedFriendsRequest();
                await getFriends();
                await fetchFriendStatus();

                dispatch(
                    showNotification({
                        message: "Đã từ chối",
                        type: "success",
                    })
                );
            }

        } catch (e) {
            setError(e.message);
        }
    }

    const removeFriend = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_PORT_BACKEND}/users/${_id}/${friendId}`,
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
            } else if (response.ok) {
                const data = await response.json();
                dispatch(setFriends({friends: data}));
                await fetchFriendStatus();

                dispatch(
                    showNotification({
                        message: "Đã xóa bạn khỏi danh sách",
                        type: "success",
                    })
                );
            }
        } catch (error) {
            setError(error.message);
        }
    };


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
                    {/* hello*/}
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

                    {friendStatus.status === "friend" && (
                        <IconButton
                            onClick={removeFriend}
                            sx={{backgroundColor: primaryLight, p: "0.6rem"}}
                        >
                            <PersonRemoveOutlined sx={{color: primaryDark}}/>
                        </IconButton>
                    )}
                    {friendStatus.status === "none" && (
                        <IconButton
                            onClick={addNewFriendRequest}
                            sx={{backgroundColor: primaryLight, p: "0.6rem"}}
                        >
                            <PersonAddOutlined sx={{color: primaryDark}}/>
                        </IconButton>
                    )}

                    {friendStatus.status === 'pending' && (
                        <>
                            {friendStatus.isSender ? (
                                <Typography
                                    color={main}
                                    variant="body2"
                                    fontWeight="500"
                                    sx={{p: "0.6rem", backgroundColor: primaryLight, borderRadius: "8px"}}
                                >
                                    Waiting...
                                </Typography>
                            ) : (<>
                                <IconButton
                                    onClick={acceptFriendRequest}
                                    sx={{backgroundColor: primaryLight, p: "0.6rem"}}
                                >
                                    <Typography sx={{color: primaryDark, fontSize: "0.75rem"}}>
                                        Accept
                                    </Typography>
                                </IconButton>
                                <IconButton
                                    onClick={rejectFriendRequest}
                                    sx={{backgroundColor: palette.error.light, p: "0.6rem"}}
                                >
                                    <Typography sx={{color: palette.error.dark, fontSize: "0.75rem"}}>
                                        Decline
                                    </Typography>
                                </IconButton>
                            </>)}
                        </>
                    )}
                </Box>
            )}
        </FlexBetween>
    );
};

export default Friend;
