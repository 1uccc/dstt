/**
 * [FACTORY PATTERN] - FieldFactory
 * Tạo mới đối tượng sân thể thao với các thiết lập cấu hình đặc thù
 * cho từng môn thể thao (Bóng đá, Cầu lông, Tennis, Pickleball, Bóng rổ).
 */

const DEFAULT_DAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

class FieldFactory {
  /**
   * Tạo payload đối tượng Sân thể thao hoàn chỉnh
   * @param {Object} rawData - Dữ liệu thô từ HTTP Request
   * @param {string} ownerUid - UID của chủ sân sở hữu
   * @returns {Object} Dữ liệu sân đã được chuẩn hóa theo quy chuẩn của từng môn
   */
  static createField(rawData = {}, ownerUid) {
    const sport = (rawData.sport || 'Bóng đá').trim();

    // Lấy cấu hình mặc định tương ứng với môn thể thao
    const sportPreset = this.getSportPreset(sport);

    const price = Number(rawData.price) || sportPreset.regularPrice;
    const peakPrice = Number(rawData.schedule?.peakPrice) || sportPreset.peakPrice;
    const slotMinutes = Number(rawData.schedule?.slotMinutes) || sportPreset.slotMinutes;

    const mergedAmenities = Array.from(
      new Set([...(rawData.amenities || []), ...sportPreset.defaultAmenities])
    );

    const schedule = rawData.schedule || {
      slotMinutes,
      regularPrice: price,
      peakPrice,
      peakStart: sportPreset.peakStart,
      days: DEFAULT_DAYS.map((_, index) => ({
        enabled: index !== 0, // Mặc định mở từ T2 - T7
        open: sportPreset.openTime,
        close: sportPreset.closeTime,
      })),
      blockedDates: [],
    };

    return {
      name: rawData.name || `Sân ${sport} mới`,
      location: rawData.location || '',
      address: rawData.address || rawData.location || '',
      sport,
      price,
      image: rawData.image || sportPreset.defaultImage,
      images: rawData.images || (rawData.image ? [rawData.image] : [sportPreset.defaultImage]),
      mapUrl: rawData.mapUrl || '',
      description: rawData.description || sportPreset.defaultDescription,
      ownerName: rawData.ownerName || '',
      amenities: mergedAmenities,
      schedule,
      active: rawData.active !== undefined ? Boolean(rawData.active) : true,
      owner: ownerUid,
      bookings: 0,
      rating: 5.0,
      reviews: 0,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Trả về preset theo từng môn thể thao (Factory Configurations)
   */
  static getSportPreset(sport) {
    switch (sport) {
      case 'Cầu lông':
        return {
          slotMinutes: 60,
          regularPrice: 120000,
          peakPrice: 180000,
          peakStart: '17:00',
          openTime: '06:00',
          closeTime: '23:00',
          defaultAmenities: ['Đèn chiếu sáng', 'Wi-Fi', 'Cho thuê dụng cụ', 'Phòng thay đồ & tắm'],
          defaultDescription: 'Sân cầu lông đạt chuẩn thảm PVC thi đấu chống trơn trượt, hệ thống chiếu sáng không chói mắt.',
          defaultImage: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800',
        };

      case 'Tennis':
        return {
          slotMinutes: 60,
          regularPrice: 250000,
          peakPrice: 350000,
          peakStart: '17:00',
          openTime: '05:30',
          closeTime: '22:30',
          defaultAmenities: ['Đèn chiếu sáng', 'Cho thuê dụng cụ', 'Bãi đỗ xe', 'Phòng thay đồ & tắm'],
          defaultDescription: 'Sân quần vợt mặt cứng DecoTurf cao cấp, có sẵn trọng tài và nhặt bóng theo yêu cầu.',
          defaultImage: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800',
        };

      case 'Pickleball':
        return {
          slotMinutes: 60,
          regularPrice: 150000,
          peakPrice: 220000,
          peakStart: '17:00',
          openTime: '06:00',
          closeTime: '23:00',
          defaultAmenities: ['Đèn chiếu sáng', 'Wi-Fi', 'Căn tin', 'Cho thuê dụng cụ'],
          defaultDescription: 'Cụm sân Pickleball ngoài trời thoáng mát, mặt sân tiêu chuẩn quốc tế, bóng thi đấu chuyên nghiệp.',
          defaultImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
        };

      case 'Bóng rổ':
        return {
          slotMinutes: 90,
          regularPrice: 200000,
          peakPrice: 300000,
          peakStart: '17:00',
          openTime: '06:00',
          closeTime: '22:00',
          defaultAmenities: ['Đèn chiếu sáng', 'Bãi đỗ xe', 'Căn tin', 'Wi-Fi'],
          defaultDescription: 'Sân bóng rổ sàn gỗ trong nhà có giảm chấn, rổ điều chỉnh độ cao chuẩn NBA.',
          defaultImage: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
        };

      case 'Bóng đá':
      default:
        return {
          slotMinutes: 90,
          regularPrice: 350000,
          peakPrice: 450000,
          peakStart: '17:00',
          openTime: '06:00',
          closeTime: '23:00',
          defaultAmenities: ['Đèn chiếu sáng', 'Bãi đỗ xe', 'Wi-Fi', 'Căn tin', 'Trọng tài'],
          defaultDescription: 'Sân bóng đá cỏ nhân tạo sợi mềm đạt chuẩn FIFA, hệ thống thoát nước hiện đại và đèn cao áp sáng rõ ban đêm.',
          defaultImage: 'https://images.unsplash.com/photo-1529900245534-5e6922028af9?w=800',
        };
    }
  }
}

module.exports = FieldFactory;
