import { useState } from 'react';
import { useLocation } from 'react-router';

interface Field {
  id: number;
  name: string;
  location: string;
  sport: string;
  price: number;
  active: boolean;
  image: string;
  bookings: number;
  mapUrl: string;
  amenities: string[];
  schedule: FieldSchedule;
  ownerName: string;
}

interface FieldSchedule {
  slotMinutes: number;
  regularPrice: number;
  peakPrice: number;
  peakStart: string;
  days: Array<{ enabled: boolean; open: string; close: string }>;
  blockedDates: string[];
}

const DAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const AMENITY_OPTIONS = ['Bãi đỗ xe', 'Phòng thay đồ & tắm', 'Đèn chiếu sáng', 'Wi-Fi', 'Cho thuê dụng cụ', 'Căn tin', 'Camera an ninh', 'Trọng tài'];

const createSchedule = (): FieldSchedule => ({
  slotMinutes: 90,
  regularPrice: 350000,
  peakPrice: 450000,
  peakStart: '17:00',
  days: DAY_NAMES.map((_, index) => ({ enabled: index !== 0, open: '06:00', close: '23:00' })),
  blockedDates: [],
});

const INITIAL_FIELDS: Field[] = ([
  { id: 1, name: 'Sân Bóng Đá Phú Thọ', location: 'Quận 11, TP.HCM', sport: 'Bóng đá', price: 350000, active: true, image: 'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=80&h=60&fit=crop&auto=format', bookings: 124, mapUrl: 'https://maps.google.com/?q=Nhà+thi+đấu+Phú+Thọ', ownerName: 'Phú Thọ Sports' },
  { id: 2, name: 'Tennis Center Thảo Điền', location: 'Quận 2, TP.HCM', sport: 'Tennis', price: 280000, active: true, image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=80&h=60&fit=crop&auto=format', bookings: 89, mapUrl: 'https://maps.google.com/?q=Thảo+Điền', ownerName: 'Thảo Điền Tennis' },
  { id: 3, name: 'Cầu Lông SportZone', location: 'Bình Thạnh, TP.HCM', sport: 'Cầu lông', price: 150000, active: true, image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=80&h=60&fit=crop&auto=format', bookings: 56, mapUrl: '', ownerName: 'SportZone Việt Nam' },
  { id: 4, name: 'Sân Bóng Rổ Landmark', location: 'Quận 1, TP.HCM', sport: 'Bóng rổ', price: 200000, active: false, image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=80&h=60&fit=crop&auto=format', bookings: 43, mapUrl: '', ownerName: 'Landmark Sports' },
  { id: 5, name: 'Sân 7 Người Hòa Bình', location: 'Gò Vấp, TP.HCM', sport: 'Bóng đá', price: 420000, active: true, image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=80&h=60&fit=crop&auto=format', bookings: 201, mapUrl: '', ownerName: 'Phú Thọ Sports' },
  { id: 6, name: 'Sân Pickleball Sky Garden', location: 'Phú Nhuận, TP.HCM', sport: 'Pickleball', price: 180000, active: true, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=60&fit=crop&auto=format', bookings: 31, mapUrl: '', ownerName: 'Phú Thọ Sports' },
] as Array<Omit<Field, 'amenities' | 'schedule'>>).map((field) => ({
  ...field,
  amenities: ['Bãi đỗ xe', 'Đèn chiếu sáng', 'Phòng thay đồ & tắm'],
  schedule: { ...createSchedule(), regularPrice: field.price, peakPrice: Math.round(field.price * 1.25) },
}));

const SPORT_OPTIONS = ['Bóng đá', 'Tennis', 'Cầu lông', 'Bóng rổ', 'Pickleball'];

export function FieldManagement() {
  const location = useLocation();
  const isOwnerPortal = location.pathname.startsWith('/owner');
  const currentOwner = 'Phú Thọ Sports';
  const [fields, setFields] = useState<Field[]>(INITIAL_FIELDS);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [editField, setEditField] = useState<Field | null>(null);

  // New field form state
  const emptyForm = () => ({
    name: '',
    location: '',
    sport: 'Bóng đá',
    price: '',
    image: '',
    mapUrl: '',
    ownerName: isOwnerPortal ? currentOwner : 'Phú Thọ Sports',
    amenities: [] as string[],
    schedule: createSchedule(),
  });
  const [form, setForm] = useState(emptyForm);
  const [blockedDate, setBlockedDate] = useState('');
  const defaultSchedule = createSchedule();
  const activeSchedule: FieldSchedule = {
    ...defaultSchedule,
    ...(form.schedule ?? {}),
    days: form.schedule?.days ?? defaultSchedule.days,
    blockedDates: form.schedule?.blockedDates ?? [],
  };
  const selectedAmenities = form.amenities ?? [];

  const persistSchedule = (fieldName: string, schedule: FieldSchedule) => {
    try {
      const raw = localStorage.getItem('sportbook-owner-schedule');
      const parsed = raw ? JSON.parse(raw) : {};
      const schedules = parsed.days ? { [parsed.field]: parsed } : parsed;
      schedules[fieldName] = { field: fieldName, ...schedule };
      localStorage.setItem('sportbook-owner-schedule', JSON.stringify(schedules));
    } catch {
      localStorage.setItem('sportbook-owner-schedule', JSON.stringify({ [fieldName]: { field: fieldName, ...schedule } }));
    }
  };

  const updateScheduleDay = (index: number, update: Partial<FieldSchedule['days'][number]>) => {
    setForm((current) => {
      const schedule = current.schedule ?? createSchedule();
      return {
        ...current,
        schedule: {
          ...schedule,
          days: schedule.days.map((item, dayIndex) => dayIndex === index ? { ...item, ...update } : item),
        },
      };
    });
  };

  const scopedFields = isOwnerPortal ? fields.filter((field) => field.ownerName === currentOwner) : fields;
  const filtered = scopedFields.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.location.toLowerCase().includes(search.toLowerCase()) ||
    f.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActive = (id: number) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, active: !f.active } : f));
  };

  const deleteField = (id: number) => {
    setFields(prev => prev.filter(f => f.id !== id));
    setShowDeleteConfirm(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editField) {
      setFields(prev => prev.map(f => f.id === editField.id ? {
        ...f,
        name: form.name,
        location: form.location,
        sport: form.sport,
        price: Number(form.price),
        mapUrl: form.mapUrl,
        ownerName: form.ownerName,
        amenities: selectedAmenities,
        schedule: activeSchedule,
      } : f));
    } else {
      const newField: Field = {
        id: Date.now(),
        name: form.name,
        location: form.location,
        sport: form.sport,
        price: Number(form.price),
        active: true,
        image: form.image || 'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=80&h=60&fit=crop&auto=format',
        bookings: 0,
        mapUrl: form.mapUrl,
        ownerName: isOwnerPortal ? currentOwner : form.ownerName,
        amenities: selectedAmenities,
        schedule: activeSchedule,
      };
      setFields(prev => [...prev, newField]);
    }
    persistSchedule(form.name, { ...activeSchedule, regularPrice: Number(activeSchedule.regularPrice || form.price) });
    setShowModal(false);
    setEditField(null);
    setForm(emptyForm());
  };

  const openEdit = (f: Field) => {
    setEditField(f);
    setForm({
      name: f.name,
      location: f.location,
      sport: f.sport,
      price: String(f.price),
      image: f.image,
      mapUrl: f.mapUrl,
      ownerName: f.ownerName ?? currentOwner,
      amenities: f.amenities ?? [],
      schedule: f.schedule ?? { ...createSchedule(), regularPrice: f.price, peakPrice: Math.round(f.price * 1.25) },
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditField(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng sân', value: scopedFields.length, icon: '🏟️', color: 'blue' },
          { label: 'Đang hoạt động', value: scopedFields.filter(f => f.active).length, icon: '✅', color: 'green' },
          { label: 'Tạm dừng', value: scopedFields.filter(f => !f.active).length, icon: '⏸️', color: 'amber' },
          { label: 'Tổng đặt sân', value: scopedFields.reduce((a, f) => a + f.bookings, 0), icon: '📊', color: 'purple' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="text-2xl">{card.icon}</div>
            <div>
              <div className="text-xl font-bold text-gray-900">{card.value}</div>
              <div className="text-xs text-gray-500">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 className="font-bold text-gray-900">Danh Sách Sân</h2>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder="Tìm kiếm sân..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-56"
              />
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Thêm Sân Mới
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Sân', ...(!isOwnerPortal ? ['Chủ sân'] : []), 'Địa điểm', 'Môn thể thao', 'Giá / giờ', 'Đặt sân', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((field, i) => (
                <tr key={field.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === filtered.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={field.image} alt={field.name} className="w-12 h-9 rounded-lg object-cover bg-gray-100 shrink-0" />
                      <span className="font-medium text-gray-900 whitespace-nowrap">{field.name}</span>
                    </div>
                  </td>
                  {!isOwnerPortal && (
                    <td className="px-4 py-3.5">
                      <p className="whitespace-nowrap text-sm font-medium text-gray-800">{field.ownerName}</p>
                      <p className="text-xs text-gray-400">Đối tác chủ sân</p>
                    </td>
                  )}
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{field.location}</td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
                      {field.sport}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">{field.price.toLocaleString('vi-VN')}đ</td>
                  <td className="px-4 py-3.5 text-gray-600">{field.bookings}</td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => toggleActive(field.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${field.active ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${field.active ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
                    </button>
                    <span className={`ml-2 text-xs font-medium ${field.active ? 'text-green-700' : 'text-gray-400'}`}>
                      {field.active ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(field)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(field.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Xóa"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 style={{ fontFamily: 'Barlow Condensed, sans-serif' }} className="text-2xl font-extrabold text-gray-900 uppercase tracking-tight">
                {editField ? 'Chỉnh Sửa Sân' : 'Thêm Sân Mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto p-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Tên sân <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  placeholder="VD: Sân Bóng Đá Tân Bình"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {!isOwnerPortal && (
                <div>
                  <label htmlFor="field-owner" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">Chủ sân <span className="text-red-500">*</span></label>
                  <select id="field-owner" required value={form.ownerName} onChange={(event) => setForm((current) => ({ ...current, ownerName: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500">
                    {['Phú Thọ Sports', 'Thảo Điền Tennis', 'SportZone Việt Nam', 'Landmark Sports', 'Hòa Bình FC', 'Sky Garden Club'].map((owner) => <option key={owner}>{owner}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Loại sân <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={form.sport}
                    onChange={e => setForm(f => ({ ...f, sport: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    {SPORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Giá / giờ (VNĐ) <span className="text-red-500">*</span></label>
                  <input
                    required
                    type="number"
                    placeholder="350000"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value, schedule: { ...(f.schedule ?? createSchedule()), regularPrice: Number(e.target.value) } }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Địa chỉ <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  placeholder="VD: 123 Đường Lý Thường Kiệt, Quận 1, TP.HCM"
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="field-map-url" className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Link Google Maps</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s7-5.5 7-12A7 7 0 1 0 5 9c0 6.5 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg>
                    <input
                      id="field-map-url"
                      type="url"
                      value={form.mapUrl}
                      onChange={e => setForm(f => ({ ...f, mapUrl: e.target.value }))}
                      placeholder="https://maps.app.goo.gl/..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  {form.mapUrl && (
                    <a href={form.mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-xl border border-gray-200 px-3 text-xs font-semibold text-green-700 hover:bg-green-50">
                      Mở bản đồ
                    </a>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-gray-400">Mở vị trí trên Google Maps, chọn Chia sẻ rồi dán liên kết vào đây.</p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Hình ảnh</label>
                <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-4 flex items-center gap-4 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Kéo thả hoặc nhấn để tải ảnh</p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG, JPG tối đa 10MB</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <div className="mb-4">
                  <h3 className="font-display text-xl font-bold uppercase text-gray-900">Tiện ích sân</h3>
                  <p className="text-xs text-gray-500">Chọn các tiện ích sẽ hiển thị trên trang thông tin sân.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {AMENITY_OPTIONS.map((amenity) => {
                    const selected = selectedAmenities.includes(amenity);
                    return (
                      <label key={amenity} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition ${selected ? 'border-green-300 bg-green-50 text-green-800' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => setForm((current) => ({
                            ...current,
                            amenities: selected
                              ? (current.amenities ?? []).filter((item) => item !== amenity)
                              : [...(current.amenities ?? []), amenity],
                          }))}
                          className="accent-green-600"
                        />
                        {amenity}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <div className="mb-4">
                  <h3 className="font-display text-xl font-bold uppercase text-gray-900">Lịch hoạt động & bảng giá</h3>
                  <p className="text-xs text-gray-500">Cấu hình riêng cho sân này. Lịch sẽ đồng bộ sang giao diện đặt sân của khách hàng.</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  <div>
                    <label htmlFor="field-slot-duration" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">Độ dài khung giờ</label>
                    <select id="field-slot-duration" value={activeSchedule.slotMinutes} onChange={(event) => setForm((current) => ({ ...current, schedule: { ...(current.schedule ?? createSchedule()), slotMinutes: Number(event.target.value) } }))} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500">
                      <option value={60}>60 phút</option>
                      <option value={90}>90 phút</option>
                      <option value={120}>120 phút</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="field-regular-price" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">Giá giờ thường</label>
                    <input id="field-regular-price" type="number" min={0} step={10000} value={activeSchedule.regularPrice} onChange={(event) => setForm((current) => ({ ...current, schedule: { ...(current.schedule ?? createSchedule()), regularPrice: Number(event.target.value) } }))} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label htmlFor="field-peak-price" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">Giá cao điểm</label>
                    <input id="field-peak-price" type="number" min={0} step={10000} value={activeSchedule.peakPrice} onChange={(event) => setForm((current) => ({ ...current, schedule: { ...(current.schedule ?? createSchedule()), peakPrice: Number(event.target.value) } }))} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label htmlFor="field-peak-start" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">Cao điểm từ</label>
                    <input id="field-peak-start" type="time" value={activeSchedule.peakStart} onChange={(event) => setForm((current) => ({ ...current, schedule: { ...(current.schedule ?? createSchedule()), peakStart: event.target.value } }))} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                  <div className="grid grid-cols-[7rem_1fr_auto] bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <span>Ngày</span><span>Giờ hoạt động</span><span>Nhận lịch</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {activeSchedule.days.map((day, index) => (
                      <div key={DAY_NAMES[index]} className="grid grid-cols-[7rem_1fr_auto] items-center gap-3 px-4 py-2.5">
                        <span className="text-sm font-medium text-gray-700">{DAY_NAMES[index]}</span>
                        <div className={`flex items-center gap-2 ${day.enabled ? '' : 'pointer-events-none opacity-40'}`}>
                          <input aria-label={`Giờ mở cửa ${DAY_NAMES[index]}`} type="time" value={day.open} onChange={(event) => updateScheduleDay(index, { open: event.target.value })} className="min-w-0 rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-green-500" />
                          <span className="text-xs text-gray-400">đến</span>
                          <input aria-label={`Giờ đóng cửa ${DAY_NAMES[index]}`} type="time" value={day.close} onChange={(event) => updateScheduleDay(index, { close: event.target.value })} className="min-w-0 rounded-lg border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-green-500" />
                        </div>
                        <button type="button" role="switch" aria-checked={day.enabled} onClick={() => updateScheduleDay(index, { enabled: !day.enabled })} className={`relative h-5 w-9 rounded-full transition ${day.enabled ? 'bg-green-600' : 'bg-gray-300'}`}>
                          <span className={`absolute top-1 h-3 w-3 rounded-full bg-white shadow-sm transition-all ${day.enabled ? 'left-5' : 'left-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="field-blocked-date" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600">Ngày tạm khóa</label>
                  <div className="flex gap-2">
                    <input id="field-blocked-date" type="date" value={blockedDate} onChange={(event) => setBlockedDate(event.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-500" />
                    <button
                      type="button"
                      onClick={() => {
                        if (!blockedDate || activeSchedule.blockedDates.includes(blockedDate)) return;
                        setForm((current) => {
                          const schedule = current.schedule ?? createSchedule();
                          return { ...current, schedule: { ...schedule, blockedDates: [...schedule.blockedDates, blockedDate].sort() } };
                        });
                        setBlockedDate('');
                      }}
                      className="rounded-xl bg-gray-900 px-4 text-xs font-semibold text-white hover:bg-gray-800"
                    >
                      Thêm ngày khóa
                    </button>
                  </div>
                  {activeSchedule.blockedDates.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {activeSchedule.blockedDates.map((date) => (
                        <span key={date} className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
                          {new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN')}
                          <button type="button" onClick={() => setForm((current) => {
                            const schedule = current.schedule ?? createSchedule();
                            return { ...current, schedule: { ...schedule, blockedDates: schedule.blockedDates.filter((item) => item !== date) } };
                          })} className="text-amber-600 hover:text-red-600" aria-label={`Xóa ngày ${date}`}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors shadow-md shadow-green-600/25"
                >
                  {editField ? 'Lưu Thay Đổi' : 'Thêm Sân'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Xác Nhận Xóa</h3>
            <p className="text-gray-500 text-sm mb-6">Bạn có chắc muốn xóa sân này? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Hủy</button>
              <button onClick={() => deleteField(showDeleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors">Xóa Sân</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
