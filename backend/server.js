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
        strict: true,
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
