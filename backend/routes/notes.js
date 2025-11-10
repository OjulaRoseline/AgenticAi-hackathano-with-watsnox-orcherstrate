const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/patient/:patientId', (req, res) => {
    res.json({ success: true, notes: [] });
});

module.exports = router;
