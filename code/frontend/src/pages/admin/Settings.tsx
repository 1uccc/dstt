import { FormEvent, useState } from 'react';

type SettingsTab = 'general' | 'notifications' | 'security';

export function AdminSettings() {
  const [tab, setTab] = useState<SettingsTab>('general');
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    newBooking: true,
    cancelledBooking: true,
    newOwner: true,
    weeklyReport: false,
  });

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const tabs: Array<{ id: SettingsTab; label: string }> = [
    { id: 'general', label: 'Thông tin chung' },
    { id: 'notifications', label: 'Thông báo' },
    { id: 'security', label: 'Bảo mật' },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {saved && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="m5 12 4 4L19 6" /></svg>
          Đã lưu thay đổi thành công.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-semibold text-slate-900">Cài đặt hệ thống</h2>
          <p className="mt-1 text-sm text-slate-500">Quản lý thông tin nền tảng, thông báo và bảo mật.</p>
        </div>
        <div className="flex overflow-x-auto border-b border-slate-100 px-4 sm:px-6">
          {tabs.map((item) => (
            <button key={item.id} onClick={() => setTab(item.id)} className={`whitespace-nowrap border-b-2 px-4 py-4 text-sm font-semibold transition ${tab === item.id ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{item.label}</button>
          ))}
        </div>

        {tab === 'general' && (
          <form onSubmit={save} className="space-y-6 p-6">
            <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-green-600 font-display text-2xl font-bold text-white">SB</span>
              <div><p className="font-medium text-slate-800">Logo nền tảng</p><p className="mt-1 text-xs text-slate-500">PNG hoặc JPG, tối đa 2MB.</p><button type="button" className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Thay đổi logo</button></div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div><label htmlFor="site-name" className="mb-1.5 block text-sm font-medium text-slate-700">Tên nền tảng</label><input id="site-name" defaultValue="SportBookVN" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500" /></div>
              <div><label htmlFor="support-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email hỗ trợ</label><input id="support-email" type="email" defaultValue="support@sportbookvn.com" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500" /></div>
              <div><label htmlFor="hotline" className="mb-1.5 block text-sm font-medium text-slate-700">Hotline</label><input id="hotline" defaultValue="1800 1234" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500" /></div>
              <div><label htmlFor="commission" className="mb-1.5 block text-sm font-medium text-slate-700">Phí nền tảng (%)</label><input id="commission" type="number" defaultValue="5" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500" /></div>
              <div className="sm:col-span-2"><label htmlFor="address" className="mb-1.5 block text-sm font-medium text-slate-700">Địa chỉ</label><input id="address" defaultValue="28 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500" /></div>
              <div className="sm:col-span-2"><label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">Mô tả</label><textarea id="description" rows={3} defaultValue="Nền tảng đặt sân thể thao trực tuyến hàng đầu Việt Nam." className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500" /></div>
            </div>
            <div className="flex justify-end"><button type="submit" className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700">Lưu thay đổi</button></div>
          </form>
        )}

        {tab === 'notifications' && (
          <form onSubmit={save} className="p-6">
            <div className="space-y-1">
              {[
                ['newBooking', 'Đơn đặt sân mới', 'Nhận thông báo khi hệ thống có đơn đặt sân mới.'],
                ['cancelledBooking', 'Đơn bị hủy', 'Thông báo ngay khi khách hàng hoặc chủ sân hủy lịch.'],
                ['newOwner', 'Đăng ký chủ sân', 'Nhận thông báo khi có đối tác mới cần xét duyệt.'],
                ['weeklyReport', 'Báo cáo hàng tuần', 'Gửi báo cáo hoạt động nền tảng vào mỗi thứ Hai.'],
              ].map(([key, title, description]) => {
                const settingKey = key as keyof typeof notifications;
                return (
                  <div key={key} className="flex items-center justify-between gap-5 border-b border-slate-100 py-5 first:pt-0 last:border-0">
                    <div><p className="text-sm font-medium text-slate-800">{title}</p><p className="mt-1 text-xs text-slate-500">{description}</p></div>
                    <button type="button" onClick={() => setNotifications((current) => ({ ...current, [settingKey]: !current[settingKey] }))} className={`relative h-6 w-11 shrink-0 rounded-full transition ${notifications[settingKey] ? 'bg-green-600' : 'bg-slate-300'}`} aria-label={title}>
                      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${notifications[settingKey] ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end"><button type="submit" className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700">Lưu cài đặt</button></div>
          </form>
        )}

        {tab === 'security' && (
          <form onSubmit={save} className="space-y-6 p-6">
            <div><h3 className="font-medium text-slate-800">Đổi mật khẩu quản trị</h3><p className="mt-1 text-xs text-slate-500">Mật khẩu mới nên có ít nhất 8 ký tự, gồm chữ và số.</p></div>
            <div className="grid max-w-xl gap-4">
              <div><label htmlFor="current-password" className="mb-1.5 block text-sm font-medium text-slate-700">Mật khẩu hiện tại</label><input required id="current-password" type="password" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500" /></div>
              <div><label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-slate-700">Mật khẩu mới</label><input required minLength={8} id="new-password" type="password" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500" /></div>
              <div><label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label><input required minLength={8} id="confirm-password" type="password" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500" /></div>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4"><p className="text-sm font-medium text-blue-800">Xác thực hai bước</p><p className="mt-1 text-xs text-blue-600">Bổ sung một lớp bảo vệ cho tài khoản quản trị.</p><button type="button" className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Thiết lập 2FA</button></div>
            <div className="flex justify-end"><button type="submit" className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700">Cập nhật mật khẩu</button></div>
          </form>
        )}
      </div>
    </div>
  );
}
