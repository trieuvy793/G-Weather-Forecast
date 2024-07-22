const axios = require('axios');
const { generateToken } = require('../utils/jwt.utils');
const weatherData = {};

const getUserIP = async () => {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    throw new Error('Unable to fetch user IP');
  }
};

const generateTokenController = (req, res) => {
  const browser = req.headers['user-agent'];
  const token = generateToken(browser);
  res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
  res.json({ token });
};

const getLocations = async (req, res) => {
  let { location } = req.query;

  try {
    if (!location) {
      location = await getUserIP();
    }

    const response = await axios.get('http://api.weatherapi.com/v1/search.json', {
      params: { key: process.env.WEATHER_API_KEY, q: location }
    });
    
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      res.status(status).json(data);
    } else {
      res.status(500).json({ error: 'Error fetching weather data' });
    }
  }
};

const getCurrentWeather = async (req, res) => {
  const browser = req.user.browser; 
  let { location } = req.query;

  try {

    if (!location) {
      location = await getUserIP();
    }

    const response = await axios.get('http://api.weatherapi.com/v1/current.json', {
      params: {
        key: process.env.WEATHER_API_KEY, 
        q: location
      }
    });

    if (!weatherData[browser]) {
      weatherData[browser] = {};
    }

    weatherData[browser][location] = {
      timestamp: new Date(), 
      data: response.data 
    };

    res.json(response.data);
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      res.status(status).json(data);
    } else {
      res.status(500).json({ error: 'Error fetching current weather data' });
    }
  }
};

const getForecasts = async (req, res) => {
  let { location, days } = req.query;
  
  try {
    if (!location) {
      location = await getUserIP();
    }

    const response = await axios.get('http://api.weatherapi.com/v1/forecast.json', {
      params: {
        key: process.env.WEATHER_API_KEY,
        q: location,
        days,
        aqi: 'no',
        alerts: 'no'
      }
    });

    res.json(response.data);
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      res.status(status).json(data);
    } else {
      res.status(500).json({ error: 'Error fetching forecast data' });
    }
  }
};

const getHistory = (req, res) => {
  const browser = req.user.browser;

  if (!weatherData[browser]) {
    return res.json([]);
  }

  const history = Object.keys(weatherData[browser]).map(location => ({
    location,
    data: weatherData[browser][location].data,
  }));

  res.json(history);
};

module.exports = { generateTokenController, getLocations, getCurrentWeather, getForecasts, getHistory };
