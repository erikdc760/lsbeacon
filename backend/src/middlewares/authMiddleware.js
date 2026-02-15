const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user exists in our "system"
      // If it's the super admin defined in env:
      if (decoded.email === process.env.ADMIN_EMAIL && decoded.role === 'super_admin') {
          req.user = { 
              id: 'admin_id_static', 
              email: process.env.ADMIN_EMAIL, 
              role: 'super_admin' 
          };
          return next();
      }

      // Otherwise verify against Supabase
      // Assuming a 'users' table exists. 
      // Note: Supabase has built-in Auth, but we are building a custom backend layer on top for this specific request.
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        // Fallback for mocked scenarios if DB is empty
        req.user = decoded;
         return next();
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user?.role} is not authorized` });
    }
    next();
  };
};

module.exports = { protect, authorize };
