const cron = require('node-cron');
const { db } = require('../config/firebase');

function startCronJobs() {
  // Chạy mỗi 10 phút
  cron.schedule('*/10 * * * *', async () => {
    try {
      const now = new Date();
      // Hủy đơn pending quá 30 phút
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();

      const snapshot = await db.collection('bookings')
        .where('status', '==', 'pending')
        .get();

      if (snapshot.empty) {
        return;
      }

      // Lọc các đơn đã quá 30 phút trong bộ nhớ để không yêu cầu Composite Index trên Firestore
      const expiredDocs = snapshot.docs.filter(doc => {
        const data = doc.data();
        return data.createdAt && data.createdAt < thirtyMinutesAgo;
      });

      if (expiredDocs.length === 0) {
        return;
      }

      const batch = db.batch();
      expiredDocs.forEach(doc => {
        batch.update(doc.ref, { 
          status: 'cancelled',
          updatedAt: now.toISOString(),
          cancelReason: 'Hệ thống tự động hủy do quá hạn xác nhận thanh toán'
        });
      });

      await batch.commit();
      console.log(`[CRON] Đã tự động hủy ${expiredDocs.length} đơn đặt sân quá hạn.`);
    } catch (error) {
      console.error('[CRON] Lỗi khi hủy đơn tự động:', error);
    }
  });
  
  console.log('Cron jobs đã được khởi động.');
}

module.exports = { startCronJobs };
