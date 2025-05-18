const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const {
    authRoutes,
    recipeRoutes,
    ingredientRoutes,
    mealPlanRoutes,
    adminRoutes
} = require('./routes');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/meandb';

// Kapcsolódási string ellenőrzése (jelszó elrejtésével)
console.log('MongoDB URI:', mongoURI.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://***:***@'));

// MongoDB Atlas ajánlott kapcsolódási opciók a hivatalos példa alapján
const mongooseOptions = {
    serverApi: {
        version: '1', // ServerApiVersion.v1 megfelelője
        strict: false, // Changed from true to false to allow commands not in API Version 1
        deprecationErrors: true,
    },
    // Adatbázis név explicit megadása
    dbName: 'meandb',
    // Időtúllépési beállítások
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000
};

// Kapcsolódás az adatbázishoz
mongoose.connect(mongoURI, mongooseOptions)
    .then(() => {
        console.log('MongoDB Connected');
        // Ping küldése a sikeres kapcsolat ellenőrzéséhez
        return mongoose.connection.db.admin().command({ ping: 1 });
    })
    .then(() => console.log("Pinged your deployment. You successfully connected to MongoDB!"))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/mealplans', mealPlanRoutes);
app.use('/api/admin', adminRoutes);

// Kategóriák lekérdezése külön útvonalon
app.get('/api/recipe-categories', async (req, res) => {
    try {
        const { Recipe } = require('./models/index');

        // Using aggregation pipeline instead of distinct
        const result = await Recipe.aggregate([
            // Unwind the categories array to get individual categories
            { $unwind: "$categories" },
            // Group by category to get unique values
            { $group: { _id: "$categories" } },
            // Sort alphabetically
            { $sort: { _id: 1 } }
        ]);

        // Extract category names from the result
        const categories = result.map(item => item._id);

        console.log('Categories fetched:', categories);
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});

// Test Route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

// Serve static files from the Angular app in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
