import nodemailer from 'nodemailer'


import dotenv from 'dotenv';

dotenv.config();

// Cấu hình SMTP
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true nếu dùng port 465
    auth: {
        user: process.env.MAIL_ADDRESS, // Email của bạn
        pass: process.env.APP_PASSWORD, // Mật khẩu ứng dụng
    },
});

// Hàm gửi email
export async function sendEmail(to, subject, htmlContent) {
    try {
        await transporter.sendMail({
            from: `"Together" <${process.env.MAIL_ADDRESS}>`, // Người gửi
            to, // Người nhận
            subject, // Tiêu đề
            html: htmlContent, // Nội dung HTML
        });
    } catch (error) {
        console.error("Lỗi khi gửi email:", error);
    }
}

