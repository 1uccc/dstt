/**
 * [CONTROLLER LAYER] - userController
 * Tiếp nhận HTTP Request quản lý thông tin tài khoản người dùng,
 * ủy quyền cho UserRepository (Repository Pattern).
 */

const userRepository = require('../repositories/UserRepository');

// Xem thông tin cá nhân
exports.getProfile = async (req, res) => {
  try {
    const user = await userRepository.getById(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};

// Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
  try {
    const updates = await userRepository.updateProfile(req.user.uid, req.body);
    res.json({ message: 'Cập nhật thông tin thành công.', updates });
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};

// Cập nhật mật khẩu
exports.updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
    }

    await userRepository.updatePassword(req.user.uid, newPassword);
    res.json({ message: 'Cập nhật mật khẩu thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};

// [ADMIN] Xem danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userRepository.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};

// [ADMIN] Cập nhật trạng thái người dùng (Duyệt chủ sân, Khóa tài khoản...)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active', 'pending', 'locked'

    if (!['active', 'pending', 'locked'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }

    await userRepository.updateStatus(id, status);
    res.json({ message: 'Cập nhật trạng thái thành công.' });
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};

// [ADMIN] Cập nhật thông tin người dùng
exports.updateUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = await userRepository.updateInfo(id, req.body);
    res.json({ message: 'Cập nhật thông tin thành công.', updates });
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};
