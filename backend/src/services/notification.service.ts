import nodemailer from "nodemailer"
import AppLogger from "../utils/logger"

// Create a transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.example.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "user@example.com",
    pass: process.env.EMAIL_PASSWORD || "password",
  },
})

// Send email notification
export const sendNotification = async (to: string, subject: string, message: string): Promise<boolean> => {
  try {
    // Skip sending emails in development mode if configured
    if (process.env.NODE_ENV === "development" && process.env.SKIP_EMAILS === "true") {
      AppLogger.info(`[DEV MODE] Email would be sent to ${to}: ${subject}`)
      return true
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || "requisition-system@example.com",
      to,
      subject,
      text: message,
      html: `<p>${message}</p>`,
    }

    await transporter.sendMail(mailOptions)
    AppLogger.info(`Email sent to ${to}: ${subject}`)
    return true
  } catch (error) {
    AppLogger.error("Error sending email notification:", error)
    return false
  }
}
