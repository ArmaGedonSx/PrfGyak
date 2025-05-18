const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const Recipe = require('../models/recipe.model');
const Ingredient = require('../models/ingredient.model');

// Middleware az admin jogosultságok ellenőrzéséhez
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/stats - Statisztikák lekérdezése
router.get('/stats', async (req, res) => {
    try {
        // Felhasználók, receptek és hozzávalók számának lekérdezése
        const userCount = await User.countDocuments();
        const recipeCount = await Recipe.countDocuments();
        const ingredientCount = await Ingredient.countDocuments();

        res.json({
            userCount,
            recipeCount,
            ingredientCount
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ message: 'Error getting stats' });
    }
});

// GET /api/users - Összes felhasználó lekérdezése
router.get('/users', async (req, res) => {
    try {
        // Felhasználók lekérdezése (jelszó nélkül)
        const users = await User.find({}, { password: 0 });
        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Error getting users' });
    }
});

// PATCH /api/users/:id/role - Felhasználó szerepkörének módosítása
router.patch('/users/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Ellenőrizzük, hogy a szerepkör érvényes-e
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Felhasználó frissítése
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true, select: '-password' }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: 'Error updating user role' });
    }
});

module.exports = router;
