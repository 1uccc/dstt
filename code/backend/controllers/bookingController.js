const Booking = require('../models/Booking');
const Field = require('../models/Field');

// [Tạo Booking mới] (Khách hàng)
exports.createBooking = async (req, res) => {
  try {
    const { customerName, phone, fieldId, date, time, amount, paymentMethod, reference } = req.body;
    
    const field = await Field.findById(fieldId);
    if (!field) return res.status(404).json({ message: 'Sân không tồn tại' });

    // Tạo mã đơn ngẫu nhiên SPB-XXXX
    const bookingCode = `SPB-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = new Booking({
      bookingCode, customerName, phone, 
      fieldId: field._id, fieldName: field.name,
      date, time, amount, paymentMethod, reference,
      userId: req.user ? req.user.userId : null
    });

    await newBooking.save();

    // Tăng số lượng booking cho sân
    field.bookings += 1;
    await field.save();

    res.status(201).json({ message: 'Đặt sân thành công', booking: newBooking });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi đặt sân', error: error.message });
  }
};

// [Lấy danh sách Booking] (Cho Admin/Owner)
exports.getAllBookings = async (req, res) => {
  try {
    let filter = {};
    // Nếu là chủ sân, chỉ lấy đơn của sân họ
    if (req.user && req.user.role === 'owner') {
      const ownerFields = await Field.find({ owner: req.user.userId }).select('_id');
      const ownerFieldIds = ownerFields.map(f => f._id);
      filter = { fieldId: { $in: ownerFieldIds } };
    }

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [Cập nhật trạng thái Booking]
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;

    const updated = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy đơn.' });

    res.json({ message: 'Cập nhật trạng thái thành công', booking: updated });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật', error: error.message });
  }
};
