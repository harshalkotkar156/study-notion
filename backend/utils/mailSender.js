const nodemailer = require('nodemailer');

const mailSender = async (email,title,body) => {

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
            from:"Study-Notion",
            to:email,
            subject:title,
            html :body
        })

        console.log(info);
        return info;       
    } catch (error) {
         
    }

}

