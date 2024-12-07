import React from 'react';
import {
  CircularProgress,
  useTheme,
  IconButton,
  Box,
  Paper,
  TextField,
  Fab,
  Typography, Grid
} from '@mui/material';
import { Send, Settings } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { ChatState } from "../Context/ChatProvider";
import { ArrowBack } from '@mui/icons-material';
import { getSender } from '../config/ChatLogics';
import { useSelector } from 'react-redux';
import ScrollableChat from './miscellaneous/ScrollableChat';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import Alert from './miscellaneous/Alert';
import axios from 'axios';
import "./styles.css";


import io from "socket.io-client";
const ENDPOINT = "http://localhost:3001";
let socket, selectedChatCompare;

const ChatDetail = ({fetchAgain, setFetchAgain}) => {
  const loggedUser = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const token = useSelector((state) => state.token);

  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;

  const { selectedChat, setSelectedChat, notification, setNotification } = ChatState();

  //For Alert Component
  const [alertopen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState(""); 


  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `http://localhost:3001/message/${selectedChat._id}`,
        config
      );

      console.log(data);

      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      setAlertOpen(true);
      setAlertMessage("Error Occured!");
    }
  };

  const sendMessage = async () => {
    if (newMessage) {

      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "http://localhost:3001/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );

        console.log(data);
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        setAlertOpen(true);
        setAlertMessage("Error Occurred!");
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", loggedUser);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();


    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {


      if (
        !selectedChatCompare || 
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {

        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

   const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };


  return (
    <>
      <Paper
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        width: '100%',
        height: '100%',
      }}
    >

      {selectedChat ? (
          <>
            <Typography
            fontSize={{ xs: "28px", md: "30px" }}
            pb={3}
            px={2}
            width="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={{ xs: "space-between", md: "flex-start" }}
            alignItems="center"
          >
            <IconButton
              sx={{ display: { xs: "flex", md: "none" } }}
              onClick={() => setSelectedChat("")}
            >
              <ArrowBack />
            </IconButton>
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(loggedUser, selectedChat.users)}
                {/* <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  /> */}
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                      fetchMessages={fetchMessages}
                      fetchAgain={fetchAgain}
                      setFetchAgain={setFetchAgain}
                 />
              </>
            )}
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            padding={3}
            backgroundColor={neutralLight}
            width="100%"
            height="100%"
            borderRadius="10px"
            overflow="hidden"
          >
            {loading ? (
               <Box sx={{ display: 'flex' }}>
                  <CircularProgress 
                    sx={{
                      align: "center",
                      margin: "auto",
                      width: 40,
                      height: 40
                    }}
                  />
               </Box>
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}
            <Grid container style={{ padding: '20px' }}>
              <Grid item xs={11}>
                {istyping ? (<div>Loading ...</div>) : (<></>)}
                <TextField 
                  id="outlined-basic-email" 
                  label="Type Something" 
                  fullWidth
                  onChange={typingHandler}
                  value={newMessage}
                />
              </Grid>
              <Grid xs={1} align="right">
                <Fab color="primary" aria-label="add" onClick={sendMessage}>
                  <Send />
                </Fab>
              </Grid>
            </Grid>

          </Box>
          </>
        
        ) : (
              <Box d="flex" alignItems="center" justifyContent="center" h="100%">
                <Typography
                  fontWeight="bold"
                  fontSize="clamp(1rem, 2rem, 2.25rem)"
                  color="primary"
                >
                  Together
                </Typography>
              </Box>
      )}
    </Paper>
    <Alert
        message={alertMessage}
        open={alertopen}
        onClose={() => setAlertOpen(false)}
    />

    </>
  );
};

export default ChatDetail;
