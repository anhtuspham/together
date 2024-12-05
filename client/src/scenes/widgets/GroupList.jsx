import React, { useState, useEffect } from "react";
import { Box, Button, Typography, Card, CardContent, CardMedia } from "@mui/material";
import logo from '../../assets/ute.jpg';
import GroupRequest from "../../components/GroupRequest.jsx";

const GroupsPage = () => {
    const [groups, setGroups] = useState([]);

    const fetchGroups = async () => {
        try {
            const response = await fetch("http://localhost:3001/group/get-group", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setGroups(data);
            } else {
                console.error("Failed to fetch groups");
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);


    return (
        <Box display="flex" flexDirection="column" gap="1rem">

            <Box display="flex" flexDirection="column" gap="1rem">
                {groups && groups.length > 0 ? (
                    groups.map((group) => (
                        <Card key={group._id} sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            {group.picturePath && (
                                <CardMedia
                                    component="img"
                                    // image={`http://localhost:3001${group.picturePath}`}
                                    image={logo}
                                    alt={group.name}
                                    sx={{ width: 100, height: 100 }}
                                />
                            )}
                            <CardContent>
                                <Typography variant="h6">{group.name}</Typography>
                                <Typography variant="body2">{group.description}</Typography>
                            </CardContent>
                            {group._id ? <GroupRequest groupId={group._id}/> : ''}
                        </Card>
                    ))
                ) : (
                    <Typography>No groups available</Typography>
                )}
            </Box>
        </Box>
    );
};

export default GroupsPage;
