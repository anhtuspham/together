import { Box, Typography, useTheme } from "@mui/material";
import Friend from "../../components/Friend";
import WidgetWrapper from "../../components/WidgetWrapper";
import {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import {setSentFriends} from "../../state";


const SentFriendListWidget = ({ userId }) => {
    const dispatch = useDispatch();
    const { palette } = useTheme();
    const token = useSelector((state) => state.token);
    const sentFriends = useSelector((state) => state.user.sentFriends);
    const [loading, setLoading] = useState(false);


    const getSentFriendsRequest = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:3001/users/${userId}/sent-friend-requests`,
                {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const data = await response.json();
            dispatch(setSentFriends({ sentFriends: data }));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getSentFriendsRequest();
    }, [sentFriends]);



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
            {loading ? (
                <Typography>Loading...</Typography>
            ) : (
                <Box display="flex" flexDirection="column" gap="1.5rem">
                    {sentFriends && Array.isArray(sentFriends) && sentFriends.length > 0 ? (
                        sentFriends.map((sentFriend) => (
                            <Friend
                                key={sentFriend._id}
                                friendId={sentFriend._id}
                                name={`${sentFriend.firstName} ${sentFriend.lastName}`}
                                subtitle={sentFriend.occupation}
                                userPicturePath={sentFriend.picturePath}
                            />
                        ))
                    ) : (
                        <Typography>No friend requests found.</Typography>
                    )}
                </Box>
            )}
        </WidgetWrapper>
    );

};

export default SentFriendListWidget;