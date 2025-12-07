const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const promClient = require('prom-client');

// Load environment variables
dotenv.config();

// Prometheus metrics setup
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
});

const httpRequestTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register]
});

// Import routes
const {
    authRoutes,
    recipeRoutes,
    ingredientRoutes,
    mealPlanRoutes,
    adminRoutes
} = require('./routes');

const app = express();
const port = process.env.PORT || 3000; // Render miatt fontos a process.env.PORT!

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/meandb';

// Kapcsolódási string ellenőrzése (jelszó elrejtésével)
if (mongoURI) {
    console.log('MongoDB URI configured:', mongoURI.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://***:***@'));
}

const mongooseOptions = {
    serverApi: {
        version: '1',
        strict: false,
        deprecationErrors: true,
    },
    dbName: 'meandb',
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000
};

// Kapcsolódás az adatbázishoz
mongoose.connect(mongoURI, mongooseOptions)
    .then(() => {
        console.log('MongoDB Connected');
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

// Kategóriák lekérdezése
app.get('/api/recipe-categories', async (req, res) => {
    try {
        const { Recipe } = require('./models/index');
        const result = await Recipe.aggregate([
            { $unwind: "$categories" },
            { $group: { _id: "$categories" } },
            { $sort: { _id: 1 } }
        ]);
        const categories = result.map(item => item._id);
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});

// ---------------------------------------------------------
// PROMETHEUS METRICS ENDPOINT (FONTOS: API routes után, de frontend előtt!)
// ---------------------------------------------------------
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// ---------------------------------------------------------
// FRONTEND KISZOLGÁLÁSA (MÓDOSÍTVA A DOCKERHEZ)
// ---------------------------------------------------------

// Mindig kiszolgáljuk a static fájlokat, ha léteznek (nem csak productionben)
// A Dockerfile a "./public" mappába másolja az Angular buildet
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to track HTTP requests (frontend előtt!)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
        httpRequestTotal.labels(req.method, req.route?.path || req.path, res.statusCode).inc();
    });
    next();
});

// Minden egyéb kérésre (ami nem API), visszaadjuk az index.html-t
// Ez biztosítja, hogy az Angular Routing működjön
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------------------------------------------------------

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
