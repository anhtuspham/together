import {Box, Typography, useTheme} from "@mui/material";
import Friend from "../../components/Friend";
import WidgetWrapper from "../../components/WidgetWrapper";
import {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {removeReceivedFriend, setFriends} from "../../state";

const FriendListWidget = ({userId}) => {
    const dispatch = useDispatch();
    const {palette} = useTheme();
    const token = useSelector((state) => state.auth.token);
    const friends = useSelector((state) => state.auth.user.friends);

    const getFriends = async () => {
        const response = await fetch(
            `${import.meta.env.VITE_PORT_BACKEND}/users/${userId}/friends`,
            {
                method: "GET",
                headers: {Authorization: `Bearer ${token}`},
            }
        );
        const data = await response.json();
        dispatch(setFriends({friends: data}));
    };

    useEffect(() => {
        getFriends();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <WidgetWrapper>
            <Typography
                color={palette.neutral.dark}
                variant="h5"
                fontWeight="500"
                sx={{mb: "1.5rem"}}
            >
                Danh sách bạn bè
            </Typography>
            <Box display="flex" flexDirection="column" gap="1.5rem">
                {friends && Array.isArray(friends) && friends.length > 0 ?
                    friends.map((friend) => (
                        <Friend
                            key={friend._id}
                            friendId={friend._id}
                            name={`${friend.firstName} ${friend.lastName}`}
                            subtitle={friend.occupation}
                            userPicturePath={friend.picturePath}
                        />
                    ))
                    : (
                        <Typography>Bạn đang không có bạn bè nào, hãy tìm thêm bạn mới</Typography>
                    )}
            </Box>
        </WidgetWrapper>
    );
};

export default FriendListWidget;