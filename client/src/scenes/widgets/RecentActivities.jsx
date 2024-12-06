import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { useSelector } from "react-redux";

const RecentActivities = () => {
    const [activities, setActivities] = useState([]);
    const token = useSelector((state) => state.token);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await fetch("http://localhost:3001/users/get/all-activities", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                setActivities(data);
            } catch (error) {
                console.error("Error fetching activities:", error);
            }
        };

        fetchActivities();
    }, [token]);

    const renderActivity = (activity) => {
        const { type, data } = activity;
        switch (type) {
            case "comment":
                return (
                    <Card key={data._id} sx={{ marginBottom: "1rem" }}>
                        <CardContent>
                            <Typography variant="body1">
                                Bạn đã bình luận: "{data.content}" trên bài viết{" "}
                                <strong>{data.postId?.description || "Không rõ"}</strong>
                            </Typography>
                            <Typography variant="caption">{new Date(data.createdAt).toLocaleString()}</Typography>
                        </CardContent>
                    </Card>
                );
            case "notification":
                return (
                    <Card key={data._id} sx={{ marginBottom: "1rem" }}>
                        <CardContent>
                            <Typography variant="body1">{data.message}</Typography>
                            <Typography variant="caption">{new Date(data.createdAt).toLocaleString()}</Typography>
                        </CardContent>
                    </Card>
                );
            case "friendship":
                return (
                    <Card key={data._id} sx={{ marginBottom: "1rem" }}>
                        <CardContent>
                            <Typography variant="body1">
                                {data.status === "friend"
                                    ? `Bạn đã trở thành bạn bè với ${
                                        data.senderId.firstName || data.receiverId.firstName
                                    }`
                                    : "Yêu cầu kết bạn đang chờ xử lý"}
                            </Typography>
                            <Typography variant="caption">{new Date(data.updatedAt).toLocaleString()}</Typography>
                        </CardContent>
                    </Card>
                );
            case "post":
                return (
                    <Card key={data._id} sx={{ marginBottom: "1rem" }}>
                        <CardContent>
                            <Typography variant="body1">
                                Bạn đã đăng bài: "{data.description || "Không rõ"}"
                            </Typography>
                            <Typography variant="caption">{new Date(data.createdAt).toLocaleString()}</Typography>
                        </CardContent>
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ marginBottom: "1rem" }}>
                Hoạt động gần đây của bạn
            </Typography>
            {activities.length > 0 ? (
                activities.map((activity) => renderActivity(activity))
            ) : (
                <Typography variant="body1">Không có hoạt động nào.</Typography>
            )}
        </Box>
    );
};

export default RecentActivities;
