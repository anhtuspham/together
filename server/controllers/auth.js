//Allows to encrypt password
import bcrypt from "bcrypt";
//Allows to send user a web token for using it for authorization
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {sendEmail} from '../utils/email.js'
import transporter from "nodemailer/lib/mailer/index.js";


//-------------------------Register User---------------------------------------

export const register = async (req, res) => {
    try {

        const {
            firstName,
            lastName,
            email,
            password,
            picturePath,
            friends,
            location,
            occupation
        } = req.body;

        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({message: "The email already exists, please try another one."});
        }


        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: passwordHash,
            picturePath,
            friends,
            location,
            occupation,
        });

        const savedUser = await newUser.save();

        // hash password
        const token = jwt.sign({id: newUser._id}, process.env.JWT_VERIFY_MAIL, {expiresIn: "1h"});

        const verificationLink = `${process.env.BACK_END_PORT}/auth/verify-email?token=${token}`;
        await sendEmail(
            email,
            "Xác thực tài khoản",
            `<p>Chào ${firstName} ${lastName},</p>
            <p>Bạn vừa đăng kí tài khoản mới tại Together</p>
            <p>Vui lòng nhấn vào liên kết sau để xác thực tài khoản:</p>
            <a href="${verificationLink}">Xác thực ngay</a>
            <p>Nếu <span>không</span> phải bạn, vui lòng bỏ qua email này</p>`
        );

        res.status(201).json(savedUser);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({error: err.message});

    }
};

//-------------Logging In---------------
export const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email: email});

        if (!user) {
            return res.status(400).json({msg: "User does not exist."});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({msg: "Invalid credentials."});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "7d"});

        delete user.password;

        res.status(200).json({token, user});

    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

export const verifyEmail = async (req, res) => {
    try {
        const {token} = req.query;

        const decoded = jwt.verify(token, process.env.JWT_VERIFY_MAIL);
        await User.findByIdAndUpdate(decoded.id, {isVerified: true});

        // res.status(200).json({message: "Tài khoản đã được xác thực thành công!"});
        res.redirect(`${process.env.FRONT_END_PORT}`)
    } catch (error) {
        res.status(400).json({error: "Token không hợp lệ hoặc đã hết hạn."});
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const {email} = req.body;

        const user = await User.findOne({email});
        if (!user) return res.status(404).json({error: "Email không tồn tại."});

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "1h"});

        const resetLink = `http://localhost:5173/auth/reset-password?token=${token}`;
        await sendEmail(
            email,
            "Đặt lại mật khẩu",
            `<p>Chào bạn,</p>
            <p>Vui lòng nhấn vào liên kết sau để đặt lại mật khẩu:</p>
            <a href="${resetLink}">Đặt lại mật khẩu</a>`
        );

        res.status(200).json({message: "Email đặt lại mật khẩu đã được gửi."});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

export const resetPassword = async (req, res) => {
    try {
        const {token, newPassword} = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await User.findByIdAndUpdate(decoded.id, {password: hashedPassword});

        res.status(200).json({message: "Mật khẩu đã được đặt lại thành công."});
    } catch (error) {
        res.status(400).json({error: "Token không hợp lệ hoặc đã hết hạn."});
    }
};
