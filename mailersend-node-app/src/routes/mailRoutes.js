import express from 'express';
import MailController from '../controllers/mailController.js';

const router = express.Router();
const mailController = new MailController();

// Define the route for sending emails
router.post('/send', mailController.sendEmail.bind(mailController));

export default router;