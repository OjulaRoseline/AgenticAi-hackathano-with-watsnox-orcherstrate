const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { sequelize } = require('../config/database');

router.use(authMiddleware);

router.get('/patient/:patientId', async (req, res) => {
    try {
        const [vitals] = await sequelize.query(`
            SELECT * FROM vital_signs 
            WHERE patient_id = $1 
            ORDER BY recorded_at DESC 
            LIMIT 10
        `, { bind: [req.params.patientId] });
        
        res.json({ success: true, vitals });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
