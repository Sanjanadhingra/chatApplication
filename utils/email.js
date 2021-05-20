const nodemailer = require("nodemailer");
const { options } = require("../app");
const sendEmail = async function (options) {
  const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,

    auth: {
      user: "be8569dcfe029c",

      pass: "52a479f5af1499",
    },
  });
  const mailOptions = {
    from: "sanjana dhingra dhingras008@gmail.com",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
