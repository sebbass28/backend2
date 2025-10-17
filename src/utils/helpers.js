// This file contains various helper functions used throughout the application.

// Function to convert a string representing time duration (e.g., '30d', '1h') to milliseconds
export function msToMs(str) {
  if (!str) return 0;
  const match = /^(\d+)([dhm])$/.exec(str);
  if (!match) return 0;
  const value = Number(match[1]);
  const unit = match[2];
  if (unit === 'd') return value * 24 * 60 * 60 * 1000;
  if (unit === 'h') return value * 60 * 60 * 1000;
  if (unit === 'm') return value * 60 * 1000;
  return 0;
}

// Function to sanitize input strings to prevent XSS attacks
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Function to generate a random string for use as a unique identifier
export function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}