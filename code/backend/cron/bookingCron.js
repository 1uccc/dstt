const cron = require('node-cron');
const bookingRepository = require('../repositories/BookingRepository');

function startCronJobs() {
  // Chạy định kỳ mỗi 10 phút
  cron.schedule('*/10 * * * *', async () => {
    try {
      const count = await bookingRepository.cancelExpiredPendingBookings(30);
      if (count > 0) {
        console.log(`[CRON] Đã tự động hủy ${count} đơn đặt sân pending quá hạn 30 phút.`);
      }
    } catch (error) {
      console.error('[CRON] Lỗi khi thực thi cron job hủy đơn quá hạn:', error);
    }
  });

  console.log('Cron jobs đã được khởi động.');
}

module.exports = { startCronJobs };
