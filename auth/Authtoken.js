const jwt = require('jsonwebtoken');
const secretKey = require('./../config');
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, secretKey, (err, decodedToken) => {
    if (err) {
      return res.status(403).json({ error: "invalid token" });
    }

    req.userId = decodedToken.userId;
    next();
  });
}

module.exports = authenticateToken;

