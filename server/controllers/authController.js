const User = require('../models/User');
const fallbackDb = require('../data/fallback_db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper to determine if we should use fallback DB
const isMongoConnected = () => {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1; // 1 = connected
};

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    let existingUser;
    if (isMongoConnected()) {
      existingUser = await User.findOne({ $or: [{ email }, { username }] });
    } else {
      existingUser = await fallbackDb.users.findOne({ email }) || await fallbackDb.users.findOne({ username });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Register User
    let user;
    if (isMongoConnected()) {
      user = new User({ username, email, password });
      await user.save();
    } else {
      // Hashing manually for fallback DB
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = await fallbackDb.users.create({
        username,
        email,
        password: hashedPassword,
        role: 'user'
      });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user._id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user;
    if (isMongoConnected()) {
      user = await User.findOne({ email });
    } else {
      user = await fallbackDb.users.findOne({ email });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify Password
    let isMatch;
    if (isMongoConnected()) {
      isMatch = await user.comparePassword(password);
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const payload = {
      user: {
        id: user._id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    let user;
    if (isMongoConnected()) {
      user = await User.findById(req.user.id).select('-password');
    } else {
      user = await fallbackDb.users.findById(req.user.id);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error('Profile fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
