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
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        return res.status(401).json({ message: 'Invalid token', error: error.message });
    }
};

module.exports = {
    authMiddleware,
    JWT_SECRET,
    JWT_EXPIRATION
};
