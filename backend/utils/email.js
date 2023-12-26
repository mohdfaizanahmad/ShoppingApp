const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  //1) Create Transporter
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //2) Define Mail Options
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3) Actual send email

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
