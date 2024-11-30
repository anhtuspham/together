import {PersonAddOutlined, PersonRemoveOutlined} from "@mui/icons-material";
import {Box, IconButton, Typography, useTheme} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {setFriends, setReceivedFriend, setSentFriends} from "../state";
import FlexBetween from "./FlexBetween";
import UserImage from "./UserImage";

const Friend = ({friendId, name, subtitle, userPicturePath}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {_id} = useSelector((state) => state.user);
    const token = useSelector((state) => state.token);

    const [friendStatus, setFriendStatus] = useState({status: null, isSender: null});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const receivedFriends = useSelector((state) => state.user.receivedFriends);
    const sentFriends = useSelector((state) => state.user.sentFriends);

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
                `http://localhost:3001/users/${_id}/sent-friend-requests`,
                {
                    method: "GET",
                    headers: {Authorization: `Bearer ${token}`},
                }
            );
            const data = await response.json();
            dispatch(setSentFriends({sentFriends: data}));
            console.log('data', data, 'set sent friend: ', sentFriends)
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getReceivedFriendsRequest = async () => {
        try {
            const response = await fetch(
                `http://localhost:3001/users/${_id}/received-friend-requests`,
                {
                    method: "GET",
                    headers: {Authorization: `Bearer ${token}`},
                }
            );
            const data = await response.json();
            dispatch(setReceivedFriend({receivedFriends: data}));
            console.log('data in received', data, 'set received friend: ', receivedFriends)

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
            const data = await response.json();
            await fetchFriendStatus();
            await getSentFriendsRequest();
            await getReceivedFriendsRequest();

        } catch (error) {
            setError(error.message);
        }
    };

    const getFriends = async () => {
        const response = await fetch(
            `http://localhost:3001/users/${_id}/friends`,
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
            await getReceivedFriendsRequest();
            await getFriends();
            await fetchFriendStatus();

        } catch (e) {
            setError(e.message);
        }
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
            await fetchFriendStatus();
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
