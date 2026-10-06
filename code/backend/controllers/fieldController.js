const { db } = require('../config/firebase');

// [Lấy danh sách sân]
exports.getAllFields = async (req, res) => {
  try {
    const snapshot = await db.collection('fields').get();
    const fields = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(fields);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách sân', error: error.message });
  }
};

// [Lấy chi tiết sân]
exports.getFieldById = async (req, res) => {
  try {
    const doc = await db.collection('fields').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: 'Không tìm thấy sân' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [Thêm sân mới] (Dành cho admin hoặc owner)
exports.createField = async (req, res) => {
  try {
    const { name, location, address, sport, price, image, images, mapUrl, ownerName, amenities, schedule, active, description } = req.body;
    const newField = {
      name: name || '',
      location: location || '',
      address: address || location || '',
      sport: sport || 'Bóng đá',
      price: price || 0,
      image: image || '',
      images: images || [],
      mapUrl: mapUrl || '',
      description: description || '',
      ownerName: ownerName || '',
      amenities: amenities || [],
      schedule: schedule || null,
      active: active !== undefined ? active : true,
      owner: req.user.uid,
      bookings: 0,
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection('fields').add(newField);
    res.status(201).json({ message: 'Thêm sân thành công', field: { id: docRef.id, ...newField } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo sân', error: error.message });
  }
};

// [Cập nhật sân]
exports.updateField = async (req, res) => {
  try {
    const fieldId = req.params.id;
    await db.collection('fields').doc(fieldId).update(req.body);
    res.json({ message: 'Cập nhật thành công', field: { id: fieldId, ...req.body } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật', error: error.message });
  }
};

// [Lấy danh sách các khung giờ đã đặt của một sân] (Public)
exports.getFieldBookings = async (req, res) => {
  try {
    const fieldId = req.params.id;
    // Lấy các booking của sân này
    // Ở đây có thể giới hạn ngày tương lai, nhưng để đơn giản ta lấy những booking ko bị huỷ
    const snapshot = await db.collection('bookings')
      .where('fieldId', '==', fieldId)
      .where('status', 'in', ['pending', 'confirmed', 'paid'])
      .get();
      
    const bookings = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        date: data.date,
        time: data.time
      };
    });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy lịch đặt', error: error.message });
  }
};

// [Lấy danh sách đánh giá của sân]
exports.getFieldReviews = async (req, res) => {
  try {
    const fieldId = req.params.id;
    const snapshot = await db.collection('reviews')
      .where('fieldId', '==', fieldId)
      .get();
      
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sắp xếp giảm dần theo ngày tạo (do firestore where + orderby cần composite index nên sort ở đây)
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy đánh giá', error: error.message });
  }
};

// [Thêm đánh giá]
exports.addReview = async (req, res) => {
  try {
    const fieldId = req.params.id;
    const { rating, comment, customerName } = req.body;
    
    const newReview = {
      fieldId,
      userId: req.user.uid,
      customerName: customerName || 'Khách hàng',
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString()
    };
    
    const reviewRef = await db.collection('reviews').add(newReview);
    
    // Tính lại rating trung bình cho sân
    const snapshot = await db.collection('reviews').where('fieldId', '==', fieldId).get();
    const reviews = snapshot.docs.map(d => d.data());
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await db.collection('fields').doc(fieldId).update({
      rating: avgRating,
      reviews: reviews.length
    });
    
    res.status(201).json({ message: 'Đánh giá thành công', review: { id: reviewRef.id, ...newReview } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm đánh giá', error: error.message });
  }
};

// [Kiểm tra user có quyền đánh giá sân không]
exports.canReview = async (req, res) => {
  try {
    const fieldId = req.params.id;
    const userId = req.user.uid;

    const snapshot = await db.collection('bookings')
      .where('fieldId', '==', fieldId)
      .where('userId', '==', userId)
      .where('status', 'in', ['paid', 'confirmed'])
      .get();

    if (snapshot.empty) {
      return res.json({ canReview: false });
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    let hasPassedBooking = false;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const bDate = data.date;
      
      if (bDate < todayStr) {
        hasPassedBooking = true;
        break;
      } else if (bDate === todayStr) {
        const times = data.time.split(',').map(t => t.trim());
        const lastTime = times[times.length - 1]; // e.g. '17:00 - 18:30'
        if (lastTime && lastTime.includes('-')) {
          const endTimeStr = lastTime.split('-')[1].trim(); // '18:30'
          const [hours, mins] = endTimeStr.split(':').map(Number);
          const endMinutes = hours * 60 + mins;

          if (currentMinutes >= endMinutes) {
            hasPassedBooking = true;
            break;
          }
        }
      }
    }

    res.json({ canReview: hasPassedBooking });
  } catch (error) {
    res.status(500).json({ canReview: false, error: error.message });
  }
};

// [Xóa sân]
exports.deleteField = async (req, res) => {
  try {
    await db.collection('fields').doc(req.params.id).delete();
    res.json({ message: 'Đã xóa sân' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa', error: error.message });
  }
};
