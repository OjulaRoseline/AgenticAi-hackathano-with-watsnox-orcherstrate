const { WebClient } = require('@slack/web-api');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

class SlackService {
  constructor() {
    this.client = null;
    if (process.env.SLACK_BOT_TOKEN) {
      this.client = new WebClient(process.env.SLACK_BOT_TOKEN);
      logger.info('✅ Slack service initialized');
    } else {
      logger.warn('⚠️ Slack bot token not configured');
    }
  }

  /**
   * Send a direct message to a user
   */
  async sendDirectMessage(email, message) {
    if (!this.client) {
      logger.warn('Slack not configured, skipping message');
      return { success: false, error: 'Slack not configured' };
    }

    try {
      // Find user by email
      const user = await this.client.users.lookupByEmail({ email });
      
      if (!user.ok) {
        throw new Error('User not found');
      }

      // Send DM
      const result = await this.client.chat.postMessage({
        channel: user.user.id,
        text: message,
        blocks: this.formatMessage(message)
      });

      logger.info(`Slack DM sent to ${email}`);
      return { success: true, messageId: result.ts };

    } catch (error) {
      logger.error('Error sending Slack DM:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send message to a channel
   */
  async sendChannelMessage(channel, message) {
    if (!this.client) {
      logger.warn('Slack not configured, skipping message');
      return { success: false, error: 'Slack not configured' };
    }

    try {
      const result = await this.client.chat.postMessage({
        channel,
        text: message,
        blocks: this.formatMessage(message)
      });

      logger.info(`Message sent to channel ${channel}`);
      return { success: true, messageId: result.ts };

    } catch (error) {
      logger.error('Error sending channel message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Invite user to workspace
   */
  async inviteUser(email, channels = ['general', 'new-hires']) {
    if (!this.client) {
      logger.warn('Slack not configured, skipping invite');
      return { success: false, error: 'Slack not configured' };
    }

    try {
      // Note: This requires admin permissions
      const result = await this.client.admin.users.invite({
        email,
        channel_ids: channels.join(','),
        team_id: process.env.SLACK_TEAM_ID
      });

      logger.info(`Slack invite sent to ${email}`);
      return { success: true, data: result };

    } catch (error) {
      logger.error('Error inviting user to Slack:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome message to new hire
   */
  async sendWelcomeMessage(email, firstName, startDate) {
    const message = `
🎉 Welcome to the team, ${firstName}!

I'm your onboarding assistant, here to help you get started.

**Your first day is: ${new Date(startDate).toLocaleDateString()}**

Feel free to ask me questions like:
• "What's on my schedule?"
• "Where can I find the employee handbook?"
• "Who is my assigned buddy?"

Let me know if you need anything! 👋
    `.trim();

    return await this.sendDirectMessage(email, message);
  }

  /**
   * Notify IT team about equipment request
   */
  async notifyITTeam(employeeName, equipment, ticketId) {
    const message = `
🖥️ **New Equipment Request**

**Employee:** ${employeeName}
**Items:** ${equipment.join(', ')}
**Ticket ID:** ${ticketId}

Please process this request before the employee's start date.
    `.trim();

    return await this.sendChannelMessage('#it-requests', message);
  }

  /**
   * Format message with blocks for better UI
   */
  formatMessage(text) {
    return [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text
        }
      }
    ];
  }

  /**
   * Send interactive message with buttons
   */
  async sendInteractiveMessage(channel, text, actions) {
    if (!this.client) {
      return { success: false, error: 'Slack not configured' };
    }

    try {
      const blocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text
          }
        },
        {
          type: 'actions',
          elements: actions.map(action => ({
            type: 'button',
            text: {
              type: 'plain_text',
              text: action.text
            },
            action_id: action.actionId,
            value: action.value
          }))
        }
      ];

      const result = await this.client.chat.postMessage({
        channel,
        text,
        blocks
      });

      return { success: true, messageId: result.ts };

    } catch (error) {
      logger.error('Error sending interactive message:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SlackService();
