const express = require('express');
const { Recipe, User } = require('../models/index');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all categories (public)
router.get('/categories', async (req, res) => {
    try {
        const categories = await Recipe.distinct('categories');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});

// Get user's favorite recipes (protected)
router.get('/user/favorites', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate({
                path: 'favoriteRecipes',
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });

        res.json(user.favoriteRecipes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching favorites', error: error.message });
    }
});

// Get all recipes (public)
router.get('/', async (req, res) => {
    try {
        const {
            search,
            category,
            difficulty,
            minTime,
            maxTime,
            sort = 'createdAt',
            order = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        // Build query
        const query = {};

        // Search by title or description
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by category
        if (category) {
            query.categories = { $in: [category] };
        }

        // Filter by difficulty
        if (difficulty) {
            query.difficulty = difficulty;
        }

        // Filter by total time (prep + cook time)
        if (minTime || maxTime) {
            query.$expr = query.$expr || {};

            if (minTime) {
                query.$expr.$gte = [{ $add: ['$prepTime', '$cookTime'] }, parseInt(minTime)];
            }

            if (maxTime) {
                query.$expr.$lte = [{ $add: ['$prepTime', '$cookTime'] }, parseInt(maxTime)];
            }
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build sort object
        const sortObj = {};
        sortObj[sort] = order === 'asc' ? 1 : -1;

        // Execute query with pagination
        const recipes = await Recipe.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('author', 'username profilePicture');

        // Get total count for pagination
        const total = await Recipe.countDocuments(query);

        res.json({
            recipes,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recipes', error: error.message });
    }
});

// Get recipe by ID (public)
router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('author', 'username profilePicture')
            .populate('ingredientQuantities.ingredientId');

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        res.json(recipe);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recipe', error: error.message });
    }
});

// Create new recipe (protected)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            title,
            description,
            prepTime,
            cookTime,
            servings,
            difficulty,
            ingredientQuantities,
            steps,
            categories,
            tags,
            images
        } = req.body;

        // Create new recipe
        const recipe = new Recipe({
            title,
            description,
            author: req.user.userId,
            prepTime,
            cookTime,
            servings,
            difficulty,
            ingredientQuantities: ingredientQuantities || [],
            steps: steps || [],
            categories: categories || [],
            tags: tags || [],
            images: images || []
        });

        await recipe.save();

        res.status(201).json({
            message: 'Recipe created successfully',
            recipe
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating recipe', error: error.message });
    }
});

// Update recipe (protected, owner or admin)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Check if user is the owner or admin
        const isOwner = recipe.author.toString() === req.user.userId;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update this recipe' });
        }

        // Update fields
        const {
            title,
            description,
            prepTime,
            cookTime,
            servings,
            difficulty,
            ingredientQuantities,
            steps,
            categories,
            tags,
            images
        } = req.body;

        if (title) recipe.title = title;
        if (description) recipe.description = description;
        if (prepTime) recipe.prepTime = prepTime;
        if (cookTime) recipe.cookTime = cookTime;
        if (servings) recipe.servings = servings;
        if (difficulty) recipe.difficulty = difficulty;
        if (ingredientQuantities) recipe.ingredientQuantities = ingredientQuantities;
        if (steps) recipe.steps = steps;
        if (categories) recipe.categories = categories;
        if (tags) recipe.tags = tags;
        if (images) recipe.images = images;

        await recipe.save();

        res.json({
            message: 'Recipe updated successfully',
            recipe
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating recipe', error: error.message });
    }
});

// Delete recipe (protected, owner or admin)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Check if user is the owner or admin
        const isOwner = recipe.author.toString() === req.user.userId;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this recipe' });
        }

        await Recipe.deleteOne({ _id: req.params.id });

        res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting recipe', error: error.message });
    }
});

// Rate recipe (protected)
router.post('/:id/rate', authMiddleware, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Add or update rating
        await recipe.addRating(req.user.userId, rating, comment);

        res.json({
            message: 'Rating added successfully',
            recipe
        });
    } catch (error) {
        res.status(500).json({ message: 'Error rating recipe', error: error.message });
    }
});

// Add recipe to favorites (protected)
router.post('/:id/favorite', authMiddleware, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const user = await User.findById(req.user.userId);

        // Check if recipe is already in favorites
        if (user.favoriteRecipes.includes(recipe._id)) {
            return res.status(400).json({ message: 'Recipe already in favorites' });
        }

        // Add to favorites
        user.favoriteRecipes.push(recipe._id);
        await user.save();

        res.json({
            message: 'Recipe added to favorites',
            favoriteRecipes: user.favoriteRecipes
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding to favorites', error: error.message });
    }
});

// Remove recipe from favorites (protected)
router.delete('/:id/favorite', authMiddleware, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const user = await User.findById(req.user.userId);

        // Check if recipe is in favorites
        if (!user.favoriteRecipes.includes(recipe._id)) {
            return res.status(400).json({ message: 'Recipe not in favorites' });
        }

        // Remove from favorites
        user.favoriteRecipes = user.favoriteRecipes.filter(
            id => id.toString() !== recipe._id.toString()
        );
        await user.save();

        res.json({
            message: 'Recipe removed from favorites',
            favoriteRecipes: user.favoriteRecipes
        });
    } catch (error) {
        res.status(500).json({ message: 'Error removing from favorites', error: error.message });
    }
});


// Get recipe nutrition information (public)
router.get('/:id/nutrition', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('ingredientQuantities.ingredientId');

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Calculate nutrition information
        const nutrition = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0
        };

        // Sum up nutritional values from all ingredients
        recipe.ingredientQuantities.forEach(item => {
            const { ingredientId, quantity } = item;

            // Skip if ingredient doesn't have nutritional info
            if (!ingredientId || !ingredientId.nutritionalInfo) return;

            // Add nutritional values based on quantity
            // Nutritional values are per 100g, so we need to divide the quantity by 100
            const factor = quantity / 100;

            nutrition.calories += (ingredientId.nutritionalInfo.calories || 0) * factor;
            nutrition.protein += (ingredientId.nutritionalInfo.protein || 0) * factor;
            nutrition.carbs += (ingredientId.nutritionalInfo.carbs || 0) * factor;
            nutrition.fat += (ingredientId.nutritionalInfo.fat || 0) * factor;
            nutrition.fiber += (ingredientId.nutritionalInfo.fiber || 0) * factor;
            nutrition.sugar += (ingredientId.nutritionalInfo.sugar || 0) * factor;
        });

        // Calculate per serving values
        const perServing = {
            calories: Math.round(nutrition.calories / recipe.servings),
            protein: Math.round(nutrition.protein / recipe.servings * 10) / 10,
            carbs: Math.round(nutrition.carbs / recipe.servings * 10) / 10,
            fat: Math.round(nutrition.fat / recipe.servings * 10) / 10,
            fiber: Math.round(nutrition.fiber / recipe.servings * 10) / 10,
            sugar: Math.round(nutrition.sugar / recipe.servings * 10) / 10
        };

        res.json({
            total: nutrition,
            perServing: perServing,
            servings: recipe.servings
        });
    } catch (error) {
        res.status(500).json({ message: 'Error calculating nutrition', error: error.message });
    }
});

module.exports = router;
