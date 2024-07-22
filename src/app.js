const express = require('express');
const weatherRoutes = require('./routes/weather.route');
const memberRoutes = require('./routes/member.route');
const cookieParser = require('cookie-parser');
const path = require('path');

const dotenv = require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index'); 
});

app.use('/api/weather', weatherRoutes);
app.use('/api/member', memberRoutes);
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
