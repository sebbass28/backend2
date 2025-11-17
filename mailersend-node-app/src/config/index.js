const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    mailerSendApiKey: process.env.MAILERSEND_API_KEY,
    mailerSendDomain: process.env.MAILERSEND_DOMAIN,
    mailerSendFrom: process.env.MAILERSEND_FROM,
};