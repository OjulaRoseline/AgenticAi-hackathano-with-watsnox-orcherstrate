const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/me', (req, res) => {
    res.json({ success: true, user: req.user });
});

module.exports = router;
