class MailController {
    constructor(mailerService) {
        this.mailerService = mailerService;
    }

    async sendEmail(req, res) {
        const { to, subject, text } = req.body;

        try {
            await this.mailerService.sendMail({ to, subject, text });
            return res.status(200).json({ message: 'Email sent successfully' });
        } catch (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Failed to send email', error: error.message });
        }
    }
}

export default MailController;