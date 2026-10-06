import Notification from "../models/Notification.js";


export const notifyUser = async ({ userId, title, message, type = 'general', link = '' }) => {
    try {
        if (!userId || !title || !message) {
            console.error("Missing required fields for notification");
            return null;
        }

        const notification = await Notification.create({
            user: userId,
            title,
            message,
            type,
            link
        });


        return notification;
    } catch (error) {
        console.error("Error creating notification:", error.message);
        return null;
    }
};