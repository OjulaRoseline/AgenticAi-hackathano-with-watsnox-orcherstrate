const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

router.use(authMiddleware);

// GET /api/patients - List all patients
router.get('/', async (req, res) => {
    try {
        const [patients] = await sequelize.query(`
            SELECT id, medical_record_number, first_name, last_name, 
                   room_number, department, status
            FROM patients
            WHERE status = 'active'
            ORDER BY room_number
        `);
        
        res.json({ success: true, patients });
    } catch (error) {
        logger.error('Error fetching patients:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/patients/:id - Get patient details
router.get('/:id', async (req, res) => {
    try {
        const [patients] = await sequelize.query(`
            SELECT * FROM patients WHERE id = $1
        `, { bind: [req.params.id] });
        
        if (patients.length === 0) {
            return res.status(404).json({ success: false, error: 'Patient not found' });
        }
        
        res.json({ success: true, patient: patients[0] });
    } catch (error) {
        logger.error('Error fetching patient:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
