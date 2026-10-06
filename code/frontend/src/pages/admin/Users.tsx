import { FormEvent, useEffect, useMemo, useState } from 'react';

type UserRole = 'customer' | 'owner' | 'admin';
type UserStatus = 'active' | 'pending' | 'locked';

interface UserItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
  businessInfo?: {
    businessName?: string;
    taxCode?: string;
    city?: string;
    district?: string;
    address?: string;
  };
}

const INITIAL_USERS: UserItem[] = [];

const ROLE_LABEL: Record<UserRole, string> = {
  customer: 'Khách hàng',
  owner: 'Chủ sân',
  admin: 'Quản trị viên',
};

export function AdminUsers() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'all' | UserRole>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<UserItem | null>(null);
  const [notice, setNotice] = useState('');

  const filtered = useMemo(() => users.filter((user) => {
    const keyword = search.toLowerCase();
    const name = user.fullName || '';
    const email = user.email || '';
    const phone = user.phone || '';
    const matches = name.toLowerCase().includes(keyword)
      || email.toLowerCase().includes(keyword)
      || phone.includes(keyword);
    return matches && (role === 'all' || user.role === role);
  }), [users, search, role]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const changeUserStatus = async (id: string, newStatus: UserStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setUsers((current) => current.map((user) => user.id === id ? { ...user, status: newStatus } : user));
        setSelected((current) => current?.id === id ? { ...current, status: newStatus } : current);
        setNotice(newStatus === 'active' ? 'Đã duyệt/mở khóa tài khoản.' : 'Đã khóa tài khoản.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const newUser: UserItem = {
      id: Date.now().toString(),
      fullName: String(data.get('name')),
      email: String(data.get('email')),
      phone: String(data.get('phone')),
      role: String(data.get('role')) as UserRole,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setUsers((current) => [newUser, ...current]);
    setShowAdd(false);
    setNotice(`Đã tạo tài khoản cho ${newUser.fullName}.`);
  };

  return (
    <div className="space-y-5">
      {notice && (
        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span>{notice}</span><button onClick={() => setNotice('')} className="font-semibold">Đóng</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          ['Tổng người dùng', users.length],
          ['Khách hàng', users.filter((item) => item.role === 'customer').length],
          ['Chủ sân', users.filter((item) => item.role === 'owner').length],
          ['Chờ duyệt', users.filter((item) => item.status === 'pending').length],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div><h2 className="font-semibold text-slate-900">Quản lý người dùng</h2><p className="mt-0.5 text-xs text-slate-500">Quản lý quyền truy cập và trạng thái tài khoản</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên, email, số điện thoại..." className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-500 sm:w-64" />
            <select value={role} onChange={(event) => setRole(event.target.value as 'all' | UserRole)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-green-500">
              <option value="all">Tất cả vai trò</option>
              {Object.entries(ROLE_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <button onClick={() => setShowAdd(true)} className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeWidth="2" d="M12 5v14M5 12h14" /></svg>
              Thêm người dùng
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>{['Người dùng', 'Vai trò', 'Trạng thái', 'Thao tác'].map((title) => <th key={title} className="whitespace-nowrap px-4 py-3 text-left font-semibold">{title}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">{(user.fullName || 'U').split(' ').slice(-2).map((part) => part[0]).join('')}</span>
                      <div><p className="whitespace-nowrap font-medium text-slate-900">{user.fullName}</p><p className="text-xs text-slate-400">{user.email} · {user.phone}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${user.role === 'admin' ? 'bg-violet-50 text-violet-700' : user.role === 'owner' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{ROLE_LABEL[user.role]}</span></td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium ${user.status === 'active' ? 'text-green-700' : user.status === 'pending' ? 'text-amber-600' : 'text-red-600'}`}>
                      <span className={`h-2 w-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : user.status === 'pending' ? 'bg-amber-400' : 'bg-red-400'}`} />
                      {user.status === 'active' ? 'Hoạt động' : user.status === 'pending' ? 'Chờ duyệt' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-4 py-4"><button onClick={() => setSelected(user)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50">Quản lý</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-10 text-center text-sm text-slate-500">Không tìm thấy người dùng phù hợp.</div>}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="border-b border-slate-100 px-6 py-5"><h2 className="font-semibold text-slate-900">Thêm người dùng mới</h2><p className="mt-1 text-xs text-slate-500">Tạo tài khoản và cấp quyền truy cập hệ thống.</p></div>
            <form onSubmit={addUser} className="space-y-4 p-6">
              <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Họ và tên</label><input required name="name" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-green-500" /></div>
              <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label><input required type="email" name="email" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-green-500" /></div>
              <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Số điện thoại</label><input required name="phone" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-green-500" /></div>
              <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Vai trò</label><select name="role" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-green-500"><option value="customer">Khách hàng</option><option value="owner">Chủ sân</option><option value="admin">Quản trị viên</option></select></div>
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowAdd(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600">Hủy</button><button type="submit" className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700">Tạo tài khoản</button></div>
            </form>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-700">{(selected.fullName || 'U').split(' ').slice(-2).map((part) => part[0]).join('')}</span>
            <h2 className="mt-4 font-semibold text-slate-900">{selected.fullName}</h2>
            <p className="mt-1 text-sm text-slate-500">{selected.email}</p>
            <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{ROLE_LABEL[selected.role]}</span>

            {selected.role === 'owner' && selected.businessInfo && (
              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-left text-sm">
                <h3 className="mb-2 font-semibold text-slate-900">Thông tin đăng ký kinh doanh</h3>
                <div className="grid gap-2 text-slate-600">
                  <p><span className="font-medium text-slate-700">Tên đơn vị:</span> {selected.businessInfo.businessName || 'Không có'}</p>
                  <p><span className="font-medium text-slate-700">MST:</span> {selected.businessInfo.taxCode || 'Không có'}</p>
                  <p><span className="font-medium text-slate-700">Địa chỉ:</span> {[selected.businessInfo.address, selected.businessInfo.district, selected.businessInfo.city].filter(Boolean).join(', ') || 'Không có'}</p>
                </div>
              </div>
            )}

            {selected.role !== 'admin' && (
              <div className="mt-6 flex flex-col gap-2">
                {selected.status === 'pending' && (
                  <button onClick={() => changeUserStatus(selected.id, 'active')} className="w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700">Duyệt tài khoản</button>
                )}
                {selected.status === 'active' && (
                  <button onClick={() => changeUserStatus(selected.id, 'locked')} className="w-full rounded-xl bg-red-50 py-3 text-sm font-semibold text-red-700 hover:bg-red-100">Khóa tài khoản</button>
                )}
                {selected.status === 'locked' && (
                  <button onClick={() => changeUserStatus(selected.id, 'active')} className="w-full rounded-xl bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700">Mở khóa tài khoản</button>
                )}
              </div>
            )}
            <button onClick={() => setSelected(null)} className="mt-2 w-full rounded-xl py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
