import {
  ManageAccountsOutlined,
  EditOutlined,
  LocationOnOutlined,
  WorkOutlineOutlined, MailLockOutlined, Mail, MailOutlined,
} from "@mui/icons-material";
  import {Box, Typography, Divider, useTheme, Button, TextField} from "@mui/material";
  import UserImage from "../../components/UserImage";
  import FlexBetween from "../../components/FlexBetween";
  import WidgetWrapper from "../../components/WidgetWrapper";
  import { useSelector } from "react-redux";
  import { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import logo from '../../assets/ute.jpg';

  const UserWidget = ({ userId, picturePath }) => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const { palette } = useTheme();
    const navigate = useNavigate();
    const token = useSelector((state) => state.token);
    const currFriends = useSelector((state) => state.user.friends);
    const dark = palette.neutral.dark;
    const medium = palette.neutral.medium;
    const main = palette.neutral.main;

    const getUser = async () => {
      const response = await fetch(`http://localhost:3001/users/${userId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUser(data);

      setFormData({
        email: data.email || "",
        location: data.location || "",
        occupation: data.occupation || "",
      });
    };

    const updateUser = async () => {
      const response = await fetch(`http://localhost:3001/users/${userId}/editInfo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const updatedData = await response.json();
        setUser(updatedData);
        setIsEditing(false);
      }
    };

    useEffect(() => {
      getUser();
    }, [currFriends]); // eslint-disable-line react-hooks/exhaustive-deps

    //Can put a loading component here
    if (!user) {
      return null;
    }

    const {
      firstName,
      lastName,
      location,
      occupation,
      friends,
        email,
    } = user;

    return (
      <WidgetWrapper>
        {/* FIRST ROW */}
        <FlexBetween
          gap="0.5rem"
          // pb is padding bottom
          pb="1.1rem"
          onClick={() => navigate(`/profile/${userId}`)}
        >
          <FlexBetween gap="1rem">
            <UserImage image={picturePath} />
            <Box>
              <Typography
                variant="h4"
                color={dark}
                fontWeight="500"
                sx={{
                  "&:hover": {
                    cursor: "pointer",
                  },
                }}
              >
                {firstName} {lastName}
              </Typography>
              <Typography color={medium}>{friends.length} friends</Typography>
            </Box>
          </FlexBetween>
          <Button
              startIcon={<ManageAccountsOutlined />}
              onClick={() => setIsEditing(!isEditing)}
              variant="contained"
              color="primary"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </FlexBetween>

        <Divider />

        {/* SECOND ROW */}
        {isEditing ? (
            <Box p="1rem 0">
              <Box display="flex" alignItems="center" gap="1rem" mb="1rem">
                <LocationOnOutlined fontSize="large" sx={{ color: main }} />
                <TextField
                    label="Location"
                    variant="outlined"
                    placeholder="Langa"
                    fullWidth
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </Box>
              <Box display="flex" alignItems="center" gap="1rem" mb="1rem">
                <WorkOutlineOutlined fontSize="large" sx={{ color: main }} />
                <TextField
                    label="Occupation"
                    variant="outlined"
                    placeholder="Engineer"
                    fullWidth
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                />
              </Box>
              <Box display="flex" alignItems="center" gap="1rem" mb="1rem">
                <MailOutlined fontSize="large" sx={{ color: main }} />
                <TextField
                    label="Email"
                    variant="outlined"
                    placeholder="@gmail.com"
                    disabled="true"
                    fullWidth
                    value={formData.email}
                    // onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Box>
              <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={updateUser}
              >
                Save Changes
              </Button>
            </Box>
        ) : (
            <Box p="1rem 0">
              <Box display="flex" alignItems="center" gap="1rem" mb="0.5rem">
                <LocationOnOutlined fontSize="large" sx={{ color: main }} />
                <Typography color={medium}>{location}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap="1rem" mb="0.5rem">
                <WorkOutlineOutlined fontSize="large" sx={{ color: main }} />
                <Typography color={medium}>{occupation}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap="1rem" mb="0.5rem">
                <MailOutlined fontSize="large" sx={{ color: main }} />
                <Typography color={medium}>{email}</Typography>
              </Box>
            </Box>
        )}

        <Divider />

        <Divider />

        {/* FOURTH ROW */}
        <Box p="1rem 0">
          <Typography fontSize="1rem" color={main} fontWeight="500" mb="1rem">
            My Group
          </Typography>

          <FlexBetween gap="1rem" mb="0.5rem">
            <FlexBetween gap="1rem">
              <img src={logo} alt="ute" style={{width: '25px', height: '25px'}}/>
              <Box>
                <Typography color={main} fontWeight="500">
                  UTE
                </Typography>
                <Typography color={medium}>01 Vo Van Ngan</Typography>
              </Box>
            </FlexBetween>
            <EditOutlined sx={{ color: main }} />
          </FlexBetween>

          <FlexBetween gap="1rem">
            <FlexBetween gap="1rem">
              <img src={logo} alt="ute" style={{width: '25px', height: '25px'}}/>
              <Box>
                <Typography color={main} fontWeight="500">
                  HCM
                </Typography>
                <Typography color={medium}>HCMUTE</Typography>
              </Box>
            </FlexBetween>
            <EditOutlined sx={{ color: main }} />
          </FlexBetween>
        </Box>
      </WidgetWrapper>
    );
  };

  export default UserWidget;