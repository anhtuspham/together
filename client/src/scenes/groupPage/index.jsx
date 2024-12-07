import {Box, Typography, useMediaQuery} from "@mui/material";
import {useSelector} from "react-redux";
import Navbar from "../../scenes/navBar";

import JoinedGroups from "../widgets/JoinedGroupWidget.jsx";
import AdminGroups from "../widgets/AdminGroupWidget.jsx"
import PendingGroups from "../widgets/PendingGroups.jsx";
import GroupRequest from "../../components/GroupRequest.jsx";
import UserWidget from "../widgets/UserWidget.jsx";
import FriendListWidget from "../widgets/FriendListWidget.jsx";
import MyPostWidget from "../widgets/MyPostWidget.jsx";
import PostsWidget from "../widgets/PostsWidget.jsx";


const GroupPage = () => {
    const currentUserId = useSelector((state) => state.user._id);

    const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

    return (
        <Box>
            <Navbar />
            <Box
                width="100%"
                padding="2rem 6%"
                display={isNonMobileScreens ? "flex" : "block"}
                gap="2rem"
                justifyContent="center"
            >
                <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
                    <JoinedGroups userId={currentUserId}/>
                    <Box m="2rem 0" />
                    <PendingGroups userId={currentUserId}/>
                </Box>
                <Box
                    flexBasis={isNonMobileScreens ? "42%" : undefined}
                    mt={isNonMobileScreens ? undefined : "2rem"}
                >
                    <AdminGroups userId={currentUserId}/>
                </Box>
            </Box>
        </Box>
    );
};

export default GroupPage;


