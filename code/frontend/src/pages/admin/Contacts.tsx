import { useEffect, useState } from 'react';

export function AdminContacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/contacts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setContacts(current => current.map(c => c._id === id ? { ...c, status } : c));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải danh sách liên hệ...</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yêu cầu liên hệ</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý các tin nhắn, yêu cầu hỗ trợ từ khách hàng và chủ sân.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Người gửi</th>
                <th className="px-6 py-4 font-semibold">Liên hệ</th>
                <th className="px-6 py-4 font-semibold">Chủ đề</th>
                <th className="px-6 py-4 font-semibold">Ngày gửi</th>
                <th className="px-6 py-4 font-semibold text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.map((contact) => (
                <tr key={contact._id} className="transition hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{contact.fullName}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <p>{contact.phone}</p>
                    <p className="text-xs text-slate-400">{contact.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs">
                    <p className="font-medium text-slate-800">{contact.subject}</p>
                    <p className="mt-1 truncate text-xs">{contact.content}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(contact.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {contact.status === 'resolved' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Đã xử lý
                      </span>
                    ) : (
                      <button
                        onClick={() => updateStatus(contact._id, 'resolved')}
                        className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100 transition"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Đang chờ (Đánh dấu xử lý)
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    Chưa có yêu cầu liên hệ nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
