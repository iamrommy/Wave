const { Conversation } = require("../models/conversation.model");
const { getReceiverSocketId, io } = require("../socket/socket");
const { Message } = require("../models/message.model");

// Send Message
const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const { textMessage: message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, error: "Message is required" });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        // Establish the conversation if not started yet.
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
                messages: []
            });
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        });

        // Ensure conversation.messages is an array
        if (!Array.isArray(conversation.messages)) {
            conversation.messages = [];
        }

        conversation.messages.push(newMessage._id);

        await Promise.all([conversation.save(), newMessage.save()]);

        // Implement socket.io for real-time data transfer
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.status(201).json({
            success: true,
            newMessage
        });
    } catch (error) {
        console.error("Error in sendMessage:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

// Get Messages
const getMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate("messages");

        if (!conversation) {
            return res.status(200).json({ success: true, messages: [] });
        }

        return res.status(200).json({ success: true, messages: conversation.messages });
    } catch (error) {
        console.error("Error in getMessage:", error);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

module.exports = { sendMessage, getMessage };
