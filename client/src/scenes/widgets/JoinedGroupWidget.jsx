import React, {useEffect, useState} from "react";
import {Card, CardContent, Typography, Grid, Box} from "@mui/material";
import {useSelector} from "react-redux";

const JoinedGroups = ({userId}) => {
    const token = useSelector((state) => state.token);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await fetch(`http://localhost:3001/group/${userId}/joined`, {
                    method: "GET",
                    headers: {Authorization: `Bearer ${token}`},
                });
                const data = await response.json();
                const joinedGroups = data.filter((group) =>
                    group.members.some(member => member._id.toString() === userId));
                setGroups(joinedGroups);
            } catch (error) {
                console.error("Error fetching joined groups:", error);
            }
        };

        fetchGroups();
    }, [userId]);

    return (
        <>
            <Box >
                <h3>Danh sách nhóm đã tham gia</h3>
                {groups && groups.length > 0 ? groups.map((group) => (
                    <Box sx={{marginBottom: '0.8rem'}} key={group._id}>
                        <Card>
                            <CardContent sx={{ position: "relative" }}>
                                <Typography variant="h6">{group.name}</Typography>
                                <Typography variant="body2">{group.description}</Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        right: 0,
                                        backgroundColor: group.isPublic
                                            ? "green"
                                            : "red",
                                        color: "white",
                                        padding: "2px 8px",
                                        borderRadius: "5px",
                                    }}
                                >
                                    {group.isPublic ? "Public" : "Private"}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                ))  : <Typography>Không có </Typography>}
            </Box>
        </>
    );
};

export default JoinedGroups;
