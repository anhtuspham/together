import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Paper } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useSelector } from "react-redux";

const AdminPage = () => {
    const token = useSelector((state) => state.token);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        fetchUsers();
        fetchPosts();
        fetchGroups();
    }, []);

    // Fetch all users
    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:3001/admin/all-user", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Fetch all posts
    const fetchPosts = async () => {
        try {
            const response = await fetch("http://localhost:3001/admin/all-post", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };

    const fetchGroups = async () => {
        try {
            const response = await fetch("http://localhost:3001/admin/all-group", {
                headers: { Authorization: `Bearer ${token}` },
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
            const response = await fetch(`http://localhost:3001/admin/delete/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
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
            const response = await fetch(`http://localhost:3001/admin/delete/${postId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
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
            const response = await fetch(`http://localhost:3001/admin/delete/${groupId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                setGroups(groups.filter(group => group._id !== groupId));
            }
        } catch (error) {
            console.error("Error deleting group:", error);
        }
    };

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Admin Panel
            </Typography>

            {/* User Management Table */}
            <Box mb={4}>
                <Typography variant="h6">User Management</Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>First Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Email verified</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users && users.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell>{user.firstName}</TableCell>
                                    <TableCell>{user.lastName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.isVerified ? '✔️': '❌'}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>
                                        <IconButton edge="end" onClick={() => deleteUser(user._id)}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Post Management Table */}
            <Box>
                <Typography variant="h6" gutterBottom>
                    Post Management
                </Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>First Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Likes</TableCell>
                                <TableCell>Comments</TableCell>
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
                                    <TableCell>{post.isReported ? '🔴️' : '🟢'}</TableCell>
                                    <TableCell>
                                        <IconButton edge="end" onClick={() => deletePost(post._id)}>
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Group Management Table */}
            <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                    Group Management
                </Typography>
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
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};

export default AdminPage;
