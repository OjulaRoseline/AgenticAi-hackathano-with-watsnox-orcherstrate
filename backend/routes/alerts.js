const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { sequelize } = require('../config/database');

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const [alerts] = await sequelize.query(`
            SELECT a.*, p.first_name, p.last_name 
            FROM alerts a
            LEFT JOIN patients p ON p.id = a.patient_id
            WHERE a.is_read = false
            ORDER BY a.created_at DESC
            LIMIT 50
        `);
        
        res.json({ success: true, alerts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
