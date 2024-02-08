import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: config.NODE_ENV === 'production',
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: 'jakrony582@gmail.com',
      pass: 'quaq ojmj hgwz asbt',
    },
  });

  await transporter.sendMail({
    from: 'jakrony582@gmail.com', // sender address
    to, // list of receivers
    subject: 'Reset Your Password with in 10 Minits', // Subject line
    text: 'Someone Reset Your password ', // plain text body
    html, // html body
  });
};
