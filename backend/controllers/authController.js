const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// In-memory reset token store (shared between forgot & reset)
const resetTokens = new Map();

// Build Nodemailer transporter — Gmail App Password
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Build a consistent user response object
const buildUserResponse = (user, token) => ({
  _id: user._id,
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  educationLevel: user.educationLevel,
  bio: user.bio || '',
  avatar: user.avatar || null,
  notesUploaded: user.notesUploaded || 0,
  totalDownloads: user.totalDownloads || 0,
  rating: user.rating || 0,
  purchasedNotes: user.purchasedNotes || [],
  createdAt: user.createdAt,
  token,
});

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { fullName, username, email, password, educationLevel } = req.body;

    if (!fullName || !username || !email || !password || !educationLevel) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { username: username.toLowerCase().replace(/\s/g, '_') }] });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with that email or username' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      fullName,
      username: username.toLowerCase().replace(/\s/g, '_'),
      email,
      passwordHash: hashedPassword,
      educationLevel,
    });

    if (user) {
      res.status(201).json(buildUserResponse(user, generateToken(user._id)));
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.json(buildUserResponse(user, generateToken(user._id)));
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(buildUserResponse(user, null));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request password reset (sends email with reset link)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    // Always respond 200 to avoid user enumeration
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    // Token expires in 15 minutes
    resetTokens.set(token, { userId: user._id.toString(), expires: Date.now() + 15 * 60 * 1000 });

    const transporter = createTransporter();

    if (transporter) {
      // Production mode: send real email
      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
      const resetLink = `${frontendUrl}/reset-password?token=${token}`;

      const html = `
        <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #6C63FF; font-size: 28px; margin: 0;">📚 EduMarket</h1>
          </div>
          <div style="background: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="color: #1a1a2e; margin-top: 0;">Reset Your Password</h2>
            <p style="color: #6b7280;">Hi <strong>${user.fullName}</strong>,</p>
            <p style="color: #6b7280;">Someone requested a password reset for your EduMarket account. Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}" style="background: linear-gradient(135deg, #6C63FF, #5a52d5); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Reset Password</a>
            </div>
            <p style="color: #9ca3af; font-size: 13px;">If you didn't request this, ignore this email. Your password won't change.</p>
            <p style="color: #9ca3af; font-size: 12px; word-break: break-all;">Or copy this link: ${resetLink}</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `EduMarket <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '🔑 Reset your EduMarket password',
        html,
      });

      return res.json({ message: 'Password reset link sent to your email. Check your inbox (and spam folder).' });
    } else {
      // Development fallback: return token directly in response
      return res.json({
        message: 'Email service not configured. Use the token below (dev mode).',
        resetToken: token,
        hint: `POST /api/auth/reset-password with { token, newPassword }`,
        note: 'To enable email, set EMAIL_USER and EMAIL_PASS in backend/.env',
      });
    }
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const entry = resetTokens.get(token);
    if (!entry) return res.status(400).json({ message: 'Invalid or expired reset token' });
    if (Date.now() > entry.expires) {
      resetTokens.delete(token);
      return res.status(400).json({ message: 'Reset token has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(entry.userId, { passwordHash });
    resetTokens.delete(token);

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
};
