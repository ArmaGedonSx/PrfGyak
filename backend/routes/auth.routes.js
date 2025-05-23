const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { authMiddleware, JWT_SECRET, JWT_EXPIRATION } = require('../middleware/auth.middleware');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, dietaryPreferences } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists',
                field: existingUser.email === email ? 'email' : 'username'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            dietaryPreferences: dietaryPreferences || []
        });
        await user.save();

        // Create token with longer expiration
        const token = jwt.sign(
            { userId: user._id, email: user.email, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                dietaryPreferences: user.dietaryPreferences
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Create token with longer expiration
        const token = jwt.sign(
            { userId: user._id, email: user.email, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                dietaryPreferences: user.dietaryPreferences,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
});

// Get user profile (protected route)
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('-password')
            .populate('favoriteRecipes', 'title images averageRating');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Formázott válasz a frontend számára
        const formattedUser = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            dietaryPreferences: user.dietaryPreferences,
            favoriteRecipes: user.favoriteRecipes
        };

        res.json(formattedUser);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

// Update user profile (protected route)
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { username, profilePicture, dietaryPreferences } = req.body;

        // Ellenőrizzük, hogy a felhasználónév már foglalt-e (ha változott)
        if (username) {
            const existingUser = await User.findOne({
                username,
                _id: { $ne: req.user.userId }
            });

            if (existingUser) {
                return res.status(400).json({
                    message: 'Username already taken',
                    field: 'username'
                });
            }
        }

        // Frissítjük a felhasználót (email nem módosítható)
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            {
                username,
                profilePicture,
                dietaryPreferences,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                profilePicture: updatedUser.profilePicture,
                dietaryPreferences: updatedUser.dietaryPreferences
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating profile',
            error: error.message
        });
    }
});

module.exports = router;
