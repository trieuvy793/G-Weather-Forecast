// index.js
const express = require('express');
const weatherRoutes = require('./routes/weather.route');
const memberRoutes = require('./routes/member.route');
const path = require('path');

const dotenv = require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index'); 
});

app.use('/api/weather', weatherRoutes);
app.use('/api/member', memberRoutes);

module.exports = app;  // Ensure this line is present
