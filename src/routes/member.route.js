const { subscribeEmail, verifyEmail } = require('../controllers/member.controller');
const express = require('express');
const router = express.Router();

router.post('/subscribe', subscribeEmail);
router.get('/verify-email', verifyEmail);

module.exports = router;

