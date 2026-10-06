const { db, auth } = require('./config/firebase');

async function setAdminRole() {
  const email = 'admin@gmail.com';
  try {
    // 1. Tìm UID của người dùng dựa trên email trong Firebase Auth
    const userRecord = await auth.getUserByEmail(email);
    const uid = userRecord.uid;

    // 2. Cập nhật role thành 'admin' vào Firestore
    await db.collection('users').doc(uid).set({
      role: 'admin'
    }, { merge: true });

    console.log(`\n✅ THÀNH CÔNG: Đã phân quyền 'admin' cho tài khoản ${email} (UID: ${uid})\n`);
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`\n❌ LỖI: Chưa có tài khoản nào đăng ký với email '${email}'. Bạn cần tạo/đăng nhập tài khoản này trên giao diện trước khi phân quyền nhé!\n`);
    } else {
      console.error('\n❌ Đã xảy ra lỗi:', error.message, '\n');
    }
    process.exit(1);
  }
}

setAdminRole();
