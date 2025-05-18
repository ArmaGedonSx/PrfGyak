const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const ingredientQuantitySchema = new mongoose.Schema({
    ingredientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        required: true,
        trim: true
    }
});

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    prepTime: {
        type: Number,
        required: true,
        min: 0
    },
    cookTime: {
        type: Number,
        required: true,
        min: 0
    },
    servings: {
        type: Number,
        required: true,
        min: 1
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['easy', 'medium', 'hard']
    },
    ingredientQuantities: [ingredientQuantitySchema],
    steps: [{
        type: String,
        required: true,
        trim: true
    }],
    categories: [{
        type: String,
        required: true,
        trim: true
    }],
    tags: [{
        type: String,
        trim: true
    }],
    images: [{
        type: String,
        trim: true
    }],
    ratings: [ratingSchema],
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    }
}, {
    timestamps: true
});

// Calculate average rating before saving
recipeSchema.pre('save', function (next) {
    if (this.ratings && this.ratings.length > 0) {
        const totalRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
        this.averageRating = totalRating / this.ratings.length;
    } else {
        this.averageRating = 0;
    }
    next();
});

// Virtual for total time
recipeSchema.virtual('totalTime').get(function () {
    return this.prepTime + this.cookTime;
});

// Method to add a rating
recipeSchema.methods.addRating = function (userId, rating, comment) {
    // Check if user already rated
    const existingRatingIndex = this.ratings.findIndex(r => r.userId.toString() === userId.toString());

    if (existingRatingIndex !== -1) {
        // Update existing rating
        this.ratings[existingRatingIndex].rating = rating;
        this.ratings[existingRatingIndex].comment = comment;
        this.ratings[existingRatingIndex].date = Date.now();
    } else {
        // Add new rating
        this.ratings.push({
            userId,
            rating,
            comment,
            date: Date.now()
        });
    }

    // Recalculate average rating
    const totalRating = this.ratings.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = totalRating / this.ratings.length;

    return this.save();
};

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
