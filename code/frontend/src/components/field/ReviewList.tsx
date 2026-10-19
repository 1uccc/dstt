import React, { useState } from 'react';
import { Review } from '../../types';
import { apiClient } from '../../utils/apiClient';

interface ReviewListProps {
  fieldId: string;
  reviews: Review[];
  canReview: boolean;
  isFieldOwner: boolean;
  onReviewAdded: (review: Review) => void;
  onReplyAdded: (reviewId: string, reply: string) => void;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  fieldId,
  reviews,
  canReview,
  isFieldOwner,
  onReviewAdded,
  onReplyAdded,
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyComment, setReplyComment] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      alert('Vui lòng nhập nội dung đánh giá.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post<{ message: string; review: Review }>(
        `/api/fields/${fieldId}/reviews`,
        { rating, comment }
      );
      onReviewAdded(res.review);
      setShowReviewForm(false);
      setComment('');
      setRating(5);
      alert('Cảm ơn bạn đã gửi đánh giá!');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyComment.trim()) return;

    setSubmittingReply(true);
    try {
      await apiClient.put(`/api/fields/${fieldId}/reviews/${reviewId}/reply`, {
        reply: replyComment,
      });
      onReplyAdded(reviewId, replyComment);
      setReplyingTo(null);
      setReplyComment('');
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gửi phản hồi');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900 text-lg">Đánh Giá Từ Khách Hàng</h2>
        {canReview && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg transition"
          >
            + Viết Đánh Giá
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-green-50/50 border border-green-200 rounded-2xl p-5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-gray-900">Chia sẻ trải nghiệm của bạn</h3>
            <button
              onClick={() => setShowReviewForm(false)}
              className="text-xs text-gray-500 hover:text-gray-700 font-medium"
            >
              Hủy
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mức độ hài lòng</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl transition hover:scale-110"
                >
                  <span className={star <= rating ? 'text-amber-400' : 'text-gray-300'}>★</span>
                </button>
              ))}
              <span className="text-xs font-bold text-gray-700 ml-2">{rating} / 5 sao</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nhận xét chi tiết</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chất lượng mặt cỏ, ánh sáng, dịch vụ sân..."
              className="w-full text-sm rounded-xl border border-gray-200 p-3 bg-white focus:outline-none focus:border-green-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition disabled:opacity-50"
            >
              {submitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
            </button>
          </div>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-3">
        {reviews.map((r, i) => (
          <div key={r.id || i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold shrink-0 uppercase">
                {(r.customerName || 'KH').substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 text-sm">{r.customerName}</span>
                  <span className="text-[11px] text-gray-400">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '--'}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 mt-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-sm ${star <= r.rating ? 'text-amber-400' : 'text-gray-200'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>

                {/* Owner Reply */}
                {r.ownerReply && (
                  <div className="mt-3 bg-gray-50 rounded-xl p-3 border-l-3 border-green-500">
                    <div className="text-xs font-bold text-gray-800 mb-0.5">Phản hồi từ Chủ sân:</div>
                    <div className="text-xs text-gray-600 leading-relaxed">{r.ownerReply}</div>
                  </div>
                )}

                {/* Owner reply action */}
                {!r.ownerReply && isFieldOwner && (
                  <div className="mt-2.5">
                    {replyingTo === r.id ? (
                      <div className="space-y-2 mt-2">
                        <textarea
                          className="w-full text-xs border border-gray-200 rounded-xl p-2.5 focus:outline-none focus:border-green-500 resize-none bg-gray-50"
                          rows={2}
                          value={replyComment}
                          onChange={(e) => setReplyComment(e.target.value)}
                          placeholder="Nhập nội dung phản hồi..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSubmitReply(r.id)}
                            disabled={submittingReply}
                            className="text-xs font-bold bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            {submittingReply ? 'Đang gửi...' : 'Gửi phản hồi'}
                          </button>
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="text-xs font-medium text-gray-500 px-3 py-1.5 hover:bg-gray-100 rounded-lg"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setReplyingTo(r.id);
                          setReplyComment('');
                        }}
                        className="text-xs font-semibold text-green-700 hover:text-green-800"
                      >
                        ↩ Phản hồi
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-xs bg-gray-50 rounded-2xl border border-gray-100">
            Chưa có đánh giá nào cho sân này. Hãy là người đầu tiên đặt sân và trải nghiệm!
          </div>
        )}
      </div>
    </div>
  );
};
