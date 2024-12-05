import Notification from "../models/Notification.js";


//------------------READ------------------
export const getNotification = async (req, res) => {
    const {userId} = req.params;
    try {
        const notification = await Notification.find({userId: userId});
        res.status(200).json(notification);

    } catch (err) {
        res.status(404).json({message: err.message});
    }
}

export const markAsReadNotification = async (req, res) => {
    const {notifId} = req.params;
    try {
        const notification = await Notification.findById(notifId);

        notification.isRead = true;

        await notification.save();
        res.status(200).json(notification);

    } catch (err) {
        res.status(404).json({message: err.message});
    }
}

