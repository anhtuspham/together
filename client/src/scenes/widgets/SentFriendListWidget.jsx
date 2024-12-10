import {Box, Typography, useTheme} from "@mui/material";
import Friend from "../../components/Friend";
import WidgetWrapper from "../../components/WidgetWrapper";
import {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {setSentFriends} from "../../state";


const SentFriendListWidget = ({userId}) => {
    const dispatch = useDispatch();
    const {palette} = useTheme();
    const token = useSelector((state) => state.auth.token);
    const sentFriends = useSelector((state) => state.auth.user.sentFriends);

    return (
        <WidgetWrapper>
            <Typography
                color={palette.neutral.dark}
                variant="h5"
                fontWeight="500"
                sx={{mb: "1.5rem"}}
            >
                Lời mời đã gửi
            </Typography>
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
                    <Typography>Không có lời mời.</Typography>
                )}
            </Box>
        </WidgetWrapper>
    );

};

export default SentFriendListWidget;