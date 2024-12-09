import {Box, Typography, useTheme} from "@mui/material";
import Friend from "../../components/Friend";
import WidgetWrapper from "../../components/WidgetWrapper";
import {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {removeReceivedFriend, setFriends, setReceivedFriend} from "../../state";

const ReceivedFriendListWidget = ({userId}) => {
    const dispatch = useDispatch();
    const {palette} = useTheme();
    const token = useSelector((state) => state.auth.token);
    const receivedFriends = useSelector((state) => state.auth.user.receivedFriends);

    return (
        <WidgetWrapper>
            <Typography
                color={palette.neutral.dark}
                variant="h5"
                fontWeight="500"
                sx={{mb: "1.5rem"}}
            >
                Lời mời kết bạn
            </Typography>
            <Box display="flex" flexDirection="column" gap="1.5rem">
                {receivedFriends && Array.isArray(receivedFriends) && receivedFriends.length > 0 ? (
                    receivedFriends.map((receivedFriend) => (
                        <Friend
                            key={receivedFriend._id}
                            friendId={receivedFriend._id}
                            name={`${receivedFriend.firstName} ${receivedFriend.lastName}`}
                            subtitle={receivedFriend.occupation}
                            userPicturePath={receivedFriend.picturePath}
                        />
                    ))
                ) : (
                    <Typography>Không có lời mời kết bạn nào.</Typography>
                )}
            </Box>
        </WidgetWrapper>
    );
};

export default ReceivedFriendListWidget;