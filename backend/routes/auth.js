const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { sequelize } = require('../config/database');
const { storeSession, deleteSession } = require('../config/redis');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/auth/register
 * Register a new nurse
 */
router.post('/register', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('department').optional().trim(),
    body('phone').optional().trim(),
    body('licenseNumber').optional().trim()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, firstName, lastName, department, phone, licenseNumber } = req.body;

        // Check if user already exists
        const [existing] = await sequelize.query(
            'SELECT id FROM nurses WHERE email = $1',
            { bind: [email] }
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create new nurse
        const [result] = await sequelize.query(`
            INSERT INTO nurses (email, password_hash, first_name, last_name, department, phone, license_number)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, email, first_name, last_name, role, department
        `, {
            bind: [email, passwordHash, firstName, lastName, department, phone, licenseNumber]
        });

        const nurse = result[0];

        // Generate JWT token
        const token = jwt.sign(
            { id: nurse.id, email: nurse.email, role: nurse.role },
            process.env.JWT_SECRET || 'your-secret-key-change-this',
            { expiresIn: '24h' }
        );

        // Store session in Redis
        const sessionId = uuidv4();
        await storeSession(sessionId, {
            nurseId: nurse.id,
            email: nurse.email,
            role: nurse.role
        });

        logger.info(`✅ New nurse registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            sessionId,
            user: {
                id: nurse.id,
                email: nurse.email,
                firstName: nurse.first_name,
                lastName: nurse.last_name,
                role: nurse.role,
                department: nurse.department
            }
        });

    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed',
            message: error.message
        });
    }
});

/**
 * POST /api/auth/login
 * Login existing nurse
 */
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find nurse by email
        const [nurses] = await sequelize.query(
            'SELECT id, email, password_hash, first_name, last_name, role, department, is_active FROM nurses WHERE email = $1',
            { bind: [email] }
        );

        if (nurses.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const nurse = nurses[0];

        // Check if account is active
        if (!nurse.is_active) {
            return res.status(403).json({
                success: false,
                error: 'Account is deactivated'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, nurse.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Update last login
        await sequelize.query(
            'UPDATE nurses SET last_login = NOW() WHERE id = $1',
            { bind: [nurse.id] }
        );

        // Generate JWT token
        const token = jwt.sign(
            { id: nurse.id, email: nurse.email, role: nurse.role },
            process.env.JWT_SECRET || 'your-secret-key-change-this',
            { expiresIn: '24h' }
        );

        // Store session in Redis
        const sessionId = uuidv4();
        await storeSession(sessionId, {
            nurseId: nurse.id,
            email: nurse.email,
            role: nurse.role
        });

        logger.info(`✅ Nurse logged in: ${email}`);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            sessionId,
            user: {
                id: nurse.id,
                email: nurse.email,
                firstName: nurse.first_name,
                lastName: nurse.last_name,
                role: nurse.role,
                department: nurse.department
            }
        });

    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
            message: error.message
        });
    }
});

/**
 * POST /api/auth/logout
 * Logout nurse and clear session
 */
router.post('/logout', async (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'];
        
        if (sessionId) {
            await deleteSession(sessionId);
            logger.info(`✅ Session logged out: ${sessionId}`);
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Logout failed',
            message: error.message
        });
    }
});

/**
 * GET /api/auth/verify
 * Verify JWT token
 */
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');

        // Get fresh user data
        const [nurses] = await sequelize.query(
            'SELECT id, email, first_name, last_name, role, department FROM nurses WHERE id = $1 AND is_active = true',
            { bind: [decoded.id] }
        );

        if (nurses.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'User not found or inactive'
            });
        }

        const nurse = nurses[0];

        res.json({
            success: true,
            user: {
                id: nurse.id,
                email: nurse.email,
                firstName: nurse.first_name,
                lastName: nurse.last_name,
                role: nurse.role,
                department: nurse.department
            }
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

        logger.error('Token verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Verification failed',
            message: error.message
        });
    }
});

module.exports = router;
