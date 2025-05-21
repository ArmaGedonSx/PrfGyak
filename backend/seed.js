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
        name: 'Csirkemell',
        category: 'protein',
        nutritionalInfo: {
            calories: 165,
            protein: 31,
            carbs: 0,
            fat: 3.6,
            fiber: 0,
            sugar: 0
        },
        commonUnits: ['g', 'dkg', 'db'],
        image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Y2hpY2tlbiUyMGJyZWFzdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
        allergens: ['none'],
        description: 'Sovány, csont nélküli csirkemell hús'
    },
    {
        name: 'Rizs',
        category: 'grains',
        nutritionalInfo: {
            calories: 130,
            protein: 2.7,
            carbs: 28,
            fat: 0.3,
            fiber: 0.4,
            sugar: 0.1
        },
        commonUnits: ['g', 'csésze'],
        image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmljZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
        allergens: ['none'],
        description: 'Fehér, hosszú szemű rizs'
    },
    {
        name: 'Brokkoli',
        category: 'vegetables',
        nutritionalInfo: {
            calories: 34,
            protein: 2.8,
            carbs: 6.6,
            fat: 0.4,
            fiber: 2.6,
            sugar: 1.7
        },
        commonUnits: ['g', 'csésze', 'db'],
        image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YnJvY2NvbGl8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
        allergens: ['none'],
        description: 'Friss zöld brokkoli rózsák'
    },
    {
        name: 'Olívaolaj',
        category: 'oils_fats',
        nutritionalInfo: {
            calories: 884,
            protein: 0,
            carbs: 0,
            fat: 100,
            fiber: 0,
            sugar: 0
        },
        commonUnits: ['ml', 'evőkanál', 'teáskanál'],
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8b2xpdmUlMjBvaWx8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
        allergens: ['none'],
        description: 'Extra szűz olívaolaj'
    },
    {
        name: 'Fokhagyma',
        category: 'herbs_spices',
        nutritionalInfo: {
            calories: 149,
            protein: 6.4,
            carbs: 33,
            fat: 0.5,
            fiber: 2.1,
            sugar: 1
        },
        commonUnits: ['g', 'gerezd'],
        image: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Z2FybGljfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
        allergens: ['none'],
        description: 'Friss fokhagyma gerezdek'
    },
    {
        name: 'Citrom',
        category: 'fruits',
        nutritionalInfo: {
            calories: 29,
            protein: 1.1,
            carbs: 9.3,
            fat: 0.3,
            fiber: 2.8,
            sugar: 2.5
        },
        commonUnits: ['g', 'db', 'evőkanál'],
        image: 'https://images.unsplash.com/photo-1582476473562-b25216f94c5e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bGVtb258ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
        allergens: ['none'],
        description: 'Friss sárga citrom'
    },
    {
        name: 'Só',
        category: 'herbs_spices',
        nutritionalInfo: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0
        },
        commonUnits: ['g', 'teáskanál', 'csipet'],
        image: 'https://images.unsplash.com/photo-1518110925495-b37e912bdf5e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8c2FsdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
        allergens: ['none'],
        description: 'Asztali só'
    },
    {
        name: 'Fekete bors',
        category: 'herbs_spices',
        nutritionalInfo: {
            calories: 251,
            protein: 10.4,
            carbs: 63.9,
            fat: 3.3,
            fiber: 25.3,
            sugar: 0.6
        },
        commonUnits: ['g', 'teáskanál', 'csipet'],
        image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YmxhY2slMjBwZXBwZXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
        allergens: ['none'],
        description: 'Őrölt fekete bors'
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
        commonUnits: ['g', 'tömb'],
        image: 'https://images.unsplash.com/photo-1584321094050-6f5e8006a95d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dG9mdXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
        allergens: ['soy'],
        description: 'Kemény tofu'
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
        commonUnits: ['g', 'csésze'],
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cXVpbm9hfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
        allergens: ['none'],
        description: 'Fehér quinoa magok'
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
                title: 'Citromos fokhagymás csirke brokkolival',
                description: 'Egy egészséges és ízletes étel omlós csirkével, friss brokkolival és pikáns citromos fokhagymás szósszal.',
                author: createdUsers[0]._id,
                prepTime: 15,
                cookTime: 25,
                servings: 4,
                difficulty: 'medium',
                ingredientQuantities: [
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Csirkemell')._id,
                        quantity: 500,
                        unit: 'g'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Brokkoli')._id,
                        quantity: 300,
                        unit: 'g'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Olívaolaj')._id,
                        quantity: 2,
                        unit: 'evőkanál'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Fokhagyma')._id,
                        quantity: 3,
                        unit: 'gerezd'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Citrom')._id,
                        quantity: 1,
                        unit: 'db'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Só')._id,
                        quantity: 1,
                        unit: 'teáskanál'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Fekete bors')._id,
                        quantity: 0.5,
                        unit: 'teáskanál'
                    }
                ],
                steps: [
                    'Vágja a csirkemellet falat méretű darabokra.',
                    'Aprítsa fel a fokhagymát és vágja a brokkolit rózsákra.',
                    'Melegítsen olívaolajat egy nagy serpenyőben közepes-magas hőfokon.',
                    'Adja hozzá a csirkét és süsse aranybarnára, körülbelül 5-7 percig.',
                    'Adja hozzá a fokhagymát és süsse 30 másodpercig, amíg illatos nem lesz.',
                    'Adja hozzá a brokkolit és süsse 5 percig, amíg ropogós-puha nem lesz.',
                    'Facsarja a citrom levét a csirkére és a brokkolira.',
                    'Ízesítse sóval és borssal ízlés szerint.',
                    'Tálalja melegen rizzsel vagy kedvenc köretével.'
                ],
                categories: ['főétel', 'magas fehérjetartalmú'],
                tags: ['csirke', 'egészséges', 'gyors'],
                images: [
                    'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hpY2tlbiUyMGFuZCUyMGJyb2Njb2xpfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
                ]
            },
            {
                title: 'Quinoa és tofu tál',
                description: 'Egy tápláló vegán tál quinoával, tofuval és zöldségekkel.',
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
                        ingredientId: createdIngredients.find(i => i.name === 'Brokkoli')._id,
                        quantity: 150,
                        unit: 'g'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Olívaolaj')._id,
                        quantity: 1,
                        unit: 'evőkanál'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Fokhagyma')._id,
                        quantity: 2,
                        unit: 'gerezd'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Citrom')._id,
                        quantity: 0.5,
                        unit: 'db'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Só')._id,
                        quantity: 0.5,
                        unit: 'teáskanál'
                    },
                    {
                        ingredientId: createdIngredients.find(i => i.name === 'Fekete bors')._id,
                        quantity: 0.25,
                        unit: 'teáskanál'
                    }
                ],
                steps: [
                    'Öblítse le a quinoát hideg vízzel.',
                    'Főzze meg a quinoát a csomagoláson található utasítások szerint.',
                    'Vágja kockákra a tofut és rózsákra a brokkolit.',
                    'Melegítsen olívaolajat egy serpenyőben közepes hőfokon.',
                    'Adja hozzá a tofut és süsse aranybarnára, körülbelül 5 percig.',
                    'Adja hozzá a fokhagymát és süsse 30 másodpercig, amíg illatos nem lesz.',
                    'Adja hozzá a brokkolit és süsse 5 percig, amíg ropogós-puha nem lesz.',
                    'Facsarja a citrom levét a tofura és a brokkolira.',
                    'Ízesítse sóval és borssal ízlés szerint.',
                    'Tálalja a tofut és a brokkolit a főtt quinoa tetején.'
                ],
                categories: ['főétel', 'vegán'],
                tags: ['tofu', 'quinoa', 'egészséges', 'vegán'],
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
                name: 'Heti étkezési terv',
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
                notes: 'Egyszerű étkezési terv a hétre',
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
