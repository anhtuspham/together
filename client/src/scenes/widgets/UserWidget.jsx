import {
    ManageAccountsOutlined,
    EditOutlined,
    LocationOnOutlined,
    WorkOutlineOutlined, MailLockOutlined, Mail, MailOutlined, AddCircleOutlineOutlined,
} from "@mui/icons-material";
import {
    Box,
    Typography,
    Divider,
    useTheme,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    DialogActions, Dialog, DialogTitle, DialogContent
} from "@mui/material";
import UserImage from "../../components/UserImage";
import FlexBetween from "../../components/FlexBetween";
import WidgetWrapper from "../../components/WidgetWrapper";
import {useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import logo from '../../assets/ute.jpg';
import GroupList from "./GroupList.jsx";

const UserWidget = ({userId, picturePath}) => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        emailPrivacy: false,
        locationPrivacy: false,
        occupationPrivacy: false,
    });
    const [openAddGroup, setOpenAddGroup] = useState(false);
    const [groupData, setGroupData] = useState({
        name: "",
        description: "",
        isPublic: true,
    });

    const {_id} = useSelector((state) => state.auth.user);
    const isSelf = userId === _id;

    const {palette} = useTheme();
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);
    const currentUserId = useSelector((state) => state.auth.user._id);
    const currFriends = useSelector((state) => state.auth.user.friends);
    const dark = palette.neutral.dark;
    const medium = palette.neutral.medium;
    const main = palette.neutral.main;

    const getUser = async () => {
        const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/users/${userId}`, {
            method: "GET",
            headers: {Authorization: `Bearer ${token}`},
        });
        const data = await response.json();
        setUser(data);

        setFormData({
            email: data.email || "",
            location: data.location || "",
            occupation: data.occupation || "",
            emailPrivacy: data.privacySettings.email || false,
            locationPrivacy: data.privacySettings.location || false,
            occupationPrivacy: data.privacySettings.occupation || false,
        });
    };

    const updateUser = async () => {
        const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/users/${currentUserId}/editInfo`, {
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

    const handleAddGroup = async () => {
        const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/group/${userId}/add-group`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(groupData),
        });
        if (response.ok) {
            // Handle successful group creation
            setOpenAddGroup(false);
            setGroupData({ name: "", description: "", isPublic: true });
            alert("Group added successfully!");
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
                    <UserImage image={picturePath}/>
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
                        <Typography color={medium}>{friends ? friends.length : 0} friends</Typography>
                    </Box>
                </FlexBetween>
                {userId === currentUserId && (
                    <Button
                        startIcon={<ManageAccountsOutlined/>}
                        onClick={() => setIsEditing(!isEditing)}
                        variant="contained"
                        color="primary"
                    >
                        {isEditing ? "Cancel" : "Edit"}
                    </Button>
                )}
            </FlexBetween>

            <Divider/>

            {/* SECOND ROW */}
            {isEditing ? (
                <Box p="1rem 0">
                    <Box display="flex" alignItems="center" gap="1rem" mb="1rem">
                        <LocationOnOutlined fontSize="large" sx={{color: main}}/>
                        <TextField
                            label="Location"
                            variant="outlined"
                            placeholder="Langa"
                            fullWidth
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                        />
                        <FormControlLabel
                            control={<Switch checked={formData.locationPrivacy} onChange={() => setFormData({...formData, locationPrivacy: !formData.locationPrivacy})} />}
                            label="Công khai location"
                        />
                    </Box>
                    <Box display="flex" alignItems="center" gap="1rem" mb="1rem">
                        <WorkOutlineOutlined fontSize="large" sx={{color: main}}/>
                        <TextField
                            label="Occupation"
                            variant="outlined"
                            placeholder="Engineer"
                            fullWidth
                            value={formData.occupation}
                            onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                        />
                        <FormControlLabel
                            control={<Switch checked={formData.occupationPrivacy} onChange={() => setFormData({...formData, occupationPrivacy: !formData.occupationPrivacy})} />}
                            label="Công khai occupation"
                        />
                    </Box>
                    <Box display="flex" alignItems="center" gap="1rem" mb="1rem">
                        <MailOutlined fontSize="large" sx={{color: main}}/>
                        <TextField
                            label="Email"
                            variant="outlined"
                            placeholder="@gmail.com"
                            fullWidth
                            value={formData.email}
                            // onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={true}
                        />
                        <FormControlLabel
                            control={<Switch checked={formData.emailPrivacy} onChange={() => setFormData({...formData, emailPrivacy: !formData.emailPrivacy})} />}
                            label="Công khai email"
                        />
                    </Box>
                    <Button
                        variant="contained"
                        color="secondary"
                        fullWidth
                        onClick={updateUser}
                    >
                        Lưu
                    </Button>
                </Box>
            ) : (
                <Box p="1rem 0">
                    <Box display="flex" alignItems="center" gap="1rem" mb="0.5rem">
                        <LocationOnOutlined fontSize="large" sx={{color: main}}/>
                        <Typography color={medium}>{location}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap="1rem" mb="0.5rem">
                        <WorkOutlineOutlined fontSize="large" sx={{color: main}}/>
                        <Typography color={medium}>{occupation}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap="1rem" mb="0.5rem">
                        <MailOutlined fontSize="large" sx={{color: main}}/>
                        <Typography color={medium}>{email}</Typography>
                    </Box>
                </Box>
            )}

            <Divider/>

            <Divider/>

            {isSelf ? <Box p="1rem 0">
                <Typography fontSize="1rem" color={main} fontWeight="500" mb="1rem">
                    Nhóm của tôi
                </Typography>

                <FlexBetween mb="1rem">
                    <Typography color={main}>Danh sách nhóm</Typography>
                    <Button
                        variant="outlined"
                        startIcon={<AddCircleOutlineOutlined />}
                        onClick={() => setOpenAddGroup(true)}
                    >
                        Thêm nhóm
                    </Button>
                </FlexBetween>

            </Box> : (<></>)}

            {/* ADD GROUP DIALOG */}
            <Dialog open={openAddGroup} onClose={() => setOpenAddGroup(false)}>
                <DialogTitle>Add New Group</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Group Name"
                        variant="outlined"
                        margin="dense"
                        value={groupData.name}
                        onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        variant="outlined"
                        margin="dense"
                        value={groupData.description}
                        onChange={(e) =>
                            setGroupData({ ...groupData, description: e.target.value })
                        }
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                checked={groupData.isPublic}
                                onChange={(e) =>
                                    setGroupData({ ...groupData, isPublic: e.target.checked })
                                }
                            />
                        }
                        label="Public Group"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddGroup(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddGroup}
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </WidgetWrapper>
    );
};

export default UserWidget;