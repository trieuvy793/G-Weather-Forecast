const jwt = require('jsonwebtoken');

const generateToken = (browser) => {
  const user = { browser };
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1d' });
};

module.exports = { generateToken };
