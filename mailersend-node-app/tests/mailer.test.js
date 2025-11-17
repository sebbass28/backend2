const Mailer = require('../src/services/mailer');
const mailer = new Mailer();

describe('Mailer Service', () => {
    it('should send an email successfully', async () => {
        const response = await mailer.sendEmail({
            to: 'test@example.com',
            subject: 'Test Email',
            text: 'This is a test email.',
        });
        expect(response).toHaveProperty('success', true);
    });

    it('should fail to send an email with invalid data', async () => {
        await expect(mailer.sendEmail({
            to: '',
            subject: '',
            text: '',
        })).rejects.toThrow('Invalid email data');
    });
});