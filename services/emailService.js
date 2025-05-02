// src/services/emailService.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const data = await resend.emails.send({
            from:  'UDSM Connect <onboarding@resend.dev>',
            to: Array.isArray(to) ? to : [to],
            subject,
            text,
            html, // Optional: for HTML emails
        });
        console.log(`Email sent to ${to}:`, data);
        return data;
    } catch (error) {
        console.error(`Email error: ${error.message}`);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

module.exports = { sendEmail };