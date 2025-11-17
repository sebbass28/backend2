const express = require('express');
const mailRoutes = require('./routes/mailRoutes');
const { logger } = require('./utils/logger');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/mail', mailRoutes);

// Error handling
app.use((err, req, res, next) => {
    logger.error(err.message);
    res.status(500).send('Internal Server Error');
});

// Start server
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});