const { db } = require('../config/firebase');

exports.createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ Tên, Email và Nội dung.' });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Email không hợp lệ.' });
    }
    
    const data = {
      name,
      email,
      subject: subject || 'Liên hệ mới',
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('contacts').add(data);
    res.status(201).json({ message: 'Đã gửi liên hệ thành công.', contact: { id: docRef.id, ...data } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const snapshot = await db.collection('contacts').orderBy('createdAt', 'desc').get();
    const contacts = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const contactRef = db.collection('contacts').doc(id);
    await contactRef.update({ status });
    
    res.json({ message: 'Cập nhật thành công', status });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
