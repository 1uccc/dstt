const { db } = require('../config/firebase');

// Frontend sẽ dùng Firebase Client SDK để đăng ký/đăng nhập.
// Backend chỉ cung cấp API để đồng bộ user vào Firestore lần đầu tiên.

exports.syncUser = async (req, res) => {
  try {
    // req.user được lấy từ verifyToken middleware
    const uid = req.user.uid;
    const { email, fullName, role, phone, businessInfo, fieldInfo } = req.body;

    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      await userRef.set({
        email: email || req.user.email,
        fullName: fullName || 'Người dùng mới',
        phone: phone || '',
        role: role || 'customer',
        status: (role === 'owner') ? 'pending' : 'active',
        businessInfo: businessInfo || null,
        createdAt: new Date().toISOString()
      });

      if (fieldInfo && role === 'owner') {
        await db.collection('fields').add({
          name: fieldInfo.venueName || '',
          location: fieldInfo.venueAddress || '',
          address: fieldInfo.venueAddress || '',
          sport: fieldInfo.sport || 'Bóng đá',
          price: parseInt(fieldInfo.regularPrice) || 0,
          mapUrl: fieldInfo.mapUrl || '',
          amenities: fieldInfo.amenities || [],
          ownerName: businessInfo?.businessName || fullName || '',
          owner: uid,
          active: true,
          bookings: 0,
          image: '',
          schedule: {
            slotMinutes: parseInt(fieldInfo.slotMinutes) || 90,
            regularPrice: parseInt(fieldInfo.regularPrice) || 0,
            peakPrice: parseInt(fieldInfo.peakPrice) || 0,
            peakStart: fieldInfo.peakStart || '17:00',
            days: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'].map(day => ({
              enabled: (fieldInfo.operatingDays || []).includes(day === 'Chủ Nhật' ? 'CN' : day.replace('Thứ ', 'T').replace('Hai', '2').replace('Ba', '3').replace('Tư', '4').replace('Năm', '5').replace('Sáu', '6').replace('Bảy', '7')),
              open: fieldInfo.openTime || '06:00',
              close: fieldInfo.closeTime || '22:00'
            })),
            blockedDates: []
          },
          createdAt: new Date().toISOString()
        });
      }

      return res.status(201).json({ message: 'Đã tạo thông tin user trong Firestore' });
    }

    res.json({ message: 'User đã tồn tại' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};

// Các hàm cũ bỏ đi để tránh nhầm lẫn
exports.register = (req, res) => res.status(400).json({ message: 'Vui lòng đăng ký qua Firebase Client SDK (Frontend)' });
exports.login = (req, res) => res.status(400).json({ message: 'Vui lòng đăng nhập qua Firebase Client SDK (Frontend)' });
