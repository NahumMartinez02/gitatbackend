import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
dotenv.config();

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

transporter.verify().then(() => {
    console.log("📫 Envio de correos gmail funcionando");
});