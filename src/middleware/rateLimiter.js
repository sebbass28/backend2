import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000), // 1 minute
  max: Number(process.env.RATE_LIMIT_MAX || 100), // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

// Apply to all requests
export default limiter;