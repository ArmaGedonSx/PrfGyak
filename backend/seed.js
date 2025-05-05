const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const { User, Recipe, Ingredient, MealPlan } = require('./models');

// Load environment variables
dotenv.config();

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/meandb';

// MongoDB Atlas ajánlott kapcsolódási opciók
const mongooseOptions = {
    serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
    },
    dbName: 'meandb',
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000
};

// Sample data
const users = [
    {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        profilePicture: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
        dietaryPreferences: ['none'],
        role: 'admin'
    },
    {
        username: 'vegetarian_user',
        email: 'vegetarian@example.com',
        password: 'password123',
        profilePicture: 'https://www.gravatar.com/avatar/11111111111111111111111111111111?d=mp&f=y',
        dietaryPreferences: ['vegetarian']
    },
    {
        username: 'vegan_user',
        email: 'vegan@example.com',
        password: 'password123',
        profilePicture: 'https://www.gravatar.com/avatar/22222222222222222222222222222222?d=mp&f=y',
        dietaryPreferences: ['vegan']
    }
];

const ingredients = [
    {
        name: 'Chicken Breast',
        category: 'protein',
        nutritionalInfo: {
            calories: 165,
            protein: 31,
            carbs: 0,
            fat: 3.6,
            fiber: 0,
            sugar: 0
        },
        commonUnits: ['g', 'oz', 'piece'],
        image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Y2hpY2tlbiUyMGJyZWFzdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
        allergens: ['none'],
        description: 'Lean, boneless chicken breast meat'
    },
    {
        name: 'Rice',
        category: 'grains',
        nutritionalInfo: {
            calories: 130,
            protein: 2.7,
            carbs: 28,
            fat: 0.3,
            fiber: 0.4,
            sugar: 0.1
        },
        commonUnits: ['g', 'cup'],
        image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmljZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
        allergens: ['none'],
        description: 'White, long-grain rice'
    },
    {
        name: 'Broccoli',
        category: 'vegetables',
        nutritionalInfo: {
            calories: 34,
            protein: 2.8,
            carbs: 6.6,
            fat: 0.4,
            fiber: 2.6,
            sugar: 1.7
        },
        commonUnits: ['g', 'cup', 'piece'],
        image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YnJvY2NvbGl8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
        allergens: ['none'],
        description: 'Fresh green broccoli florets'
    },
    {
        name: 'Olive Oil',
        category: 'oils_fats',
        nutritionalInfo: {
            calories: 884,
            protein: 0,
            carbs: 0,
            fat: 100,
            fiber: 0,
            sugar: 0
        },
        commonUnits: ['ml', 'tbsp', 'tsp'],
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8b2xpdmUlMjBvaWx8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
        allergens: ['none'],
        description: 'Extra virgin olive oil'
    },
    {
        name: 'Garlic',
        category: 'herbs_spices',
        nutritionalInfo: {
            calories: 149,
            protein: 6.4,
            carbs: 33,
            fat: 0.5,
            fiber: 2.1,
            sugar: 1
        },
        commonUnits: ['g', 'clove'],
        image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Z2FybGljfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
        allergens: ['none'],
        description: 'Fresh garlic cloves'
    },
    {
        name: 'Lemon',
        category: 'fruits',
        nutritionalInfo: {
            calories: 29,
            protein: 1.1,
            carbs: 9.3,
            fat: 0.3,
            fiber: 2.8,
            sugar: 2.5
        },
        commonUnits: ['g', 'piece', 'tbsp'],
        image: 'https://images.unsplash.com/photo-1582476473562-b25216f94c5e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bGVtb258ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
        allergens: ['none'],
        description: 'Fresh yellow lemon'
    },
    {
        name: 'Salt',
        category: 'herbs_spices',
        nutritionalInfo: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0
        },
        commonUnits: ['g', 'tsp', 'pinch'],
        image: 'https://images.unsplash.com/photo-1518110925495-b37e912bdf5e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c2FsdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
        allergens: ['none'],
        description: 'Table salt'
    },
    {
        name: 'Black Pepper',
        category: 'herbs_spices',
        nutritionalInfo: {
            calories: 251,
            protein: 10.4,
            carbs: 63.9,
            fat: 3.3,
            fiber: 25.3,
            sugar: 0.6
        },
        commonUnits: ['g', 'tsp', 'pinch'],
        image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YmxhY2slMjBwZXBwZXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
        allergens: ['none'],
        description: 'Ground black pepper'
    },
    {
        name: 'Tofu',
        category: 'protein',
        nutritionalInfo: {
            calories: 76,
            protein: 8,
            carbs: 1.9,
            fat: 4.8,
            fiber: 0.3,
            sugar: 0.5
        },
        commonUnits: ['g', 'block'],
        image: 'https://images.unsplash.com/photo-1584321094050-6f5e8006a95d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dG9mdXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
        allergens: ['soy'],
        description: 'Firm tofu'
    },
    {
        name: 'Quinoa',
        category: 'grains',
        nutritionalInfo: {
            calories: 120,
            protein: 4.4,
            carbs: 21.3,
            fat: 1.9,
            fiber: 2.8,
            sugar: 0.9
        },
        commonUnits: ['g', 'cup'],
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cXVpbm9hfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
        allergens: ['none'],
        description: 'White quinoa seeds'
    }
];

// Function to seed the database
async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(mongoURI, mongooseOptions);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Recipe.deleteMany({});
        await Ingredient.deleteMany({});
        await MealPlan.deleteMany({});
        console.log('Cleared existing data');

        // Create users
        const createdUsers = [];
        for (const userData of users) {
            // Ne titkosítsuk a jelszót, a User modell pre-save hook-ja fogja titkosítani
            const user = new User(userData);
            await user.save();
            createdUsers.push(user);
        }
        console.log(`Created ${createdUsers.length} users`);

        // Create ingredients
        const createdIngredients = [];
        for (const ingredientData of ingredients) {
            const ingredient = new Ingredient(ingredientData);
            await ingredient.save();
            createdIngredients.push(ingredient);
        }
        console.log(`Created ${createdIngredients.length} ingredients`);

        // Create recipes
        const recipes = [
            {
                title: 'Lemon Garlic Chicken with Broccoli',
                description: 'A healthy and flavorful dish with tender chicken, fresh broccoli, and a zesty lemon garlic sauce.',
                author: createdUsers[0]._id,
                prepTime: 15,
                cookTime: 25,
                servings: 4,
                difficulty: 'medium',
                ingredientQuantities: [
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Chicken Breast')._id,
                        quantity: 500,
                        unit: 'g'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Broccoli')._id,
                        quantity: 300,
                        unit: 'g'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Olive Oil')._id,
                        quantity: 2,
                        unit: 'tbsp'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Garlic')._id,
                        quantity: 3,
                        unit: 'clove'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Lemon')._id,
                        quantity: 1,
                        unit: 'piece'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Salt')._id,
                        quantity: 1,
                        unit: 'tsp'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Black Pepper')._id,
                        quantity: 0.5,
                        unit: 'tsp'
                    }
                ],
                steps: [
                    'Cut the chicken breast into bite-sized pieces.',
                    'Mince the garlic and cut the broccoli into florets.',
                    'Heat olive oil in a large skillet over medium-high heat.',
                    'Add the chicken and cook until golden brown, about 5-7 minutes.',
                    'Add the garlic and cook for 30 seconds until fragrant.',
                    'Add the broccoli and cook for 5 minutes until tender-crisp.',
                    'Squeeze the lemon juice over the chicken and broccoli.',
                    'Season with salt and pepper to taste.',
                    'Serve hot with rice or your favorite side dish.'
                ],
                categories: ['main dish', 'high-protein'],
                tags: ['chicken', 'healthy', 'quick'],
                images: [
                    'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMGFuZCUyMGJyb2Njb2xpfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
                ]
            },
            {
                title: 'Quinoa and Tofu Bowl',
                description: 'A nutritious vegan bowl with quinoa, tofu, and vegetables.',
                author: createdUsers[2]._id,
                prepTime: 10,
                cookTime: 20,
                servings: 2,
                difficulty: 'easy',
                ingredientQuantities: [
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Quinoa')._id,
                        quantity: 150,
                        unit: 'g'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Tofu')._id,
                        quantity: 200,
                        unit: 'g'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Broccoli')._id,
                        quantity: 150,
                        unit: 'g'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Olive Oil')._id,
                        quantity: 1,
                        unit: 'tbsp'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Garlic')._id,
                        quantity: 2,
                        unit: 'clove'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Lemon')._id,
                        quantity: 0.5,
                        unit: 'piece'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Salt')._id,
                        quantity: 0.5,
                        unit: 'tsp'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Black Pepper')._id,
                        quantity: 0.25,
                        unit: 'tsp'
                    }
                ],
                steps: [
                    'Rinse the quinoa under cold water.',
                    'Cook the quinoa according to package instructions.',
                    'Cut the tofu into cubes and the broccoli into florets.',
                    'Heat olive oil in a pan over medium heat.',
                    'Add the tofu and cook until golden brown, about 5 minutes.',
                    'Add the garlic and cook for 30 seconds until fragrant.',
                    'Add the broccoli and cook for 5 minutes until tender-crisp.',
                    'Squeeze the lemon juice over the tofu and broccoli.',
                    'Season with salt and pepper to taste.',
                    'Serve the tofu and broccoli over the cooked quinoa.'
                ],
                categories: ['main dish', 'vegan'],
                tags: ['tofu', 'quinoa', 'healthy', 'vegan'],
                images: [
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dmVnYW4lMjBib3dsfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
                ]
            }
        ];

        const createdRecipes = [];
        for (const recipeData of recipes) {
            const recipe = new Recipe(recipeData);
            await recipe.save();
            createdRecipes.push(recipe);
        }
        console.log(`Created ${createdRecipes.length} recipes`);

        // Create meal plans
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const mealPlans = [
            {
                name: 'Weekly Meal Plan',
                user: createdUsers[0]._id,
                startDate: today,
                endDate: nextWeek,
                meals: [
                    {
                        day: 1,
                        mealType: 'dinner',
                        recipe: createdRecipes[0]._id,
                        servings: 2
                    },
                    {
                        day: 3,
                        mealType: 'dinner',
                        recipe: createdRecipes[1]._id,
                        servings: 2
                    },
                    {
                        day: 5,
                        mealType: 'dinner',
                        recipe: createdRecipes[0]._id,
                        servings: 2
                    }
                ],
                notes: 'Simple meal plan for the week',
                isPublic: true
            }
        ];

        const createdMealPlans = [];
        for (const mealPlanData of mealPlans) {
            const mealPlan = new MealPlan(mealPlanData);
            await mealPlan.save();
            createdMealPlans.push(mealPlan);
        }
        console.log(`Created ${createdMealPlans.length} meal plans`);

        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

// Run the seed function
seedDatabase();
