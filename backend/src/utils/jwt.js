const jwt = require('jsonwebtoken');

const generateToken = (id, role, email, company_id) => {
  const payload = { id, role, email };
  if (company_id) payload.company_id = company_id;

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
