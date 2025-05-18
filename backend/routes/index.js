const authRoutes = require('./auth.routes');
const recipeRoutes = require('./recipe.routes');
const ingredientRoutes = require('./ingredient.routes');
const mealPlanRoutes = require('./mealplan.routes');
const adminRoutes = require('./admin.routes');

module.exports = {
    authRoutes,
    recipeRoutes,
    ingredientRoutes,
    mealPlanRoutes,
    adminRoutes
};
