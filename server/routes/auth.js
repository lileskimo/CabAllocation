const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user (default role is 'employee' for security)
    const userRole = role === 'admin' ? 'admin' : 'employee';
    
    const result = await query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, passwordHash, userRole]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: '24h' }
    );

    // Log token for debugging (remove in production)
    console.log('\n🔐 JWT TOKEN GENERATED (Registration):');
    console.log('User:', user.email, `(${user.role})`);
    console.log('Token:', token);
    console.log('Bearer Header:', `Authorization: Bearer ${token}\n`);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userData = user.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userData.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: userData.id, 
        email: userData.email, 
        role: userData.role 
      },
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: '24h' }
    );

    // Log token for debugging (remove in production)
    console.log('\n🔐 JWT TOKEN GENERATED:');
    console.log('User:', userData.email, `(${userData.role})`);
    console.log('Token:', token);
    console.log('Bearer Header:', `Authorization: Bearer ${token}\n`);

    // Return user data and token
    res.json({
      message: 'Login successful',
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// GET /api/auth - Keep the test endpoint
router.get('/', (req, res) => {
  res.json({ message: 'Auth routes working', endpoint: '/api/auth' });
});

module.exports = router; 