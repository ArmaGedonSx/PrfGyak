const mongoose = require('mongoose');

const nutritionalInfoSchema = new mongoose.Schema({
    calories: {
        type: Number,
        min: 0,
        default: 0
    },
    protein: {
        type: Number,
        min: 0,
        default: 0
    },
    carbs: {
        type: Number,
        min: 0,
        default: 0
    },
    fat: {
        type: Number,
        min: 0,
        default: 0
    },
    fiber: {
        type: Number,
        min: 0,
        default: 0
    },
    sugar: {
        type: Number,
        min: 0,
        default: 0
    }
}, { _id: false });

const ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'vegetables',
            'fruits',
            'grains',
            'dairy',
            'protein',
            'nuts_seeds',
            'herbs_spices',
            'oils_fats',
            'sweeteners',
            'condiments',
            'beverages',
            'other'
        ]
    },
    nutritionalInfo: {
        type: nutritionalInfoSchema,
        default: () => ({})
    },
    commonUnits: [{
        type: String,
        trim: true
    }],
    image: {
        type: String,
        default: ''
    },
    allergens: [{
        type: String,
        enum: [
            'gluten',
            'dairy',
            'nuts',
            'eggs',
            'soy',
            'fish',
            'shellfish',
            'none'
        ]
    }],
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for faster searches
ingredientSchema.index({ name: 'text', category: 1 });

// Virtual for checking if ingredient is vegetarian
ingredientSchema.virtual('isVegetarian').get(function () {
    const nonVegetarianCategories = ['protein'];
    const nonVegetarianIngredients = ['beef', 'chicken', 'pork', 'lamb', 'turkey', 'duck', 'venison', 'bacon', 'ham'];

    if (this.category === 'protein') {
        return !nonVegetarianIngredients.some(item => this.name.toLowerCase().includes(item));
    }

    return true;
});

// Virtual for checking if ingredient is vegan
ingredientSchema.virtual('isVegan').get(function () {
    const nonVeganCategories = ['protein', 'dairy'];
    const nonVeganIngredients = [
        'beef', 'chicken', 'pork', 'lamb', 'turkey', 'duck', 'venison', 'bacon', 'ham',
        'milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg', 'honey'
    ];

    if (this.category === 'protein' || this.category === 'dairy') {
        return !nonVeganIngredients.some(item => this.name.toLowerCase().includes(item));
    }

    return true;
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient;
