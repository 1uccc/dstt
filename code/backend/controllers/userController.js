const { auth, db } = require('../config/firebase');

// Xem thông tin cá nhân (SCRUM-22)
exports.getProfile = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }
    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};

// Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, businessName, businessAddress } = req.body;
    const userRef = db.collection('users').doc(req.user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    const updates = {};
    if (name !== undefined) updates.fullName = name;
    if (phone !== undefined) updates.phone = phone;
    
    const currentData = userDoc.data();
    if (currentData.role === 'owner') {
      updates.businessInfo = {
        ...currentData.businessInfo,
        ...(businessName !== undefined && { businessName }),
        ...(businessAddress !== undefined && { businessAddress }),
      };
    }

    await userRef.update(updates);
    res.json({ message: 'Cập nhật thông tin thành công.', updates });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};

// Cập nhật mật khẩu (SCRUM-22)
exports.updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    // Firebase auth cho phép cập nhật mật khẩu dễ dàng qua Admin SDK
    await auth.updateUser(req.user.uid, {
      password: newPassword
    });

    res.json({ message: 'Cập nhật mật khẩu thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};

// [ADMIN] Xem danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
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

    const userRef = db.collection('users').doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    await userRef.update({ status });
    res.json({ message: 'Cập nhật trạng thái thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server.', error: error.message });
  }
};
