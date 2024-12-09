import React, {useEffect, useState} from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Paper,
    Tabs,
    Tab,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button
} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";
import {useSelector} from "react-redux";

const AdminPage = () => {
    const token = useSelector((state) => state.token);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedTab, setSelectedTab] = useState(0);
    const [editingUserId, setEditingUserId] = useState(null);
    const [newRole, setNewRole] = useState("");

    useEffect(() => {
        fetchUsers();
        fetchPosts();
        fetchGroups();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/admin/all-user`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/admin/all-post`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };

    const fetchGroups = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/admin/all-group`, {
                headers: {Authorization: `Bearer ${token}`},
            });
            const data = await response.json();
            setGroups(data);
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    };

    // Delete a user
    const deleteUser = async (userId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/admin/delete/${userId}`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`},
            });
            if (response.ok) {
                setUsers(users.filter(user => user._id !== userId));
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    // Delete a post
    const deletePost = async (postId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/admin/delete/${postId}`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`},
            });
            if (response.ok) {
                setPosts(posts.filter(post => post._id !== postId));
            }
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    const deleteGroup = async (groupId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/admin/delete/${groupId}`, {
                method: "DELETE",
                headers: {Authorization: `Bearer ${token}`},
            });
            if (response.ok) {
                setGroups(groups.filter(group => group._id !== groupId));
            }
        } catch (error) {
            console.error("Error deleting group:", error);
        }
    };

    // Handle role change
    const handleRoleChange = async (userId, newRole) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/admin/update-role/${userId}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({role: newRole}),
            });

            if (response.ok) {
                // Cập nhật danh sách người dùng trong state
                setUsers(users.map(user =>
                    user._id === userId ? {...user, role: newRole} : user
                ));
                setEditingUserId(null); // Thoát khỏi chế độ chỉnh sửa
            }
        } catch (error) {
            console.error("Error updating user role:", error);
        }
    };

    const handleEditClick = (userId, currentRole) => {
        setEditingUserId(userId);
        setNewRole(currentRole);
    };

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    return (
        <Box p={3} display="flex">
            {/* Sidebar Tabs */}
            <Box flex={1} width={200}>
                <Tabs orientation="vertical" value={selectedTab} onChange={handleTabChange}
                      aria-label="Admin Management Tabs" sx={{
                    '.MuiTab-root': {
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        fontSize: '1.2rem',
                        paddingLeft: '16px',
                        textTransform: 'none'
                    },
                }}>
                    <Tab label="User Management"/>
                    <Tab label="Post Management"/>
                    <Tab label="Group Management"/>
                </Tabs>
            </Box>

            {/* Content */}
            <Box flex={5} ml={3}>
                {/* User Management Tab */}
                {selectedTab === 0 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>User Management</Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead sx={{marginBottom: '5px'}}>
                                    <TableRow>
                                        <TableCell>First Name</TableCell>
                                        <TableCell>Last Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Email Verified</TableCell>
                                        <TableCell>Role</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user._id}>
                                            <TableCell>{user.firstName}</TableCell>
                                            <TableCell>{user.lastName}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.isVerified ? "✔️" : "❌"}</TableCell>
                                            <TableCell>
                                                {/* Displaying role */}
                                                {editingUserId === user._id ? (
                                                    <FormControl size="small" variant="outlined"
                                                                 sx={{
                                                                     minWidth: 100,
                                                                     margin: '0 8px',
                                                                 }}
                                                    >
                                                        <Select
                                                            value={newRole}
                                                            onChange={(e) => setNewRole(e.target.value)}
                                                        >
                                                            <MenuItem value="user">User</MenuItem>
                                                            <MenuItem value="admin">Admin</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                ) : (
                                                    user.role
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {editingUserId === user._id ? (
                                                    <Button
                                                        onClick={() => handleRoleChange(user._id, newRole)}
                                                        color="primary"
                                                    >
                                                        Save
                                                    </Button>
                                                ) : (
                                                    <IconButton
                                                        onClick={() => handleEditClick(user._id, user.role)}
                                                        color="primary"
                                                    >
                                                        <Edit/>
                                                    </IconButton>
                                                )}
                                                <IconButton edge="end" onClick={() => deleteUser(user._id)}>
                                                    <Delete/>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {/* Post Management Tab */}
                {selectedTab === 1 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>Post Management</Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>First Name</TableCell>
                                        <TableCell>Last Name</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Likes</TableCell>
                                        <TableCell>Comments</TableCell>
                                        <TableCell>Counted Numbers Reported</TableCell>
                                        <TableCell>Alert</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {posts.map((post) => (
                                        <TableRow key={post._id}>
                                            <TableCell>{post.firstName}</TableCell>
                                            <TableCell>{post.lastName}</TableCell>
                                            <TableCell>{post.description}</TableCell>
                                            <TableCell>{Object.keys(post.likes || {}).length}</TableCell>
                                            <TableCell>{post.comments.length}</TableCell>
                                            <TableCell>{post.reportCount}</TableCell>
                                            <TableCell>{post.isReported ? "🔴️" : "🟢"}</TableCell>
                                            <TableCell>
                                                <IconButton edge="end" onClick={() => deletePost(post._id)}>
                                                    <Delete/>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {/* Group Management Tab */}
                {selectedTab === 2 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>Group Management</Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Members</TableCell>
                                        <TableCell>Admin</TableCell>
                                        <TableCell>Posts</TableCell>
                                        <TableCell>Public</TableCell>
                                        <TableCell>Created At</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {groups.map((group) => (
                                        <TableRow key={group._id}>
                                            <TableCell>{group.name}</TableCell>
                                            <TableCell>{group.description}</TableCell>
                                            <TableCell>{group.members.length}</TableCell>
                                            <TableCell>{group.admin ? `${group.admin.firstName} ${group.admin.lastName}` : "N/A"}</TableCell>
                                            <TableCell>{group.post ? group.post.length : 0}</TableCell>
                                            <TableCell>{group.isPublic ? "✔️" : "❌"}</TableCell>
                                            <TableCell>{new Date(group.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <IconButton edge="end" onClick={() => deleteGroup(group._id)}>
                                                    <Delete/>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default AdminPage;
