import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import helmet from 'helmet';
import morgan from 'morgan';
import jwt from "jsonwebtoken";
import path from 'path';
import {fileURLToPath} from 'url';
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import chatRoutes from "./routes/chat.js";
import savedRoutes from './routes/saved.js';
import messageRoutes from "./routes/message.js";
import notificationRoutes from './routes/notification.js';
import groupRoutes from './routes/group.js';
import adminRoutes from './routes/admin.js';
import {register} from "./controllers/auth.js";
import {createPost} from "./controllers/posts.js";
import {verifyToken} from './middleware/auth.js';
import {Server} from "socket.io";


// ------------CONFIGURATIONS -------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//To use dotenv files
dotenv.config();
// Invoke Express App
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(cors());

app.use("/assets", express.static(path.join(__dirname, "public/assets")));


//-----------------------File Storage----------------------------
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/assets');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})

const upload = multer({storage});


//-------------------Routes With Files-------------------------------------
//The "upload.single("picture")" is a middleware function that will upload a picture onto the public/assets folder
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);


//----------------------------Routes----------------------------
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);
app.use('/saved', savedRoutes);
app.use('/notification', notificationRoutes);
app.use('/group', groupRoutes);

// admin
app.use('/admin', adminRoutes)


//----------------------Mongoose Setup---------------------------------
// const HOST = '192.168.1.48';
const HOST = 'localhost';
const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');

}).catch((error) => console.log(`${error} did not connect`));


//Server Startup
const server = app.listen(PORT, HOST, () => console.log(`Server Port : ${PORT}`));

///----------------------SOCKET.IO--------------
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: [`${process.env.FRONT_END_PORT}`, "http://localhost:3000"],
        // credentials: true,
    },
});


io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    const token = socket.handshake.query.token;

    socket.on("setup", (userData) => {
        console.log('can u run')
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));


    socket.on("new message", (newMessageRecieved) => {
        const chat = newMessageRecieved.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id === newMessageRecieved.sender._id) return;

            socket.in(user._id).emit("message recieved", newMessageRecieved);
        });
    });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("User not authenticated");
            socket.disconnect();
            return;
        }
        socket.user = { name: decoded.userName, id: decoded.id };
        socket.on('start-call', (data) => {
            console.log('start call');
            // Broadcast call to other users in the chat
            console.log('chat id in received ', data.chatId)
            socket.to(data.chatId).emit('incoming-call', {
                caller: data.caller,
                callerId: socket.user.id,
                offer: data.offer,
                chatId: data.chatId
            });
        });

        socket.on('reject-call', (data) => {
            // Notify the caller that the call was rejected
            socket.to(data.chatId).emit('call-rejected', {
                chatId: data.chatId
            });
        });

        // Answer call event
        socket.on('answer-call', (data) => {
            socket.to(data.chatId).emit('call-answered', {
                answerer: socket.user.name,
                answer: data.answer,
                chatId: data.chatId
            });
        });

        socket.on('ice-candidate', (data) => {
            console.log('ice-candidate')
            socket.to(data.chatId).emit('ice-candidate', {
                candidate: data.candidate,
                chatId: data.chatId
            });
        });

        // End call event
        socket.on('end-call', (data) => {
            socket.to(data.chatId).emit('call-ended', {
                endedBy: socket.user.name
            });
        });

    })

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
});