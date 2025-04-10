import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfirmEmailDto } from '../user/dto/cofirm-email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendMail(mailOptions): Promise<{ message: string; info: any }> {
    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log('Email sent: ' + info.response);
      return { message: 'Email sent successfully', info };
    } catch (error) {
      this.logger.error('Email sending failed', error);
      throw new Error('Email sending failed');
    }
  }

  async sendPasswordChangeCode(data: ConfirmEmailDto) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: data.email,
      subject: 'Checkpoint.kg password chaning',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; color: #555; text-align: center;">
            <h2 style="color: #333;">Confirm Your Email Address</h2>
            <div style="margin: 20px 0;">
              <h1 style="font-size: 48px; color: #007BFF; margin: 20px 0;">
                ${data.code}
              </h1>
            </div>
            <p style="font-size: 16px; color: #555;">
              Это ваш код подтверждения для смены пароля<br />
              Не передавайте его никому!<br />
              Срок его действия 15 минут
            </p>
            <p style="font-size: 16px; color: #555;">
              This is your code for password changing<br />
              Do not give it to anyone!<br />
              This code will expire in 15 minutes
            </p>
          </body>
        </html>
      `,
    };

    return this.sendMail(mailOptions);
  }

  async sendEmail(data: ConfirmEmailDto) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: data.email,
      subject: 'Checkpoint.kg User',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; color: #555; text-align: center;">
            <h2 style="color: #333;">Confirm Your Email Address</h2>
            <div style="margin: 20px 0;">
              <h1 style="font-size: 48px; color: #007BFF; margin: 20px 0;">
                ${data.code}
              </h1>
            </div>
            <p style="font-size: 16px; color: #555;">
              Это ваш код подтверждения email<br />
              Не передавайте его никому!<br />
              Срок его действия 15 минут
            </p>
            <p style="font-size: 16px; color: #555;">
              This is your code for email confirmation<br />
              Do not give it to anyone!<br />
              This code will expire in 15 minutes
            </p>
          </body>
        </html>
      `,
    };

    return this.sendMail(mailOptions);
  }

  async sendEmailToAdmin(data: ConfirmEmailDto) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: data.email,
      subject: 'Checkpoint.kg Admin',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; color: #555; text-align: center;">
            <h2 style="color: #333;">Confirm Your Email Address</h2>
            <div style="margin: 20px 0;">
              <h1 style="font-size: 48px; color: #007BFF; margin: 20px 0;">
                ${data.code}
              </h1>
            </div>
            <p style="font-size: 16px; color: #555;">
              Это ваш код подтверждения Админа<br />
              Не передавайте его никому!<br />
              Срок его действия 15 минут
            </p>
            <p style="font-size: 16px; color: #555;">
              This is your code for Admin confirmation<br />
              Do not give it to anyone!<br />
              This code will expire in 15 minutes
            </p>
          </body>
        </html>
      `,
    };

    return this.sendMail(mailOptions);
  }
}
