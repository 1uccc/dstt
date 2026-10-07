import { FormEvent, useState } from 'react';

export function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const newPassword = String(data.get('new-password'));
    const confirmPassword = String(data.get('confirm-password'));

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });

      if (res.ok) {
        setSaved(true);
        (event.target as HTMLFormElement).reset();
        window.setTimeout(() => setSaved(false), 3000);
      } else {
        const errData = await res.json();
        setError(errData.message || 'Lỗi khi cập nhật mật khẩu.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {saved && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="m5 12 4 4L19 6" /></svg>
          Đã cập nhật mật khẩu quản trị thành công.
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-semibold text-slate-900">Bảo mật tài khoản</h2>
          <p className="mt-1 text-sm text-slate-500">Đổi mật khẩu để bảo vệ tài khoản quản trị viên.</p>
        </div>

        <form onSubmit={save} className="space-y-6 p-6">
          <div className="grid gap-4">
            <div><label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-slate-700">Mật khẩu mới</label><input required minLength={6} id="new-password" name="new-password" type="password" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500" /></div>
            <div><label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700">Xác nhận mật khẩu mới</label><input required minLength={6} id="confirm-password" name="confirm-password" type="password" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-green-500" /></div>
          </div>
          <div className="flex justify-end"><button type="submit" disabled={loading} className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">{loading ? 'Đang lưu...' : 'Cập nhật mật khẩu'}</button></div>
        </form>
      </div>
    </div>
  );
}
