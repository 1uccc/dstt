const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  sport: { type: String, required: true, enum: ['Bóng đá', 'Tennis', 'Cầu lông', 'Bóng rổ', 'Pickleball'] },
  price: { type: Number, required: true },
  active: { type: Boolean, default: true },
  image: { type: String, default: 'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=80&h=60&fit=crop&auto=format' },
  bookings: { type: Number, default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Liên kết với tài khoản chủ sân
}, { timestamps: true });

module.exports = mongoose.model('Field', fieldSchema);
