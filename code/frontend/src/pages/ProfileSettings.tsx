import { useState, useEffect } from 'react';
import { auth } from '../config/firebase';

export function ProfileSettings() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const res = await fetch('http://localhost:5000/api/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setName(data.fullName || data.name || '');
          setPhone(data.phone || '');
          if (data.businessInfo) {
            setBusinessName(data.businessInfo.businessName || '');
            setBusinessAddress(data.businessInfo.businessAddress || '');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchProfile();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const payload: any = { fullName: name, name: name, phone };
      
      if (profile?.role === 'owner') {
        payload.businessName = businessName;
        payload.businessAddress = businessAddress;
      }

      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess('Cập nhật thông tin thành công!');
        // Update session in local storage
        const sessionStr = localStorage.getItem('sportbook-session');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          session.name = name;
          localStorage.setItem('sportbook-session', JSON.stringify(session));
          // Dispatch event to force header re-render
          window.dispatchEvent(new Event('storage'));
        }
      } else {
        const data = await res.json();
        setError(data.message || 'Có lỗi xảy ra khi lưu thông tin.');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải thông tin...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-gray-500">Vui lòng đăng nhập để xem trang này.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Thông Tin Cá Nhân</h1>
      
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Thông tin tài khoản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại tài khoản</label>
              <div className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 font-medium text-gray-700 capitalize">
                {profile.role === 'customer' ? 'Khách hàng' : profile.role === 'owner' ? 'Chủ sân' : 'Quản trị viên'}
              </div>
            </div>
          </div>
        </div>

        {profile.role === 'owner' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Thông tin doanh nghiệp / Sân</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên doanh nghiệp / Cơ sở</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ trụ sở</label>
                <input
                  type="text"
                  value={businessAddress}
                  onChange={e => setBusinessAddress(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
