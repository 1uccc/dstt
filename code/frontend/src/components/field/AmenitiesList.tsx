import React from 'react';

interface AmenitiesListProps {
  amenities?: string[];
}

const AMENITY_ICONS: Record<string, string> = {
  'Bãi đỗ xe': '🅿️',
  'Bãi đỗ xe miễn phí': '🅿️',
  'Wi-Fi': '📶',
  'Wi-Fi tốc độ cao': '📶',
  'Trọng tài': '🧑‍⚖️',
  'Trọng tài chuyên nghiệp': '🧑‍⚖️',
  'Đèn chiếu sáng': '💡',
  'Đèn chiếu sáng HD': '💡',
  'Phòng thay đồ & tắm': '🚿',
  'Căn tin': '🥤',
  'Cho thuê dụng cụ': '⚽',
  'Cho thuê bóng & vest': '⚽',
  'Camera an ninh': '📸',
  'Camera an ninh 24/7': '📸',
  'Cỏ nhân tạo thế hệ mới': '🟢',
};

export const AmenitiesList: React.FC<AmenitiesListProps> = ({ amenities = [] }) => {
  return (
    <div className="space-y-3">
      <h2 className="font-bold text-gray-900 text-lg">Tiện Ích Sân</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {amenities.length > 0 ? (
          amenities.map((a) => {
            const icon = AMENITY_ICONS[a] || '✅';
            return (
              <div
                key={a}
                className="bg-green-50/70 border border-green-100 rounded-xl p-3 text-center transition hover:bg-green-50"
              >
                <div className="text-xl mb-1">{icon}</div>
                <div className="text-xs text-gray-800 font-semibold leading-tight">{a}</div>
              </div>
            );
          })
        ) : (
          <div className="col-span-4 text-sm text-gray-500 py-3">Chưa có thông tin tiện ích.</div>
        )}
      </div>
    </div>
  );
};
