const jwt = require('jsonwebtoken');

// Hosszabb lejárati idő (7 nap)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRATION = '7d'; // 7 nap

const authMiddleware = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify token
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        // Add user data to request
        req.user = {
            ...decoded,
            role: decoded.role || 'user' // Alapértelmezett érték, ha nincs role
        };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        return res.status(401).json({ message: 'Invalid token', error: error.message });
    }
};

// Admin jogosultság ellenőrzése
const adminMiddleware = (req, res, next) => {
    // Ellenőrizzük, hogy a felhasználó be van-e jelentkezve és admin-e
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Nincs jogosultságod ehhez a művelethez' });
    }
    next();
};

module.exports = {
    authMiddleware,
    adminMiddleware,
    JWT_SECRET,
    JWT_EXPIRATION
};
