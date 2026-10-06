import asyncHandler from "../utils/asyncHandler.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

// @desc get the coach (admin) user — for clients to find who to chat with
// @route GET /api/v1/chat/coach
// @access private
export const getCoach = asyncHandler(async (req, res) => {
    const coach = await User.findOne({ role: "admin" }).select("_id userName email role");
    if (!coach) return res.status(404).json({ success: false, message: "Coach not found" });
    res.status(200).json({ success: true, coach });
});

// @desc send message
// @route POST /api/v1/chat/send/:receiverId
// @access private
export const sendMessage = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const { receiverId } = req.params;
    const senderId = req.user._id;

    if (!text) {
        return res.status(400).json({ message: "Message cannot be empty" });
    }
    // check if conversation exists
    let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] }
    });

    // if no conversation create one
    if (!conversation) {
        conversation = await Conversation.create({
            participants: [senderId, receiverId]
        });
    }

    const newMessage = await Message.create({
        conversationId: conversation._id,
        sender: senderId,
        text: text
    });

    conversation.lastMessage = text;
    await conversation.save();

    res.status(201).json({
        success: true,
        message: newMessage
    });
});

// @desc get conversations for current user
// @route GET /api/v1/chat/conversations
// @access private
export const getConversations = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const conversations = await Conversation.find({
        participants: userId
    })
        .populate("participants", "userName email role")
        .sort({ updatedAt: -1 });

    res.status(200).json({
        success: true,
        conversations
    });
});

// @desc get messages in a conversation
// @route GET /api/v1/chat/messages/:conversationId
// @access private
export const getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
        .populate("sender", "userName email role")
        .sort({ createdAt: 1 });

    res.status(200).json({
        success: true,
        messages
    });
});

// @desc get or create conversation with a specific user
// @route GET /api/v1/chat/with/:userId
// @access private
export const getOrCreateConversation = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    let conversation = await Conversation.findOne({
        participants: { $all: [currentUserId, userId] }
    }).populate("participants", "userName email role");

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [currentUserId, userId]
        });
        conversation = await Conversation.findById(conversation._id)
            .populate("participants", "userName email role");
    }

    res.status(200).json({ success: true, conversation });
});