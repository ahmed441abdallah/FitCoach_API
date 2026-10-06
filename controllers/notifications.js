import Notification from "../models/Notification.js";
import asyncHandler from "../utils/asyncHandler.js";
// @desc get all notifications
// @route GET /api/v1/notifications/me
// @access Private
export const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
});
// @desc mark as read
// @route PUT /api/v1/notifications/:id/read
// @access Private
export const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
        return res.status(404).json({ success: false, message: "Notification not found" });
    }
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ success: true, data: notification });
});
// @desc mark all as read
// @route PUT /api/v1/notifications/read-all
// @access Private
export const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany({ user: req.user._id }, { isRead: true });
    res.status(200).json({ success: true, data: {} });
});
