import { Box, Typography, useTheme } from "@mui/material";
import Friend from "../../components/Friend";
import WidgetWrapper from "../../components/WidgetWrapper";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {setFriends, setSentFriends} from "../../state";

const SentFriendListWidget = ({ userId }) => {
    const dispatch = useDispatch();
    const { palette } = useTheme();
    const token = useSelector((state) => state.token);
    const sentFriends = useSelector((state) => state.user.sentFriends);

    const getSentFriendsRequest = async () => {
        const response = await fetch(
            `http://localhost:3001/users/${userId}/sent-friend-requests`,
            {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        const data = await response.json();
        dispatch(setSentFriends({ sentFriends: data }));
    };

    useEffect(() => {
        getSentFriendsRequest();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    return (
        <WidgetWrapper>
            <Typography
                color={palette.neutral.dark}
                variant="h5"
                fontWeight="500"
                sx={{ mb: "1.5rem" }}
            >
                Wait to accept
            </Typography>
            <Box display="flex" flexDirection="column" gap="1.5rem">
                {sentFriends ? sentFriends.map((sentFriend) => (
                    <Friend
                        key={sentFriend._id}
                        friendId={sentFriend._id}
                        name={`${sentFriend.firstName} ${sentFriend.lastName}`}
                        subtitle={sentFriend.occupation}
                        userPicturePath={sentFriend.picturePath}
                    />
                )) : []}
            </Box>
        </WidgetWrapper>
    );
};

export default SentFriendListWidget;