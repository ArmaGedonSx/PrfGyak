const express = require('express');
const { MealPlan, Recipe } = require('../models/index');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all public meal plans (public)
router.get('/public', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = 'createdAt',
            order = 'desc'
        } = req.query;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build sort object
        const sortObj = {};
        sortObj[sort] = order === 'asc' ? 1 : -1;

        // Find public meal plans
        const mealPlans = await MealPlan.find({ isPublic: true })
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('user', 'username profilePicture')
            .populate({
                path: 'meals.recipe',
                select: 'title images prepTime cookTime difficulty'
            });

        // Get total count for pagination
        const total = await MealPlan.countDocuments({ isPublic: true });

        res.json({
            mealPlans,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching meal plans', error: error.message });
    }
});

// Get user's meal plans (protected)
router.get('/user', authMiddleware, async (req, res) => {
    try {
        const mealPlans = await MealPlan.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'meals.recipe',
                select: 'title images prepTime cookTime difficulty'
            });

        res.json(mealPlans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching meal plans', error: error.message });
    }
});

// Get meal plan by ID (protected or public)
router.get('/:id', async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id)
            .populate('user', 'username profilePicture')
            .populate({
                path: 'meals.recipe',
                select: 'title images prepTime cookTime difficulty ingredientQuantities'
            });

        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        // Check if meal plan is private and user is not the owner
        if (!mealPlan.isPublic && (!req.user || mealPlan.user._id.toString() !== req.user.userId)) {
            return res.status(403).json({ message: 'Not authorized to view this meal plan' });
        }

        res.json(mealPlan);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching meal plan', error: error.message });
    }
});

// Create new meal plan (protected)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            name,
            startDate,
            endDate,
            meals,
            notes,
            isPublic
        } = req.body;

        // Validate required fields
        if (!name || !startDate || !endDate) {
            return res.status(400).json({ message: 'Name, start date, and end date are required' });
        }

        // Create new meal plan
        const mealPlan = new MealPlan({
            name,
            user: req.user.userId,
            startDate,
            endDate,
            meals: meals || [],
            notes: notes || '',
            isPublic: isPublic || false
        });

        await mealPlan.save();

        res.status(201).json({
            message: 'Meal plan created successfully',
            mealPlan
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating meal plan', error: error.message });
    }
});

// Update meal plan (protected, only owner)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id);

        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        // Check if user is the owner
        if (mealPlan.user.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to update this meal plan' });
        }

        // Update fields
        const {
            name,
            startDate,
            endDate,
            meals,
            notes,
            isPublic
        } = req.body;

        if (name) mealPlan.name = name;
        if (startDate) mealPlan.startDate = startDate;
        if (endDate) mealPlan.endDate = endDate;
        if (meals) mealPlan.meals = meals;
        if (notes !== undefined) mealPlan.notes = notes;
        if (isPublic !== undefined) mealPlan.isPublic = isPublic;

        await mealPlan.save();

        res.json({
            message: 'Meal plan updated successfully',
            mealPlan
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating meal plan', error: error.message });
    }
});

// Delete meal plan (protected, only owner)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id);

        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        // Check if user is the owner
        if (mealPlan.user.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this meal plan' });
        }

        await mealPlan.remove();

        res.json({ message: 'Meal plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting meal plan', error: error.message });
    }
});

// Add meal to meal plan (protected, only owner)
router.post('/:id/meals', authMiddleware, async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id);

        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        // Check if user is the owner
        if (mealPlan.user.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to update this meal plan' });
        }

        const { day, mealType, recipeId, servings, notes } = req.body;

        // Validate required fields
        if (!day || !mealType || !recipeId) {
            return res.status(400).json({ message: 'Day, meal type, and recipe ID are required' });
        }

        // Check if recipe exists
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Add meal to meal plan
        mealPlan.meals.push({
            day,
            mealType,
            recipe: recipeId,
            servings: servings || 1,
            notes: notes || ''
        });

        await mealPlan.save();

        res.json({
            message: 'Meal added to meal plan successfully',
            mealPlan
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding meal to meal plan', error: error.message });
    }
});

// Remove meal from meal plan (protected, only owner)
router.delete('/:id/meals/:mealId', authMiddleware, async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id);

        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        // Check if user is the owner
        if (mealPlan.user.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to update this meal plan' });
        }

        // Find meal in meal plan
        const mealIndex = mealPlan.meals.findIndex(meal => meal._id.toString() === req.params.mealId);

        if (mealIndex === -1) {
            return res.status(404).json({ message: 'Meal not found in meal plan' });
        }

        // Remove meal from meal plan
        mealPlan.meals.splice(mealIndex, 1);

        await mealPlan.save();

        res.json({
            message: 'Meal removed from meal plan successfully',
            mealPlan
        });
    } catch (error) {
        res.status(500).json({ message: 'Error removing meal from meal plan', error: error.message });
    }
});

// Generate shopping list for meal plan (protected, owner or public)
router.get('/:id/shopping-list', authMiddleware, async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id);

        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        // Check if meal plan is private and user is not the owner
        if (!mealPlan.isPublic && mealPlan.user.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to view this meal plan' });
        }

        // Generate shopping list
        const ingredientList = await mealPlan.getIngredientList();

        res.json(ingredientList);
    } catch (error) {
        res.status(500).json({ message: 'Error generating shopping list', error: error.message });
    }
});

// Calculate nutrition for meal plan (protected, owner or public)
router.get('/:id/nutrition', authMiddleware, async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id);

        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }

        // Check if meal plan is private and user is not the owner
        if (!mealPlan.isPublic && mealPlan.user.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to view this meal plan' });
        }

        // Calculate nutrition
        const nutrition = await mealPlan.calculateNutrition();

        res.json(nutrition);
    } catch (error) {
        res.status(500).json({ message: 'Error calculating nutrition', error: error.message });
    }
});

module.exports = router;
