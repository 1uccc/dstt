const { auth, db } = require('../config/firebase');

exports.verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Không có token' });

  try {
    const decodedToken = await auth.verifyIdToken(token);
    // Lấy thông tin user từ collection "users" trên Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    req.user = { uid: decodedToken.uid, ...userDoc.data() };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token không hợp lệ' });
  }
};

// Middleware kiểm tra phân quyền (SCRUM-23)
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập.' });
    }
    next();
  };
};
