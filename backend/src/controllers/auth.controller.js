/**
 * Authentication Controller
 * Manages Admin & Staff Login, Token Generation, and User Verification
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required. Set it in your backend .env file.');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    const result = await db.query(
      `SELECT user_id, username, password_hash, full_name, email, role, is_active
       FROM APP_USER
       WHERE username = $1`,
      [username.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This user account has been deactivated. Please contact the administrator.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    // Generate JWT payload
    const tokenPayload = {
      userId: user.user_id,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        userId: user.user_id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 */
const getProfile = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT user_id, username, full_name, email, role, created_at
       FROM APP_USER
       WHERE user_id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/register (Admin only)
 */
const registerUser = async (req, res, next) => {
  try {
    const { username, password, fullName, email, role } = req.body;

    if (!username || !password || !fullName || !email) {
      return res.status(400).json({
        success: false,
        message: 'All fields (username, password, fullName, email) are required.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.query(
      `INSERT INTO APP_USER (username, password_hash, full_name, email, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, username, full_name, email, role, created_at`,
      [username.trim(), passwordHash, fullName.trim(), email.trim(), role || 'Staff']
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  getProfile,
  registerUser,
};
