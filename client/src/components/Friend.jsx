import {PersonAddOutlined, PersonRemoveOutlined} from "@mui/icons-material";
import {Box, IconButton, Typography, useTheme} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {setFriends} from "../state";
import FlexBetween from "./FlexBetween";
import UserImage from "./UserImage";

const Friend = ({friendId, name, subtitle, userPicturePath}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {_id} = useSelector((state) => state.user);
    const token = useSelector((state) => state.token);
    const friends = useSelector((state) => state.user.friends);
    const [error, setError] = useState(null);
    console.log('friend', friends);

    const {palette} = useTheme();
    const primaryLight = palette.primary.light;
    const primaryDark = palette.primary.dark;
    const main = palette.neutral.main;
    const medium = palette.neutral.medium;

    const isFriend = friends.find((friend) => friend._id === friendId);
    const isSelf = friendId === _id;

    const patchFriend = async () => {
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
                `${import.meta.env.VITE_PORT_BACKEND}/users/addFriend`,
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
            dispatch(setFriends({friends: data}));
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
                <IconButton
                    onClick={async () => {
                        try {
                            if (isFriend) {
                                await patchFriend(); // Chờ xử lý xong việc gỡ bạn bè
                            } else {
                                await addNewFriendRequest(_id, friendId); // Chờ xử lý xong yêu cầu kết bạn
                            }
                        } catch (error) {
                            console.error("Error updating friend status:", error.message);
                        }
                    }}
                    sx={{backgroundColor: primaryLight, p: "0.6rem"}}
                >
                    {isFriend ? (
                        <PersonRemoveOutlined sx={{color: primaryDark}}/>
                    ) : (
                        <PersonAddOutlined sx={{color: primaryDark}}/>
                    )}
                </IconButton>
            )}
        </FlexBetween>
    );
};

export default Friend;
