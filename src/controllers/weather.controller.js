const axios = require('axios');

async function getUserIP() {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    throw new Error('Unable to fetch user IP');
  }
}

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

module.exports = { getLocations };