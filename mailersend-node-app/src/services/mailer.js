class Mailer {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.mailerSend = require('mailersend')({ apiKey: this.apiKey });
    }

    async sendEmail(to, subject, text) {
        const emailData = {
            from: 'your-email@example.com',
            to: to,
            subject: subject,
            text: text,
        };

        try {
            const response = await this.mailerSend.send(emailData);
            return response;
        } catch (error) {
            throw new Error(`Error sending email: ${error.message}`);
        }
    }
}

module.exports = Mailer;