import User from "../models/User.js";
import Friendship from "../models/Friendship.js";
import Notification from "../models/Notification.js";
import Comment from "../models/Comment.js";
import Post from "../models/Post.js";

import jwt from "jsonwebtoken";

export const getUser = async (req, res) => {
    const {userId} = req.params;
    const viewerId = req.user.id;  // my id

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        if (userId === viewerId) {
            res.status(200).json(user);
        } else {
            const userInfo = {
                firstName: user.firstName,
                lastName: user.lastName,
                picturePath: user.picturePath,
                friends: user.friends,
                email: user.privacySettings.email ? user.email : 'Private',
                location: user.privacySettings.location ? user.location : 'Private',
                occupation: user.privacySettings.occupation ? user.occupation : 'Private',
            };

            return res.status(200).json(userInfo);
        }


    } catch (error) {
        console.error('Error fetching user info:', error);
        return res.status(500).json({message: 'Could not fetch user information'});
    }
};


export const getUserFriends = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id);

        const friends = await Promise.all(
            user.friends.map((id) => User.findById(id))
        );

        //Format the information
        const formattedFriends = friends.map(
            ({_id, firstName, lastName, occupation, location, picturePath}) => {
                return {_id, firstName, lastName, occupation, location, picturePath};
            }
        );
        res.status(200).json(formattedFriends);

    } catch (err) {
        res.status(404).json({message: err.message});
    }
}

export const getFriendStatus = async (req, res) => {
    try {
        const {userId, friendId} = req.params;

        const friendship = await Friendship.findOne({
            $or: [
                {senderId: userId, receiverId: friendId},
                {senderId: friendId, receiverId: userId},
            ],
        });

        if (!friendship) {
            return res.status(200).json({status: 'none', isSender: null})
        }

        if (friendship.status === 'friend') {
            return res.status(200).json({status: 'friend', isSender: null})
        }

        if (friendship.status === 'pending') {
            return res.json({
                status: "pending",
                isSender: friendship?.senderId?.toString() === userId,
            })
        }

    } catch (e) {
        console.error("Error checking friendship status:", e);
        return res.status(500).json({message: "Internal server error"});
    }
};


//------------------UPDATE--------------------------------
export const removeFriend = async (req, res) => {
    try {
        const {userId, friendId} = req.params;

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({message: "User or friend not found"})
        }

        if (!user.friends.some(id => id.toString() === friendId.toString())) {
            return res.status(404).json({message: "You are not friend with this user"})
        }

        user.friends = user.friends.filter(id => id.toString() !== friendId.toString());
        friend.friends = friend.friends.filter(id => id.toString() !== userId.toString());
        await Friendship.deleteOne({
            $or: [
                {senderId: userId, receiverId: friendId, status: "friend"},
                {senderId: friendId, receiverId: userId, status: "friend"}
            ]
        });

        await user.save();
        await friend.save();

        const updatedFriends = await User.find({_id: {$in: user.friends}}).select("_id firstName lastName occupation location picturePath");

        res.status(200).json({message: "Delete successfully", updatedFriends});


    } catch (err) {
        console.error(err);
        res.status(404).json({message: err.message});
    }
};

// -----------------------SENT FRIEND REQUEST -------------
export const sendFriendRequest = async (req, res) => {
    try {
        const {senderId, receiverId} = req.body;

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
        if (!sender || !receiver) {
            return res.status(404).json({message: "Người gửi hoặc người nhận không tồn tại"});
        }

        const isFriend = sender.friends.some(friend => friend._id === receiverId);
        if (isFriend) {
            return res.json({message: 'You are friend'})
        }

        // Check relation between


        const existingRequest = await Friendship.findOne({
            senderId,
            receiverId,
            status: "pending",
        });
        if (existingRequest) {
            return res.status(400).json({message: "Lời mời kết bạn đã được gửi"});
        }

        const friendship = new Friendship({
            senderId,
            receiverId,
            status: "pending",
        });
        await friendship.save();

        const notification = new Notification({
            userId: receiverId, // Người nhận thông báo
            message: `${sender.firstName} ${sender.lastName} sent a friend request.`,
            type: "follow", // Loại thông báo (có thể chỉnh sửa nếu cần)
            link: `/profile/${senderId}`, // Link dẫn đến trang profile của người gửi
        });

        await notification.save();

        return res.status(201).json({
            message: "Lời mời kết bạn đã được gửi thành công",
            friendship,
            notification,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Đã xảy ra lỗi khi gửi lời mời kết bạn"});
    }
};

export const acceptFriendRequest = async (req, res) => {
    const {friendId} = req.params; // ID của lời mời kết bạn
    const {userId} = req.body; // ID của người nhận lời mời (từ token hoặc frontend gửi lên)

    try {
        const sender = await User.findById(friendId);
        const receiver = await User.findById(userId);

        const friendRequest = await Friendship.findOne({senderId: friendId, receiverId: userId});

        if (!friendRequest) {
            return res.status(404).json({message: "Friend request not found"});
        }

        if (friendRequest.receiverId.toString() !== userId) {
            return res.status(403).json({message: "You are not authorized to accept this request"});
        }

        friendRequest.status = "friend";
        await friendRequest.save();

        await User.findByIdAndUpdate(friendRequest.senderId, {
            $addToSet: {friends: friendRequest.receiverId},
        });

        await User.findByIdAndUpdate(friendRequest.receiverId, {
            $addToSet: {friends: friendRequest.senderId},
        });

        const notification = new Notification({
            userId: friendId, // Người nhận thông báo
            message: `${sender.firstName} ${sender.lastName} accept your friend request.`,
            type: "follow",
            link: `/profile/${friendId}`,
        });

        await notification.save();

        return res.status(200).json({message: "Friend request accepted successfully"});
    } catch (error) {
        console.error("Error accepting friend request:", error);
        return res.status(500).json({message: "Could not accept friend request"});
    }
};

export const rejectFriendRequest = async (req, res) => {
    const {friendId} = req.params; // ID của lời mời kết bạn
    const {userId} = req.body; // ID của người nhận lời mời (từ token hoặc frontend gửi lên)

    try {
        // Tìm lời mời kết bạn trong cơ sở dữ liệu
        const friendRequest = await Friendship.findOne({senderId: friendId, receiverId: userId});


        if (!friendRequest) {
            return res.status(404).json({message: "Friend request not found"});
        }

        // Kiểm tra xem người nhận có phải là người được mời không
        if (friendRequest.receiverId.toString() !== userId) {
            return res.status(403).json({message: "You are not authorized to accept this request"});
        }

        // Cập nhật trạng thái của lời mời thành 'accepted'
        await Friendship.deleteOne({senderId: friendId, receiverId: userId});

        return res.status(200).json({message: "Friend request rejected successfully"});
    } catch (error) {
        console.error("Error accepting friend request:", error);
        return res.status(500).json({message: "Could not reject friend request"});
    }
};


export const getReceivedFriendRequests = async (req, res) => {
    const {userId} = req.params;


    try {
        const friendRequests = await Friendship.find({
            receiverId: userId,
            status: "pending"
        }).populate('senderId', 'firstName lastName picturePath location');

        const result = friendRequests.map(request => ({
            _id: request.senderId._id,
            firstName: request.senderId.firstName,
            lastName: request.senderId.lastName,
            picturePath: request.senderId.picturePath,
            occupation: request.senderId.occupation,
        }));

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching received friend requests:', error);
        return res.status(500).json({message: 'Could not fetch received friend requests'});
    }
};

export const getSentFriendRequests = async (req, res) => {
    const {userId} = req.params;
    try {

        const test = await Friendship.find({senderId: userId});
        const friendRequests = await Friendship.find({
            senderId: userId,
            status: "pending"
        }).populate('receiverId', 'firstName lastName picturePath location'); // Populate thông tin người nhận


        const result = friendRequests.map(request => ({
            _id: request.receiverId._id,
            firstName: request.receiverId.firstName,
            lastName: request.receiverId.lastName,
            picturePath: request.receiverId.picturePath,
            occupation: request.receiverId.occupation,
        }));


        return res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching sent friend requests:', error);
        return res.status(500).json({message: 'Could not fetch sent friend requests'});
    }
};

export const updateInfoUser = async (req, res) => {
    const {userId} = req.params;
    console.log('req', req.params)
    const {location, occupation} = req.body;
    try {

        const updatedUser = await User.findByIdAndUpdate(userId, {location, occupation}, {new: true});

        if (!updatedUser) {
            return res.status(404).json({message: 'User not found'});
        }

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error update user:', error);
        return res.status(500).json({message: 'Could not update user information'});
    }
};

export const updatePrivacySettings = async (req, res) => {
    const {userId} = req.params;
    const {location, occupation, emailPrivacy, locationPrivacy, occupationPrivacy} = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        user.location = location;
        user.occupation = occupation;

        if (emailPrivacy !== undefined) {
            user.privacySettings.email = emailPrivacy;
        }

        if (locationPrivacy !== undefined) {
            user.privacySettings.location = locationPrivacy;
        }

        if (occupationPrivacy !== undefined) {
            user.privacySettings.occupation = occupationPrivacy;
        }

        await user.save();

        return res.status(200).json(user);
    } catch (error) {
        console.error('Error updating settings:', error);
        return res.status(500).json({message: 'Could not update settings'});
    }
};


export const getUserActivity = async (req, res) => {
    // const { userId } = req.params;
    // try {
    //     // Lấy tất cả dữ liệu từ các bảng liên quan
    //     const comments = await Comment.find({ userId }).populate("postId");
    //     console.log('comment: ', comments);
    //     const notifications = await Notification.find({ userId });
    //     console.log('notifi', notifications);
    //     const friendships = await Friendship.find({
    //         $or: [{ senderId: userId }, { receiverId: userId }],
    //     }).populate("senderId receiverId");
    //     console.log('friend:', friendships);
    //     const posts = await Post.find({ userId });
    //
    //     console.log('userId: ', userId)
    //     // Gộp và định dạng dữ liệu
    //     const activities = [
    //         ...comments.map((c) => ({
    //             type: "comment",
    //             data: c,
    //         })),
    //         ...notifications.map((n) => ({
    //             type: "notification",
    //             data: n,
    //         })),
    //         ...friendships.map((f) => ({
    //             type: "friendship",
    //             data: f,
    //         })),
    //         ...posts.map((p) => ({
    //             type: "post",
    //             data: p,
    //         })),
    //     ];
    //
    //     // Sắp xếp theo thứ tự thời gian
    //     activities.sort((a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt));
    //
    //     res.status(200).json(activities);
    // } catch (error) {
    //     res.status(500).json({ message: "Error fetching activities", error });
    // }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        // Decode token để lấy thông tin userId
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        console.log('userId: ', userId)

        // Lấy hoạt động của người dùng
        const comments = await Comment.find({ userId }).populate("postId");
        const notifications = await Notification.find({ userId });
        const friendships = await Friendship.find({
            $or: [{ senderId: userId }, { receiverId: userId }],
        }).populate("senderId receiverId");
        const posts = await Post.find({ userId });

        const activities = [
            ...comments.map((c) => ({ type: "comment", data: c })),
            ...notifications.map((n) => ({ type: "notification", data: n })),
            ...friendships.map((f) => ({ type: "friendship", data: f })),
            ...posts.map((p) => ({ type: "post", data: p })),
        ];

        activities.sort((a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt));

        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: "Error fetching activities", error });
    }
}

