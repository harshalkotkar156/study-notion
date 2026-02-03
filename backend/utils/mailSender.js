const nodemailer = require('nodemailer');
const { Resend } = require("resend");

const mailSender= async (email, title, body) => {


    try {

        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,
            secure: false,
            requireTLS: true,
            logger: true,
            debug: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            },

        });

        let info = await transporter.sendMail({
            from: "Study-Notion",
            to: email,
            subject: title,
            html: body
        })


        return info;
    } catch (error) {
        console.log("error in sending mail", error);
    }

}




const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);

const mailSenderAPI = async (email, title, body) => {
    try {
        
        const { data, error } = await resend.emails.send({
            from:process.env.MAIL_SENDER,
            to: 'harshalkotkar1713@gmail.com',
            subject: title,
            html: `<strong>OTP : ${body}</strong>`,
        });

        if (error) {
            return console.error({ error });
        }

        console.log({ data });
    } catch (error) {
        console.log("Error is : ",error);
    }
}

module.exports = mailSender;

