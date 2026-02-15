const supabase = require('../config/supabase');
const generateToken = require('../utils/jwt');
const bcrypt = require('bcryptjs');

const authController = {
  login: async (req, res) => {
    const { email, password } = req.body;
    const emailLower = email.toLowerCase();

    // 1. Check Super Admin
    if (emailLower === process.env.ADMIN_EMAIL.toLowerCase()) {
      if (password === process.env.ADMIN_PASSWORD) {
        return res.json({
          id: 'admin_id_static',
          email: emailLower,
          role: 'super_admin',
          token: generateToken('admin_id_static', 'super_admin', emailLower),
        });
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    // 2. Check Database Users
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', emailLower)
        .single();

      if (error || !user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        res.json({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, // 'company_owner', 'agent'
          company_id: user.company_id,
          token: generateToken(user.id, user.role, user.email, user.company_id),
        });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  },
};

module.exports = authController;
