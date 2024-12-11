import React, {useRef} from 'react';
import {
    CircularProgress,
    useTheme,
    IconButton,
    Box,
    Paper,
    TextField,
    Fab,
    Typography, Grid, Dialog, DialogActions, Button, DialogTitle, DialogContent
} from '@mui/material';
import {Call, CallEnd, Send, Settings} from '@mui/icons-material';
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
const ENDPOINT = `${import.meta.env.VITE_PORT_BACKEND}`;
let socket, selectedChatCompare;

const ChatDetail = ({fetchAgain, setFetchAgain}) => {
    const loggedUser = useSelector((state) => state.auth.user);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const token = useSelector((state) => state.auth.token);

    const theme = useTheme();
    const neutralLight = theme.palette.neutral.light;

    const { selectedChat, setSelectedChat, notification, setNotification } = ChatState();

    //For Alert Component
    const [alertopen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");

    const [isInCall, setIsInCall] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);

    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    };

    useEffect(() => {
        socket = io(ENDPOINT);
        // socket.emit("setup", loggedUser);
        if (socket && loggedUser) {
            // Join a room specific to the logged-in user
            socket.emit("setup", loggedUser);
        }
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

    useEffect(() => {
        // Socket listeners for WebRTC
        socket.on('incoming-call', (data) => {
            if (selectedChat && data.chatId === selectedChat._id) {
                setIncomingCall(data);
            }
        });

        socket.on('call-answered', async (data) => {
            // Verify the answer is for the current chat
            if (selectedChat && data.chatId === selectedChat._id) {
                if (peerConnectionRef.current) {
                    try {
                        await peerConnectionRef.current.setRemoteDescription(
                            new RTCSessionDescription(data.answer)
                        );
                    } catch (error) {
                        console.error('Error setting remote description:', error);
                    }
                }
            }
        });

        socket.on('ice-candidate', async (data) => {
            // Verify the ICE candidate is for the current chat
            if (selectedChat && data.chatId === selectedChat._id) {
                if (peerConnectionRef.current && data.candidate) {
                    try {
                        await peerConnectionRef.current.addIceCandidate(
                            new RTCIceCandidate(data.candidate)
                        );
                    } catch (error) {
                        console.error('Error adding ICE candidate:', error);
                    }
                }
            }
        });

        socket.on('call-ended', (data) => {
            // Check if the ended call is for the current chat
            if (selectedChat && data.chatId === selectedChat._id) {
                endCall();
            }
        });

        return () => {
            // Clean up socket listeners
            socket.off('incoming-call');
            socket.off('call-answered');
            socket.off('ice-candidate');
            socket.off('call-ended');
        };
    }, [socket]);

    const startCall = async () => {
        if (!selectedChat) {
            console.log('start call not happen')
            setAlertOpen(true);
            setAlertMessage("Please select a chat before starting a call");
            return;
        }

        try {

            setIsInCall(true);
            console.log('call is true');

            // Get user media
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Create peer connection
            peerConnectionRef.current = new RTCPeerConnection(configuration);

            // Add local stream tracks to peer connection
            stream.getTracks().forEach(track => {
                peerConnectionRef.current.addTrack(track, stream);
            });

            // Create offer
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);

            console.log('create offer')

            // Send offer to other user
            socket.emit('start-call', {
                chatId: selectedChat._id,
                offer: offer,
                caller: loggedUser.name // Include caller information
            });

            console.log('after start-call')

            // Setup peer connection event handlers
            setupPeerConnectionListeners(stream);
        } catch (error) {
            console.error('Error starting call:', error);
            setIsInCall(false);
            setAlertOpen(true);
            setAlertMessage("Failed to start call. Please check your camera and microphone permissions.");
        }
    };

    const setupPeerConnectionListeners = (localStream) => {
        const pc = peerConnectionRef.current;

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', {
                    candidate: event.candidate,
                    chatId: selectedChat._id
                });
            }
        };

        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };
        console.log('setupPeer');
    };

    const answerCall = async () => {
        if (!incomingCall) return;
        try {
            // Get user media
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Create peer connection
            peerConnectionRef.current = new RTCPeerConnection(configuration);

            // Add local stream tracks to peer connection
            stream.getTracks().forEach(track => {
                peerConnectionRef.current.addTrack(track, stream);
            });

            // Set remote description
            await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(incomingCall.offer)
            );

            // Create answer
            const answer = await peerConnectionRef.current.createAnswer();
            await peerConnectionRef.current.setLocalDescription(answer);

            // Send answer
            socket.emit('answer-call', {
                chatId: incomingCall.chatId,
                answer: answer
            });

            setIsInCall(true);
            setIncomingCall(null);

            // Setup peer connection event listeners
            setupPeerConnectionListeners(stream);
        } catch (error) {
            console.error('Error answering call:', error);
            endCall();
        }
    };

    const endCall = () => {
        // Stop all tracks
        if (localVideoRef.current?.srcObject) {
            localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        if (remoteVideoRef.current?.srcObject) {
            remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }

        // Close peer connection
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
        }

        // Emit end call event
        socket.emit('end-call', {
            chatId: selectedChat._id
        });

        // Reset states
        setIsInCall(false);
        setIncomingCall(null);

        // Clear video sources
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    };



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
                `${import.meta.env.VITE_PORT_BACKEND}/message/${selectedChat._id}`,
                config
            );

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
                    `${import.meta.env.VITE_PORT_BACKEND}/message`,
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
            {/* Incoming Call Dialog */}
            {incomingCall && (
                <Dialog
                    open={!!incomingCall}
                    onClose={() => setIncomingCall(null)}
                >
                    <DialogTitle>Incoming Call</DialogTitle>
                    <DialogContent>
                        <Typography>
                            {incomingCall.caller} is calling...
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={answerCall} color="primary">
                            Answer
                        </Button>
                        <Button
                            onClick={() => {
                                // Optionally send a reject signal
                                socket.emit('reject-call', {
                                    chatId: incomingCall.chatId
                                });
                                setIncomingCall(null);
                            }}
                            color="secondary"
                        >
                            Decline
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
            <Paper
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'start',
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

            {/* Call Button */}
            <IconButton
                onClick={startCall}
                disabled={!selectedChat}
                color="primary"
            >
                <Call />
            </IconButton>

            {/* Video Call Modal */}
            <Dialog
                open={isInCall}
                onClose={endCall}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>Video Call</DialogTitle>
                <DialogContent>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            height: '500px'
                        }}
                    >
                        <Box
                            sx={{
                                width: '48%',
                                backgroundColor: 'black',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        </Box>
                        <Box
                            sx={{
                                width: '48%',
                                backgroundColor: 'black',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={endCall}
                        color="secondary"
                        startIcon={<CallEnd />}
                    >
                        End Call
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    );
};

export default ChatDetail;