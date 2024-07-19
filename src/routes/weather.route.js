const express = require('express');
const { getLocations } = require('../controllers/weather.controller');
const router = express.Router();

router.get('/search', getLocations);

module.exports = router;
