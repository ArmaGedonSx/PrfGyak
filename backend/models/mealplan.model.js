const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: true,
        min: 1,
        max: 31
    },
    mealType: {
        type: String,
        required: true,
        enum: ['breakfast', 'lunch', 'dinner', 'snack']
    },
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
        required: true
    },
    servings: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    notes: {
        type: String,
        trim: true
    }
}, { _id: true });

const mealPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    meals: [mealSchema],
    notes: {
        type: String,
        trim: true
    },
    isPublic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Validate that endDate is after startDate
mealPlanSchema.pre('validate', function (next) {
    if (this.endDate && this.startDate && this.endDate < this.startDate) {
        this.invalidate('endDate', 'End date must be after start date');
    }
    next();
});

// Virtual for duration in days
mealPlanSchema.virtual('durationDays').get(function () {
    if (!this.startDate || !this.endDate) return 0;

    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end days
});

// Method to get all ingredients needed for the meal plan
mealPlanSchema.methods.getIngredientList = async function () {
    // Populate all recipes
    await this.populate({
        path: 'meals.recipe',
        populate: {
            path: 'ingredientQuantities.ingredientId'
        }
    });

    // Create a map to aggregate ingredients
    const ingredientMap = new Map();

    // Process each meal
    this.meals.forEach(meal => {
        const recipe = meal.recipe;
        const servingRatio = meal.servings / recipe.servings;

        // Process each ingredient in the recipe
        recipe.ingredientQuantities.forEach(iq => {
            const ingredientId = iq.ingredientId._id.toString();
            const adjustedQuantity = iq.quantity * servingRatio;

            if (ingredientMap.has(ingredientId)) {
                // Update existing ingredient
                const existing = ingredientMap.get(ingredientId);

                // If units match, add quantities
                if (existing.unit === iq.unit) {
                    existing.quantity += adjustedQuantity;
                } else {
                    // If units don't match, create a new entry with a different key
                    const newKey = `${ingredientId}-${iq.unit}`;
                    ingredientMap.set(newKey, {
                        ingredient: iq.ingredientId,
                        quantity: adjustedQuantity,
                        unit: iq.unit
                    });
                }
            } else {
                // Add new ingredient
                ingredientMap.set(ingredientId, {
                    ingredient: iq.ingredientId,
                    quantity: adjustedQuantity,
                    unit: iq.unit
                });
            }
        });
    });

    // Convert map to array
    return Array.from(ingredientMap.values());
};

// Method to calculate nutritional information for the meal plan
mealPlanSchema.methods.calculateNutrition = async function () {
    // Get ingredient list
    const ingredients = await this.getIngredientList();

    // Initialize nutrition totals
    const nutrition = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0
    };

    // Sum up nutritional values
    ingredients.forEach(item => {
        const { ingredient, quantity } = item;

        // Skip if no nutritional info
        if (!ingredient.nutritionalInfo) return;

        // Add nutritional values based on quantity
        // Note: This is a simplified calculation and would need to be adjusted based on units
        nutrition.calories += (ingredient.nutritionalInfo.calories || 0) * quantity;
        nutrition.protein += (ingredient.nutritionalInfo.protein || 0) * quantity;
        nutrition.carbs += (ingredient.nutritionalInfo.carbs || 0) * quantity;
        nutrition.fat += (ingredient.nutritionalInfo.fat || 0) * quantity;
        nutrition.fiber += (ingredient.nutritionalInfo.fiber || 0) * quantity;
        nutrition.sugar += (ingredient.nutritionalInfo.sugar || 0) * quantity;
    });

    return nutrition;
};

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

module.exports = MealPlan;
