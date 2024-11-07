const express = require('express');
const { login, register, requestPasswordReset, verifyOtp, resetPassword  } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/send-email-reset-password', requestPasswordReset);
router.post('/verification-otp', verifyOtp);
router.post('/reset-password', resetPassword);

module.exports = router;