const nodemailer = require('nodemailer');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      logger.warn('⚠️ Email configuration missing, email service disabled');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    logger.info('✅ Email service initialized');
  }

  /**
   * Send email
   */
  async sendEmail({ to, subject, text, html, attachments = [] }) {
    if (!this.transporter) {
      logger.warn('Email not configured, skipping email');
      return { success: false, error: 'Email not configured' };
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
        html,
        attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Email sent to ${to}: ${subject}`);
      return { success: true, messageId: info.messageId };

    } catch (error) {
      logger.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email to new hire
   */
  async sendWelcomeEmail({ firstName, lastName, email, startDate, role, department }) {
    const subject = `Welcome to the Team, ${firstName}! 🎉`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to the Team!</h1>
    </div>
    <div class="content">
      <p>Hi ${firstName},</p>
      
      <p>We're thrilled to have you join us as a <strong>${role}</strong> in the <strong>${department}</strong> team!</p>
      
      <div class="info-box">
        <h3>📅 Your First Day</h3>
        <p><strong>${new Date(startDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
      </div>
      
      <h3>What to Expect:</h3>
      <ul>
        <li>✅ Your equipment will be ready at your desk</li>
        <li>✅ You'll receive login credentials before your first day</li>
        <li>✅ Your manager will reach out to schedule a welcome meeting</li>
        <li>✅ You'll be paired with a buddy to help you settle in</li>
      </ul>
      
      <h3>Before You Start:</h3>
      <ol>
        <li>Check your email for account setup instructions</li>
        <li>Join our Slack workspace (invitation coming soon)</li>
        <li>Review the employee handbook</li>
        <li>Prepare any questions you might have</li>
      </ol>
      
      <p style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard" class="button">
          View Your Onboarding Dashboard
        </a>
      </p>
      
      <p>If you have any questions before your start date, feel free to reach out to hr@company.com or use our AI assistant on your dashboard.</p>
      
      <p>We can't wait to see you on your first day!</p>
      
      <p>Best regards,<br>
      <strong>The HR Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message from the Smart HR Onboarding Assistant</p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Welcome to the Team, ${firstName}!

We're thrilled to have you join us as a ${role} in the ${department} team!

Your First Day: ${new Date(startDate).toLocaleDateString()}

What to Expect:
- Your equipment will be ready at your desk
- You'll receive login credentials before your first day
- Your manager will reach out to schedule a welcome meeting
- You'll be paired with a buddy to help you settle in

Before You Start:
1. Check your email for account setup instructions
2. Join our Slack workspace (invitation coming soon)
3. Review the employee handbook
4. Prepare any questions you might have

If you have any questions, reach out to hr@company.com

Best regards,
The HR Team
    `.trim();

    return await this.sendEmail({ to: email, subject, html, text });
  }

  /**
   * Send task reminder email
   */
  async sendTaskReminder({ email, firstName, taskName, dueDate }) {
    const subject = `Reminder: ${taskName} due soon`;
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert">
      <h2>⏰ Task Reminder</h2>
      <p>Hi ${firstName},</p>
      <p>This is a friendly reminder that you have a task due soon:</p>
      <p><strong>${taskName}</strong></p>
      <p>Due: ${new Date(dueDate).toLocaleDateString()}</p>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard">View your dashboard</a></p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Task Reminder

Hi ${firstName},

This is a friendly reminder that you have a task due soon:
${taskName}

Due: ${new Date(dueDate).toLocaleDateString()}

View your dashboard: ${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard
    `.trim();

    return await this.sendEmail({ to: email, subject, html, text });
  }

  /**
   * Send notification to manager
   */
  async sendManagerNotification({ managerEmail, newHireName, startDate }) {
    const subject = `New Team Member Starting: ${newHireName}`;
    
    const html = `
<!DOCTYPE html>
<html>
<body>
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2>👋 New Team Member Joining</h2>
    <p>A new team member is starting soon!</p>
    <p><strong>Name:</strong> ${newHireName}</p>
    <p><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</p>
    <p>Please ensure you:</p>
    <ul>
      <li>Schedule a welcome meeting</li>
      <li>Prepare their workspace</li>
      <li>Plan their first week activities</li>
    </ul>
  </div>
</body>
</html>
    `;

    const text = `New Team Member Joining\n\nName: ${newHireName}\nStart Date: ${new Date(startDate).toLocaleDateString()}`;

    return await this.sendEmail({ to: managerEmail, subject, html, text });
  }
}

module.exports = new EmailService();
