/**
 * Tiện ích xử lý và định dạng ngày giờ toàn cục (Date Utilities)
 */

export function formatTimeAgo(dateInput?: string | number | Date): string {
  if (!dateInput) return 'Gần đây';
  try {
    const past = new Date(dateInput).getTime();
    if (isNaN(past)) return 'Gần đây';
    const now = Date.now();
    const diffSec = Math.floor((now - past) / 1000);
    if (diffSec < 60) return 'Vừa xong';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} giờ trước`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return new Date(past).toLocaleDateString('vi-VN');
  } catch {
    return 'Gần đây';
  }
}

export function formatCreatedAt(isoString?: string): string {
  if (!isoString) return '--';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${hours}:${minutes} · ${day}/${month}/${year}`;
  } catch {
    return isoString;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
