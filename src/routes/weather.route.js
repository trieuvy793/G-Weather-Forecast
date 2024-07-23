const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weather.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

router.post('/generate-token', weatherController.generateTokenController);
router.get('/locations', weatherController.getLocations);
router.get('/current-weather', authenticateToken, weatherController.getCurrentWeather);
router.get('/forecasts', weatherController.getForecasts);
router.get('/history', authenticateToken, weatherController.getHistory);

module.exports = router;