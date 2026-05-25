import 'server-only'

import nodemailer from 'nodemailer'
import type Mail from 'nodemailer/lib/mailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'
import { isEnvOn } from 'omn'

export type SendMailOptions = Omit<Mail.Options, 'from'> & {
  from?: Mail.Address | string
}

function readMailerConfig(): SMTPTransport.Options {
  return {
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT),
    secure: isEnvOn(process.env.SMTP_SECURE),
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASSWD!,
    },
  }
}

function getDefaultFrom(): Mail.Address | string {
  const name = process.env.MAIL_NOREPLY_NAME
  const address = process.env.MAIL_NOREPLY_EMAIL!

  return name ? { name, address } : address
}

export const mailer = process.env.CI
  ? (null as unknown as nodemailer.Transporter<SMTPTransport.SentMessageInfo>)
  : nodemailer.createTransport(readMailerConfig())

export async function sendMail(options: SendMailOptions): Promise<SMTPTransport.SentMessageInfo> {
  return mailer.sendMail({ from: options.from ?? getDefaultFrom(), ...options })
}
