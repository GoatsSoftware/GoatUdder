const jwt = require('jsonwebtoken');

// JWT Authentication middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Token requis'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token invalide'
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'goatudder-secret-key';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token expiré ou invalide'
    });
  }
}

// JWT Token verification endpoint handler
function verifyTokenHandler(req, res) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Token requis'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token invalide'
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'goatudder-secret-key';
    const decoded = jwt.verify(token, jwtSecret);
    res.json({
      success: true,
      data: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token expiré ou invalide'
    });
  }
}

module.exports = { authenticate, verifyTokenHandler };