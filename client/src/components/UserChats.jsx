import {
    Box,
    Divider,
    Typography,
    Button,
    Stack,
    useTheme,
} from "@mui/material";
import axios from "axios";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ChatState } from "../Context/ChatProvider";
import WidgetWrapper from "./WidgetWrapper";
import { GroupAdd } from "@mui/icons-material";
import ChatLoading from "./miscellaneous/ChatLoading";
import { getSender } from "../config/ChatLogics";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { showNotification } from "../state/notificationSlice";

const UserChats = ({ fetchAgain, setFetchAgain }) => {
    const { selectedChat, setSelectedChat, chats, setChats } = ChatState();
    const loggedUser = useSelector((state) => state.auth.user);
    const token = useSelector((state) => state.auth.token);
    const { palette } = useTheme();
    const dispatch = useDispatch();

    const fetchChats = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const { data } = await axios.get(
                `${import.meta.env.VITE_PORT_BACKEND}/chat`,
                config
            );
            setChats(data);
        } catch (error) {
            dispatch(
                showNotification({
                    message: "Có lỗi khi tải danh sách chat!",
                    type: "error",
                })
            );
        }
    };

    useEffect(() => {
        fetchChats();
    }, [fetchAgain]);

    return (
        <WidgetWrapper
            sx={{
                width: { xs: "100%", md: "70%%" },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100%",
                overflow: "hidden",
                padding: "16px",
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                }}
            >
                <Typography
                    fontWeight="bold"
                    fontSize="1.5rem"
                    color={palette.primary.main}
                >
                    Kênh Chat Của Bạn
                </Typography>
            </Box>
            <Divider sx={{ width: "100%", marginBottom: "16px" }} />

            <Box
                sx={{
                    flexGrow: 1,
                    width: "100%",
                    borderRadius: "8px",
                    overflowY: "auto",
                    backgroundColor: palette.background.default,
                    padding: "16px",
                    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
                }}
            >
                {chats ? (
                    <Stack spacing={2}>
                        {chats.map((chat) => (
                            <Box
                                key={chat._id}
                                onClick={() => setSelectedChat(chat)}
                                sx={{
                                    cursor: "pointer",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    backgroundColor:
                                        selectedChat === chat ? palette.primary.main : palette.background.paper,

                                }}
                            >
                                <Typography fontWeight="bold">
                                    {!chat.isGroupChat
                                        ? getSender(loggedUser, chat.users)
                                        : chat.chatName}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <ChatLoading />
                )}
            </Box>
            <Divider sx={{ width: "100%", marginY: "16px" }} />

            <GroupChatModal>
                <Button
                    variant="contained"
                    endIcon={<GroupAdd />}
                    sx={{
                        alignSelf: "flex-end",
                        backgroundColor: palette.primary.main,
                    }}
                >
                    Thêm Nhóm Chat Mới
                </Button>
            </GroupChatModal>
        </WidgetWrapper>
    );
};

export default UserChats;
