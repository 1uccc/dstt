/**
 * [REPOSITORY PATTERN] - UserRepository
 * Tách biệt tầng truy xuất dữ liệu Người dùng & Tài khoản (Users)
 */

const { auth, db } = require('../config/firebase');

class UserRepository {
  /**
   * Lấy thông tin user theo ID
   */
  async getById(uid) {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Đồng bộ hoặc tạo mới thông tin user trong Firestore khi đăng ký / đăng nhập
   */
  async syncUser(uid, userData) {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      const newUser = {
        email: userData.email || '',
        fullName: userData.fullName || 'Người dùng mới',
        phone: userData.phone || '',
        role: userData.role || 'customer',
        status: userData.role === 'owner' ? 'pending' : 'active',
        businessInfo: userData.businessInfo || null,
        createdAt: new Date().toISOString(),
      };
      await userRef.set(newUser);
      return { created: true, user: { id: uid, ...newUser } };
    }

    return { created: false, user: { id: uid, ...doc.data() } };
  }

  /**
   * Cập nhật thông tin profile cá nhân
   */
  async updateProfile(uid, profileData) {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      throw new Error('USER_NOT_FOUND');
    }

    const updates = {};
    if (profileData.name !== undefined) updates.fullName = profileData.name;
    if (profileData.phone !== undefined) updates.phone = profileData.phone;

    const currentData = doc.data();
    if (currentData.role === 'owner') {
      updates.businessInfo = {
        ...currentData.businessInfo,
        ...(profileData.businessName !== undefined && { businessName: profileData.businessName }),
        ...(profileData.businessAddress !== undefined && { businessAddress: profileData.businessAddress }),
      };
    }

    await userRef.update(updates);
    return updates;
  }

  /**
   * Đổi mật khẩu qua Firebase Auth Admin SDK
   */
  async updatePassword(uid, newPassword) {
    await auth.updateUser(uid, { password: newPassword });
    return true;
  }

  /**
   * Lấy danh sách tất cả users (Admin)
   */
  async getAll() {
    const snapshot = await db.collection('users').get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Cập nhật trạng thái user (active, pending, locked)
   */
  async updateStatus(uid, status) {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    if (!doc.exists) throw new Error('USER_NOT_FOUND');

    await userRef.update({ status });
    return true;
  }

  /**
   * Cập nhật thông tin user bởi Admin
   */
  async updateInfo(uid, updates) {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    if (!doc.exists) throw new Error('USER_NOT_FOUND');

    const cleanUpdates = {};
    if (updates.fullName !== undefined) cleanUpdates.fullName = updates.fullName;
    if (updates.phone !== undefined) cleanUpdates.phone = updates.phone;
    if (updates.role !== undefined) cleanUpdates.role = updates.role;

    await userRef.update(cleanUpdates);
    return cleanUpdates;
  }
}

module.exports = new UserRepository();
