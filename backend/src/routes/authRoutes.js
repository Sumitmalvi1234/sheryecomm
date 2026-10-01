const express = require('express');
const { body } = require('express-validator');
const { register, login, refreshToken, logout, getMe } = require('../controllers/authController');
const authenticate = require('../middlewares/authMiddleware'); // Import the security layer

const router = express.Router();

// Validation Rules
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').notEmpty().withMessage('Confirm password is required').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password field cannot be empty'),
];

// 💡 अल्टीमेट फिक्स: फ्रंटएंड के सभी संभावित यूआरएल पैटर्न्स को एक्सेप्ट करने के लिए बैकअप रूट्स मैपिंग

// 1. रजिस्ट्रेशन के रास्ते
router.post('/register', registerValidation, register);
router.post('/auth/register', registerValidation, register);
router.post('/api/auth/register', registerValidation, register);

// 2. लॉगिन के रास्ते
router.post('/login', loginValidation, login);
router.post('/auth/login', loginValidation, login);
router.post('/api/auth/login', loginValidation, login);

// 3. टोकन रिफ्रेश के रास्ते
router.post('/refresh-token', refreshToken);
router.post('/auth/refresh-token', refreshToken);
router.post('/api/auth/refresh-token', refreshToken);

// 4. प्रोटेक्टेड रास्ते
router.post('/logout', authenticate, logout);
router.post('/auth/logout', authenticate, logout);

router.get('/me', authenticate, getMe);
router.get('/auth/me', authenticate, getMe);

module.exports = router;
