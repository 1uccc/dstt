import { FormEvent, useState } from 'react';

const CONTACT_CHANNELS = [
  {
    title: 'Tổng đài hỗ trợ',
    value: '1800 1234',
    detail: 'Miễn phí · 07:00–22:00 mỗi ngày',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 4h4l2 5-2.5 1.5a14 14 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2C9.7 20.5 3.5 14.3 3 6a2 2 0 0 1 2-2Z" />
      </svg>
    ),
  },
  {
    title: 'Email',
    value: 'support@sportbookvn.com',
    detail: 'Phản hồi trong vòng 24 giờ',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6h16v12H4V6Zm0 1 8 6 8-6" />
      </svg>
    ),
  },
  {
    title: 'Văn phòng',
    value: '28 Nguyễn Huệ, Quận 1',
    detail: 'TP. Hồ Chí Minh, Việt Nam',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" strokeWidth="1.8" />
      </svg>
    ),
  },
];

const FAQS = [
  ['Tôi có thể hủy lịch đặt sân không?', 'Bạn có thể hủy trong mục lịch sử đặt sân. Chính sách hoàn tiền phụ thuộc vào thời điểm hủy và quy định của từng sân.'],
  ['Làm thế nào để đăng ký sân trên SportBookVN?', 'Gửi thông tin qua biểu mẫu và chọn chủ đề “Hợp tác chủ sân”. Đội ngũ phát triển đối tác sẽ liên hệ trong một ngày làm việc.'],
  ['Thanh toán của tôi có được bảo mật?', 'Mọi giao dịch được xử lý qua cổng thanh toán bảo mật. SportBookVN không lưu thông tin thẻ của khách hàng.'],
];

export function Contact() {
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const submitContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
    event.currentTarget.reset();
  };

  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden bg-green-950 px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-green-400/20" />
        <div className="absolute -bottom-32 right-20 h-72 w-72 rounded-full bg-green-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-400">Luôn sẵn sàng hỗ trợ</p>
          <h1 className="font-display text-5xl font-extrabold uppercase tracking-tight sm:text-6xl">Chúng tôi có thể giúp gì?</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-green-100/70">
            Gửi câu hỏi, góp ý hoặc yêu cầu hợp tác. Đội ngũ SportBookVN sẽ phản hồi bạn sớm nhất có thể.
          </p>
        </div>
      </section>

      <section className="mx-auto -mt-8 max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative grid gap-4 md:grid-cols-3">
          {CONTACT_CHANNELS.map((channel) => (
            <div key={channel.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-900/5">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-700">{channel.icon}</span>
              <p className="text-sm font-medium text-slate-500">{channel.title}</p>
              <p className="mt-1 font-semibold text-slate-900">{channel.value}</p>
              <p className="mt-1 text-xs text-slate-400">{channel.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-7">
              <p className="text-sm font-semibold text-green-600">Gửi tin nhắn</p>
              <h2 className="mt-1 font-display text-3xl font-bold uppercase tracking-tight text-slate-900">Liên hệ với SportBookVN</h2>
              <p className="mt-2 text-sm text-slate-500">Vui lòng điền đầy đủ thông tin để chúng tôi hỗ trợ chính xác hơn.</p>
            </div>

            {sent && (
              <div role="status" className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 12 4 4L19 6" />
                </svg>
                <div><strong>Đã gửi yêu cầu.</strong> Chúng tôi sẽ liên hệ lại với bạn trong vòng 24 giờ.</div>
              </div>
            )}

            <form onSubmit={submitContact} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-slate-700">Họ và tên</label>
                  <input required id="contact-name" placeholder="Nguyễn Minh Anh" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10" />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="mb-1.5 block text-sm font-medium text-slate-700">Số điện thoại</label>
                  <input required id="contact-phone" type="tel" placeholder="0901 234 567" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10" />
                </div>
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <input required id="contact-email" type="email" placeholder="you@example.com" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10" />
              </div>
              <div>
                <label htmlFor="contact-topic" className="mb-1.5 block text-sm font-medium text-slate-700">Chủ đề</label>
                <select id="contact-topic" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10">
                  <option>Hỗ trợ đặt sân</option>
                  <option>Thanh toán và hoàn tiền</option>
                  <option>Hợp tác chủ sân</option>
                  <option>Góp ý sản phẩm</option>
                  <option>Vấn đề khác</option>
                </select>
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-slate-700">Nội dung</label>
                <textarea required id="contact-message" rows={5} placeholder="Mô tả vấn đề bạn đang gặp phải..." className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10" />
              </div>
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 sm:w-auto">
                Gửi yêu cầu
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 12 14-8-4 16-3-6-7-2Zm7 2 7-10" />
                </svg>
              </button>
            </form>
          </div>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-3xl bg-green-900 p-7 text-white">
              <p className="text-sm font-semibold text-green-300">Thời gian làm việc</p>
              <h2 className="mt-1 font-display text-3xl font-bold uppercase">Hỗ trợ mỗi ngày</h2>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-green-100/60">Thứ Hai – Thứ Sáu</span><span className="font-medium">07:00 – 22:00</span></div>
                <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-green-100/60">Thứ Bảy – Chủ Nhật</span><span className="font-medium">08:00 – 20:00</span></div>
                <div className="flex justify-between"><span className="text-green-100/60">Hỗ trợ khẩn cấp</span><span className="font-medium text-green-300">24/7</span></div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
              <p className="text-sm font-semibold text-green-600">Câu hỏi thường gặp</p>
              <div className="mt-4 divide-y divide-slate-100">
                {FAQS.map(([question, answer], index) => (
                  <div key={question} className="py-4 first:pt-0 last:pb-0">
                    <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-4 text-left text-sm font-semibold text-slate-800">
                      {question}
                      <svg className={`h-4 w-4 shrink-0 text-slate-400 transition ${openFaq === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    {openFaq === index && <p className="mt-2 text-sm leading-relaxed text-slate-500">{answer}</p>}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
