const express = require('express');
const { getLocations, getCurrentWeather, getForecasts } = require('../controllers/weather.controller');
const router = express.Router();

router.get('/search', getLocations);
router.get('/current', getCurrentWeather);
router.get('/forecasts', getForecasts);

module.exports = router;
