import {Box, useMediaQuery} from "@mui/material";
import {useSelector} from "react-redux";
import Navbar from "../../scenes/navBar";
import UserWidget from "../../scenes/widgets/UserWidget";
import MyPostWidget from "../../scenes/widgets/MyPostWidget";
import PostsWidget from "../../scenes/widgets/PostsWidget";
import FriendListWidget from "../../scenes/widgets/FriendListWidget";
import ReceivedFriendListWidget from "../widgets/ReceivedFriendListWidget.jsx";
import SentFriendListWidget from "../widgets/SentFriendListWidget.jsx";
import GroupRequest from "../../components/GroupRequest.jsx";

const HomePage = () => {
    const isNonMobileScreens = useMediaQuery("(min-width:1000px");
    const {_id, picturePath} = useSelector((state) => state.auth.user);

    return (
        <Box>
            <Navbar/>
            <Box
                width="100%"
                padding="2rem 2%"
                display={isNonMobileScreens ? "flex" : "block"}
                gap="0.5rem"
                justifyContent="space-between"
            >
                <Box flexBasis={isNonMobileScreens ? "20%" : undefined}>
                    <UserWidget userId={_id} picturePath={picturePath}/>
                </Box>
                <Box
                    flexBasis={isNonMobileScreens ? "40%" : undefined}
                    mt={isNonMobileScreens ? undefined : "2rem"}
                >
                    <MyPostWidget picturePath={picturePath}/>
                    <PostsWidget userId={_id}/>
                </Box>
                {isNonMobileScreens && (
                    <Box flexBasis="20%">
                        <FriendListWidget userId={_id}/>
                        <Box m="2rem 0"/>
                        <ReceivedFriendListWidget userId={_id}/>
                        <Box m="2rem 0"/>
                        <SentFriendListWidget userId={_id}/>
                        <Box m="2rem 0"/>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default HomePage;
