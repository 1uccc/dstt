/**
 * [CONTROLLER LAYER] - authController
 * Đồng bộ người dùng Firebase Auth vào Firestore Database
 * thông qua UserRepository và FieldFactory.
 */

const userRepository = require('../repositories/UserRepository');
const fieldRepository = require('../repositories/FieldRepository');
const FieldFactory = require('../factories/FieldFactory');

exports.syncUser = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { email, fullName, role, phone, businessInfo, fieldInfo } = req.body;

    const result = await userRepository.syncUser(uid, {
      email: email || req.user.email,
      fullName,
      role,
      phone,
      businessInfo,
    });

    // Nếu là chủ sân đăng ký lần đầu kèm thông tin cơ sở sân
    if (result.created && fieldInfo && role === 'owner') {
      const fieldPayload = FieldFactory.createField({
        name: fieldInfo.venueName,
        location: fieldInfo.venueAddress,
        address: fieldInfo.venueAddress,
        sport: fieldInfo.sport || 'Bóng đá',
        price: parseInt(fieldInfo.regularPrice) || 0,
        mapUrl: fieldInfo.mapUrl || '',
        amenities: fieldInfo.amenities || [],
        ownerName: businessInfo?.businessName || fullName || '',
        schedule: {
          slotMinutes: parseInt(fieldInfo.slotMinutes) || 90,
          regularPrice: parseInt(fieldInfo.regularPrice) || 0,
          peakPrice: parseInt(fieldInfo.peakPrice) || 0,
          peakStart: fieldInfo.peakStart || '17:00',
          days: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'].map((day) => ({
            enabled: (fieldInfo.operatingDays || []).includes(
              day === 'Chủ Nhật' ? 'CN' : day.replace('Thứ ', 'T').replace('Hai', '2').replace('Ba', '3').replace('Tư', '4').replace('Năm', '5').replace('Sáu', '6').replace('Bảy', '7')
            ),
            open: fieldInfo.openTime || '06:00',
            close: fieldInfo.closeTime || '22:00',
          })),
          blockedDates: [],
        },
      }, uid);

      await fieldRepository.create(fieldPayload);
    }

    if (result.created) {
      return res.status(201).json({ message: 'Đã tạo thông tin user trong Firestore', user: result.user });
    }

    res.json({ message: 'User đã tồn tại', user: result.user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};

exports.register = (req, res) => res.status(400).json({ message: 'Vui lòng đăng ký qua Firebase Client SDK (Frontend)' });
exports.login = (req, res) => res.status(400).json({ message: 'Vui lòng đăng nhập qua Firebase Client SDK (Frontend)' });
