require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const phoneRoutes = require('./routes/phoneRoutes');
const reportRoutes = require('./routes/reportRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1); // needed for correct req.ip behind a reverse proxy

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'safelink-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/phones', phoneRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`SafeLink API running on port ${PORT}`);
});

module.exports = app;
