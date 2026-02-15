
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const initDatabase = require('./config/dbInit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes (mounted early so API endpoints exist even if DB init fails)
const authRoutes = require('./routes/authRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const companyRoutes = require('./routes/companyRoutes');
const agentRoutes = require('./routes/agentRoutes');
const phoneRoutes = require('./routes/phoneRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/phone', phoneRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Beacon Backend API is running');
});

// Start server first, then attempt DB initialization (non-blocking)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize DB Tables (best-effort)
initDatabase().catch((err) => {
  console.error('DB init failed:', err?.message || err);
});
