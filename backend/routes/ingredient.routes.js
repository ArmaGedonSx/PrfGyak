const express = require('express');
const { Ingredient } = require('../models/index');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all ingredients (public)
router.get('/', async (req, res) => {
    try {
        const {
            search,
            category,
            sort = 'name',
            order = 'asc',
            page = 1,
            limit = 50
        } = req.query;

        // Build query
        const query = {};

        // Search by name
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build sort object
        const sortObj = {};
        sortObj[sort] = order === 'asc' ? 1 : -1;

        // Execute query with pagination
        const ingredients = await Ingredient.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Ingredient.countDocuments(query);

        res.json({
            ingredients,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching ingredients', error: error.message });
    }
});

// Get ingredient by ID (public)
router.get('/:id', async (req, res) => {
    try {
        const ingredient = await Ingredient.findById(req.params.id);

        if (!ingredient) {
            return res.status(404).json({ message: 'Ingredient not found' });
        }

        res.json(ingredient);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching ingredient', error: error.message });
    }
});

// Create new ingredient (protected, admin only in a real app)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            name,
            category,
            nutritionalInfo,
            commonUnits,
            image,
            allergens,
            description
        } = req.body;

        // Check if ingredient already exists
        const existingIngredient = await Ingredient.findOne({ name });
        if (existingIngredient) {
            return res.status(400).json({ message: 'Ingredient already exists' });
        }

        // Create new ingredient
        const ingredient = new Ingredient({
            name,
            category,
            nutritionalInfo: nutritionalInfo || {},
            commonUnits: commonUnits || [],
            image: image || '',
            allergens: allergens || [],
            description: description || ''
        });

        await ingredient.save();

        res.status(201).json({
            message: 'Ingredient created successfully',
            ingredient
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating ingredient', error: error.message });
    }
});

// Update ingredient (protected, admin only in a real app)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const ingredient = await Ingredient.findById(req.params.id);

        if (!ingredient) {
            return res.status(404).json({ message: 'Ingredient not found' });
        }

        // Update fields
        const {
            name,
            category,
            nutritionalInfo,
            commonUnits,
            image,
            allergens,
            description
        } = req.body;

        if (name) ingredient.name = name;
        if (category) ingredient.category = category;
        if (nutritionalInfo) ingredient.nutritionalInfo = nutritionalInfo;
        if (commonUnits) ingredient.commonUnits = commonUnits;
        if (image) ingredient.image = image;
        if (allergens) ingredient.allergens = allergens;
        if (description) ingredient.description = description;

        await ingredient.save();

        res.json({
            message: 'Ingredient updated successfully',
            ingredient
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating ingredient', error: error.message });
    }
});

// Delete ingredient (protected, admin only in a real app)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const ingredient = await Ingredient.findById(req.params.id);

        if (!ingredient) {
            return res.status(404).json({ message: 'Ingredient not found' });
        }

        await Ingredient.deleteOne({ _id: req.params.id });

        res.json({ message: 'Ingredient deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting ingredient', error: error.message });
    }
});

// Get ingredient categories (public)
router.get('/util/categories', async (req, res) => {
    try {
        const categories = await Ingredient.distinct('category');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});

// Search ingredients by name (public)
router.get('/search/:query', async (req, res) => {
    try {
        const query = req.params.query;

        if (!query || query.length < 2) {
            return res.status(400).json({ message: 'Search query must be at least 2 characters' });
        }

        const ingredients = await Ingredient.find({
            name: { $regex: query, $options: 'i' }
        }).limit(10);

        res.json(ingredients);
    } catch (error) {
        res.status(500).json({ message: 'Error searching ingredients', error: error.message });
    }
});

module.exports = router;
