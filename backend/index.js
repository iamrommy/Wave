const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./utils/db");
const userRoute = require("./routes/user.route");
const postRoute = require("./routes/post.route");
const messageRoute = require("./routes/message.route");
const { app, server } = require("./socket/socket");

dotenv.config();

const PORT = process.env.PORT || 4000;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
    origin: process.env.URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOptions));

// API Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

// Default API response
app.get("/", (req, res) => {
    res.json({ success: true, message: "Your backend is running..." });
});

// Start Server
server.listen(PORT, () => {
    connectDB();
    console.log(`Server is listening on port ${PORT}`);
});