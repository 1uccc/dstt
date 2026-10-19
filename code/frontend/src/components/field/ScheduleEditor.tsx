import React, { useState } from 'react';
import { FieldSchedule } from '../../types';

export const DAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

export const createDefaultSchedule = (): FieldSchedule => ({
  slotMinutes: 90,
  regularPrice: 350000,
  peakPrice: 450000,
  peakStart: '17:00',
  days: DAY_NAMES.map((_, index) => ({ enabled: index !== 0, open: '06:00', close: '23:00' })),
  blockedDates: [],
});

interface ScheduleEditorProps {
  schedule: FieldSchedule;
  onChange: (updated: FieldSchedule) => void;
}

export const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ schedule, onChange }) => {
  const [blockedDate, setBlockedDate] = useState('');

  const updateScheduleDay = (index: number, update: Partial<FieldSchedule['days'][number]>) => {
    const updatedDays = schedule.days.map((item, dayIndex) =>
      dayIndex === index ? { ...item, ...update } : item
    );
    onChange({
      ...schedule,
      days: updatedDays,
    });
  };

  const handleAddBlockedDate = () => {
    if (!blockedDate || schedule.blockedDates.includes(blockedDate)) return;
    onChange({
      ...schedule,
      blockedDates: [...schedule.blockedDates, blockedDate].sort(),
    });
    setBlockedDate('');
  };

  const handleRemoveBlockedDate = (date: string) => {
    onChange({
      ...schedule,
      blockedDates: schedule.blockedDates.filter((item) => item !== date),
    });
  };

  return (
    <div className="border-t border-gray-100 pt-5">
      <div className="mb-4">
        <h3 className="font-display text-xl font-bold uppercase text-gray-900">Lịch hoạt động & bảng giá</h3>
        <p className="text-xs text-gray-500">Cấu hình riêng cho sân này. Lịch sẽ đồng bộ sang giao diện đặt sân của khách hàng.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <label htmlFor="field-slot-duration" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">Độ dài khung giờ</label>
          <select
            id="field-slot-duration"
            value={String(schedule.slotMinutes)}
            onChange={(e) => onChange({ ...schedule, slotMinutes: Number(e.target.value) })}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="30">30 phút</option>
            <option value="60">60 phút</option>
            <option value="90">90 phút</option>
            <option value="120">120 phút</option>
          </select>
        </div>
        <div>
          <label htmlFor="field-regular-price" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">Giá giờ thường</label>
          <input
            id="field-regular-price"
            type="number"
            min={0}
            step={10000}
            value={schedule.regularPrice}
            onChange={(e) => onChange({ ...schedule, regularPrice: Number(e.target.value) })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label htmlFor="field-peak-price" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">Giá cao điểm</label>
          <input
            id="field-peak-price"
            type="number"
            min={0}
            step={10000}
            value={schedule.peakPrice}
            onChange={(e) => onChange({ ...schedule, peakPrice: Number(e.target.value) })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label htmlFor="field-peak-start" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">Cao điểm từ</label>
          <input
            id="field-peak-start"
            type="time"
            value={schedule.peakStart}
            onChange={(e) => onChange({ ...schedule, peakStart: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
        <div className="hidden sm:grid sm:grid-cols-[7rem_1fr_auto] bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <span>Ngày</span><span>Giờ hoạt động</span><span>Nhận lịch</span>
        </div>
        <div className="divide-y divide-gray-100">
          {schedule.days.map((day, index) => (
            <div key={DAY_NAMES[index]} className="flex flex-col gap-2 px-4 py-3 sm:grid sm:grid-cols-[7rem_1fr_auto] sm:items-center sm:gap-3 sm:py-2.5">
              <div className="flex items-center justify-between sm:block">
                <span className="text-sm font-medium text-gray-700">{DAY_NAMES[index]}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={day.enabled}
                  onClick={() => updateScheduleDay(index, { enabled: !day.enabled })}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition sm:hidden ${day.enabled ? 'bg-green-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 h-3 w-3 rounded-full bg-white shadow-sm transition-all ${day.enabled ? 'left-5' : 'left-1'}`} />
                </button>
              </div>
              <div className={`flex items-center gap-2 ${day.enabled ? '' : 'pointer-events-none opacity-40'}`}>
                <input
                  aria-label={`Giờ mở cửa ${DAY_NAMES[index]}`}
                  type="time"
                  value={day.open}
                  onChange={(e) => updateScheduleDay(index, { open: e.target.value })}
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-green-500"
                />
                <span className="text-xs text-gray-400 shrink-0">đến</span>
                <input
                  aria-label={`Giờ đóng cửa ${DAY_NAMES[index]}`}
                  type="time"
                  value={day.close}
                  onChange={(e) => updateScheduleDay(index, { close: e.target.value })}
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-green-500"
                />
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={day.enabled}
                onClick={() => updateScheduleDay(index, { enabled: !day.enabled })}
                className={`relative h-5 w-9 shrink-0 rounded-full transition hidden sm:block ${day.enabled ? 'bg-green-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 h-3 w-3 rounded-full bg-white shadow-sm transition-all ${day.enabled ? 'left-5' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="field-blocked-date" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">Ngày tạm khóa</label>
        <div className="flex gap-2">
          <input
            id="field-blocked-date"
            type="date"
            value={blockedDate}
            onChange={(e) => setBlockedDate(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-500"
          />
          <button
            type="button"
            onClick={handleAddBlockedDate}
            className="rounded-xl bg-gray-900 px-4 text-xs font-semibold text-white hover:bg-gray-800"
          >
            Thêm ngày khóa
          </button>
        </div>
        {schedule.blockedDates.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {schedule.blockedDates.map((date) => (
              <span key={date} className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
                {new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN')}
                <button
                  type="button"
                  onClick={() => handleRemoveBlockedDate(date)}
                  className="text-amber-600 hover:text-red-600"
                  aria-label={`Xóa ngày ${date}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
