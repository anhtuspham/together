import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { useSelector } from "react-redux";

const PendingGroups = ({ userId }) => {
    const token = useSelector((state) => state.token);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_PORT_BACKEND}/group/${userId}/requests`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                const pendingGroups = data.filter(
                    (group) =>
                        group.requests.some(
                            (request) => request._id.toString() === userId
                        )
                );
                setGroups(pendingGroups);
            } catch (error) {
                console.error("Error fetching pending groups:", error);
            }
        };

        fetchGroups();
    }, [userId]);

    return (
        <Box>
            <h3>Đang chờ phê duyệt</h3>
            {groups && groups.length > 0 ? groups.map((group) => (
                <Box key={group._id} sx={{marginBottom: '0.8rem'}}>
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
            )) : <Typography>Không có </Typography>}
        </Box>
    );
};

export default PendingGroups;
