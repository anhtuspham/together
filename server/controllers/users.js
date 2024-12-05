import User from "../models/User.js";
import Friendship from "../models/Friendship.js";
import Notification from "../models/Notification.js";

//----------------READ--------------
export const getUser = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id);
        res.status(200).json(user);
    } catch (err) {
        res.status(404).json({message: err.message});
    }
}

export const getUserFriends = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findById(id);

        //Promise is basically an object in JS thats completed in a async function 
        // before moving forward in it
        //In this we are grabbing all the friends by their id
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


export const searchUser = async (req, res) => {
    try {
        const {username} = req.query;

        if (!username) {
            return res.json({users: []});
        }

        // Split the query into first name and last name based on whitespace
        const [firstName, lastName] = username.split(" ");

        // Create an array to hold the search conditions
        const searchConditions = [];

        // Add search conditions for first name and last name
        if (firstName && lastName) {
            // If both first name and last name are provided, search for exact match
            searchConditions.push({
                $or: [
                    {firstName: {$regex: firstName, $options: "i"}},
                    {lastName: {$regex: lastName, $options: "i"}},
                ],
            });
        } else {
            // If only one name is provided, search for partial match in both first name and last name
            searchConditions.push({
                $or: [
                    {firstName: {$regex: username, $options: "i"}},
                    {lastName: {$regex: username, $options: "i"}},
                ],
            });
        }

        // Use the User.find method to query the database with the combined search conditions
        const users = await User.find({
            $and: searchConditions,
        })
            .limit(10)
            .select("firstName lastName email picturePath");

        res.json({users});
    } catch (err) {
        return res.status(500).json({msg: err.message});
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

        // Kiểm tra người gửi và người nhận có tồn tại không
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


        // Kiểm tra xem đã có lời mời kết bạn đang chờ xử lý không
        const existingRequest = await Friendship.findOne({
            senderId,
            receiverId,
            status: "pending",
        });
        if (existingRequest) {
            return res.status(400).json({message: "Lời mời kết bạn đã được gửi"});
        }

        // Tạo mới lời mời kết bạn
        const friendship = new Friendship({
            senderId,
            receiverId,
            status: "pending",
        });
        await friendship.save();

        // Tạo thông báo cho người nhận
        const notification = new Notification({
            userId: receiverId, // Người nhận thông báo
            message: `${sender.firstName} ${sender.lastName} đã gửi cho bạn một lời mời kết bạn.`,
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

        // Trả về danh sách người gửi
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
        // Tìm tất cả lời mời kết bạn do user gửi
        const test = await Friendship.find({senderId: userId});
        const friendRequests = await Friendship.find({
            senderId: userId,
            status: "pending"
        }).populate('receiverId', 'firstName lastName picturePath location'); // Populate thông tin người nhận


        // Trả về danh sách người nhận
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

        const updatedUser = await User.findByIdAndUpdate(userId, { location, occupation }, {new: true});

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error update user:', error);
        return res.status(500).json({ message: 'Could not update user information' });
    }
};


