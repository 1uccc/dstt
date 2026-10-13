require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const fieldRoutes = require('./routes/fieldRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const contactRoutes = require('./routes/contactRoutes');
const settingRoutes = require('./routes/settingRoutes');

const app = express();

// Render / Reverse Proxy: Tin tưởng proxy để express-rate-limit đọc đúng IP từ X-Forwarded-For
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:8443',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8443',
    /^http:\/\/localhost:\d+$/,
    'https://datsanthethao-53c04.web.app',
    'https://datsanthethao-53c04.firebaseapp.com'
  ],
  credentials: true
}));
app.use(express.json({ limit: '50kb' }));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Quá nhiều yêu cầu từ IP của bạn, vui lòng thử lại sau.'
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Vượt quá giới hạn gọi API nhạy cảm. Vui lòng thử lại sau.'
});

app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', strictLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contacts', strictLimiter, contactRoutes);
app.use('/api/settings', settingRoutes);

// Khởi động Cron Jobs
const { startCronJobs } = require('./cron/bookingCron');
startCronJobs();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
