import {useState, useRef, useEffect} from "react";
import {
  Box,
  Button,
  IconButton,
  InputBase,
  Typography,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  useMediaQuery,
  Badge
} from "@mui/material";
import {
  Message,
  DarkMode,
  LightMode,
  Notifications,
  Bookmarks,
  Menu,
  Close,
  AccessTimeFilledOutlined, Groups2,
} from "@mui/icons-material";

import { useDispatch, useSelector } from "react-redux";
import { setMode, setLogout } from "../../state";
import { useNavigate } from "react-router-dom";
import FlexBetween from '../../components/FlexBetween';
import SearchBar from "../../components/SearchBar";
import { ChatState } from "../../Context/ChatProvider";
import { getSender } from "../../config/ChatLogics";


const Navbar = () => {

  //Used to toggle navbar menu in mobile screen  
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const {
    setSelectedChat,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();
  // const {user, _id, picturePath} = useSelector((state) => state.user);

  //Hook in Material UI that allows to determine whether current screen size is 
  // below this min-width or higher than it
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");


  //Notification Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const spanRef = useRef();
  const handleClick = (event) => {
    event.preventDefault();
    setAnchorEl(spanRef.current);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  //Allows us to use theme settings that we defined in Theme file 
  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const background = theme.palette.background.default;
  const primaryLight = theme.palette.primary.light;
  const alt = theme.palette.background.alt;

  // notification
  const [notifications, setNotifications] = useState([]);
  const [isNotificationPopupOpen, setIsNotificationPopupOpen] = useState(false);

  //Making a variable for full name of user
  const fullName = `${user.firstName} ${user.lastName}`;

  const fetchNotifications = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/notification/${userId}`);
      const data = await response.json();
      console.log('data: ', data)
      return data; // Giả sử API trả về một mảng notifications
    } catch (error) {
      console.error('Error fetching notifications', error);
    }
  };
  const handleMarkAsRead = async (notifId) => {
    // Gửi request để đánh dấu notification là đã đọc
    try {
      await fetch(`${import.meta.env.VITE_PORT_BACKEND}/notification/${notifId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setNotifications(notifications.map((notif) =>
          notif._id === notifId ? { ...notif, isRead: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read', error);
    }
  };


  const handleNotificationClick = () => {
    setIsNotificationPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsNotificationPopupOpen(false);
  };



  useEffect(() => {
    const getNotifications = async () => {
      const notifications = await fetchNotifications(user._id);
      setNotifications(notifications);
    };

    getNotifications();
  }, [user._id]);

  return (
    <FlexBetween padding="1rem 6%" backgroundColor={alt} ref={spanRef}>
      <FlexBetween gap="1.75rem" >
        <Typography
          fontWeight="bold"

          fontSize="clamp(1rem, 2rem, 2.25rem)"
          color="primary"

          onClick={() => navigate("/home")}
          //CSS for logo image
          sx={{
            "&:hover": {
              color: primaryLight,
              cursor: "pointer",
            },
          }}
        >
          Together
        </Typography>
        {isNonMobileScreens && (
          <SearchBar/>
        )}
      </FlexBetween>

      {/* DESKTOP NAV */ }
      {isNonMobileScreens ? (
        <FlexBetween gap="2rem">

          <IconButton onClick={() => dispatch(setMode())}>
            {theme.palette.mode === "dark" ? (
              <DarkMode sx={{ fontSize: "25px" }} />
            ) : (
              <LightMode sx={{ color: dark, fontSize: "25px" }} />
            )}
          </IconButton>

          <IconButton onClick = {() => navigate("/chat")}>
            <Message
              sx={{ fontSize: "25px" }} />
          </IconButton>


          {/* <Notifications sx={{ fontSize: "25px" }} /> */}

          <IconButton onClick={handleNotificationClick} size="large">
            <Badge badgeContent={notifications.filter(n => !n.isRead).length} color="secondary" showZero>
              <Notifications sx={{ fontSize: "25px" }} />
            </Badge>
          </IconButton>
          {isNotificationPopupOpen && (
              <Box
                  position="fixed"
                  right="210px"
                  top="90px"
                  width="300px"
                  backgroundColor={background}
                  boxShadow={3}
                  padding="1rem"
                  zIndex={10}
                  display="flex"
                  flexDirection="column"
                  gap="1rem"
              >
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6">Notifications</Typography>
                  <IconButton onClick={handleClosePopup}>
                    <Close />
                  </IconButton>
                </Box>

                {notifications.length === 0 ? (
                    <Typography>No notifications</Typography>
                ) : (
                    notifications.map((notif) => (
                        <Box key={notif._id} padding="0.5rem" borderBottom="1px solid" borderColor={neutralLight}>
                          <Typography>{notif.message}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {notif.createdAt}
                          </Typography>
                          {!notif.isRead && (
                              <Button
                                  onClick={() => handleMarkAsRead(notif._id)}
                                  variant="contained"
                                  size="small"
                                  color="primary"
                              >
                                Mark as Read
                              </Button>
                          )}
                        </Box>
                    ))
                )}
              </Box>
          )}

          {/* GROUP */}

          <IconButton onClick={() => navigate("/group")}>
            <Groups2/>
          </IconButton>

          {/* Activity */}
          <IconButton onClick={() => navigate("/activity")} size="large">
            <AccessTimeFilledOutlined/>
          </IconButton>

          <IconButton onClick = {() => navigate("/saved/${user._id}")}>
            <Bookmarks
              sx={{ fontSize: "25px" }} />
          </IconButton>
          {/* Dropdown for login and logout */}
          <FormControl variant="standard" value={fullName}>
            <Select
              value={fullName}
              sx={{
                backgroundColor: neutralLight,
                width: "150px",
                borderRadius: "0.25rem",
                p: "0.25rem 1rem",
                "& .MuiSvgIcon-root": {
                  pr: "0.25rem",
                  width: "3rem",
                },
                "& .MuiSelect-select:focus": {
                  backgroundColor: neutralLight,
                },
              }}
              input={<InputBase />}
            >
              <MenuItem value={fullName}>
                <Typography>{fullName}</Typography>
              </MenuItem>
              <MenuItem onClick={() => dispatch(setLogout())}>Log Out</MenuItem>
            </Select>
          </FormControl>
        </FlexBetween>
      ) : (
        <IconButton
          onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
        >
          <Menu />
        </IconButton>
      )}

      {/* MOBILE NAV */}
      {!isNonMobileScreens && isMobileMenuToggled && (
        <Box
          position="fixed"
          right="0"
          bottom="0"
          height="100%"
          zIndex="10"
          maxWidth="500px"
          minWidth="300px"
          backgroundColor={background}
        >
          {/* CLOSE ICON */}
          <Box display="flex" justifyContent="flex-end" p="1rem">
            <IconButton
              onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
            >
              <Close />
            </IconButton>
          </Box>

          {/* MENU ITEMS */}
          <FlexBetween
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap="3rem"
          >
            <SearchBar />

            {/* MODE */}
            <IconButton
              onClick={() => dispatch(setMode())}
              sx={{ fontSize: "25px" }}
            >
              {theme.palette.mode === "dark" ? (
                <DarkMode sx={{ fontSize: "25px" }} />
              ) : (
                <LightMode sx={{ color: dark, fontSize: "25px" }} />
              )}
            </IconButton>

            {/* MESSAGE */}
            <Message
              onClick = {() => navigate("/chat")}
              sx={{ fontSize: "25px" }} />

            {/* NOTIFICATION */}
            <IconButton onClick={handleClick} size="large">
              <Badge
                badgeContent={notification.length}
                color="secondary"
                showZero
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <Notifications fontSize="large" onClick = {() => navigate("/chat")}/>
              </Badge>
            </IconButton>

            <IconButton onClick={() => navigate("/group")}>
              <Groups2/>
            </IconButton>

            {/* Activity */}
            <IconButton onClick={() => navigate("/activity")} size="large">
              <AccessTimeFilledOutlined/>
            </IconButton>

            {/* SAVE button */}
            <IconButton>
              <Bookmarks
                onClick = {() => navigate("/saved/${user._id}")}
                sx={{ fontSize: "25px" }} />
            </IconButton>

            <FormControl variant="standard" value={fullName}>
              <Select
                value={fullName}
                sx={{
                  backgroundColor: neutralLight,
                  width: "150px",
                  borderRadius: "0.25rem",
                  p: "0.25rem 1rem",
                  "& .MuiSvgIcon-root": {
                    pr: "0.25rem",
                    width: "3rem",
                  },
                  "& .MuiSelect-select:focus": {
                    backgroundColor: neutralLight,
                  },
                }}
                input={<InputBase />}
              >
                <MenuItem value={fullName}>
                  <Typography>{fullName}</Typography>
                </MenuItem>
                <MenuItem onClick={() => dispatch(setLogout())}>
                  Log Out
                </MenuItem>
              </Select>
            </FormControl>
          </FlexBetween>
        </Box>
      )}
    </FlexBetween>
  );
};

export default Navbar;