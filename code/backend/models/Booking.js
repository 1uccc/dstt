const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingCode: { type: String, required: true, unique: true }, // Mã đơn dạng SPB-XXXX
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  fieldName: { type: String, required: true }, // Tên sân lúc đặt (hoặc refer đến Field ID)
  fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Tuỳ chọn nếu khách vãng lai
  date: { type: String, required: true }, // Ngày đặt dạng DD/MM/YYYY
  time: { type: String, required: true }, // Khung giờ
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true, default: 'Chuyển khoản' }, // Phương thức thanh toán (vd: ZaloPay, MoMo, VNPay, Chuyển khoản)
  reference: { type: String }, // Mã giao dịch (vd: SPB20260925)
  status: { 
    type: String, 
    enum: ['paid', 'pending', 'cancelled', 'completed'], 
    default: 'pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
