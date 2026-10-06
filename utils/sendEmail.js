import nodemailer from 'nodemailer';

export const sendEmail = async (opt) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const name = opt.data?.name || opt.name || "User";
    const packageName = opt.data?.package ? ` for the <b>${opt.data.package}</b> package` : "";

    const emailTemplate = `
    <h1>Hi, ${name} 👋</h1>
    <br />
    <h3>${opt.subject || 'Subscription Request'}</h3>
    <p>Your subscription request${packageName} has been processed.</p>
    <p>Thank you for being a part of our community!</p>
  `;

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: opt.to || opt.email,
        subject: opt.subject || 'Subscription Request',
        html: emailTemplate,
    };

    await transporter.sendMail(mailOptions);
};