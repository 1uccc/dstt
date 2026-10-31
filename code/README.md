# ⚽ SportBookVN - Nền Tảng Đặt Sân Thể Thao

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

SportBookVN là một nền tảng website hỗ trợ người dùng tìm kiếm, so sánh và đặt sân thể thao nhanh chóng, đồng thời cung cấp bộ công cụ quản lý chuyên nghiệp cho Chủ sân và Admin.

Đây là sản phẩm của Đồ án môn học **Mẫu Thiết Kế Phần Mềm**.

---

## 👥 Nhóm Phát Triển (Nhóm 06)
- **Nguyễn Đình Lực** 
- **Phạm Khánh Duy** 
- **Trần Mạnh Hùng** 


**Giảng viên hướng dẫn:** T.S Nguyễn Minh Tân  
**Thời gian thực hiện:** 09/2026 - 11/2026  

---

## 🌟 Chức Năng Nổi Bật

Hệ thống thiết kế với 3 phân quyền chính:
1. **Khách hàng:** Tìm sân, xem chi tiết, đặt lịch theo thời gian thực.
2. **Chủ sân:** Quản lý sân, quản lý lịch đặt, xem báo cáo doanh thu.
3. **Admin:** Quản lý tài khoản Chủ sân, cấu hình hệ thống.

---

## 🛠 Kiến Trúc Kỹ Thuật (V3)

Dự án áp dụng kiến trúc Serverless/BaaS kết hợp Middleware API:
- **Frontend:** React.js, TypeScript, Vite, Tailwind CSS. Sử dụng **Firebase Client SDK** để đăng nhập.
- **Backend API:** Node.js, Express.js. Đóng vai trò middleware bảo vệ các nghiệp vụ.
- **Database & Auth:** **Firebase** (Cloud Firestore & Authentication). 

---

## ⚙️ Hướng Dẫn Cài Đặt (Local Development)

### 1. Cài đặt Backend
```bash
cd code/backend
npm install
npm start # Khởi chạy trên Port 5000
```
*(Lưu ý: Bạn cần đưa file `serviceAccountKey.json` sinh ra từ Firebase Console vào thư mục `code/backend/config/` để Backend có quyền ghi vào Firestore)*

### 2. Cài đặt Frontend
```bash
cd code/frontend
npm install
npm run dev # Khởi chạy trên Port 5173
```
*(Lưu ý: Bạn cần cấu hình `firebaseConfig` trong `code/frontend/src/config/firebase.ts` để Frontend gọi được tính năng đăng nhập Auth)*

---

## 📄 Hệ Thống Tài Liệu Kỹ Thuật (SEP Documents)
Các thư mục `1. PROJECT MANAGEMENT`, `2. CONTEXT AND SYSTEM REQUIREMENT`, `3. SOFTWARE ARCHITECTURE & DESIGN`, `4. TESTING` chứa toàn bộ tài liệu theo quy trình SEP.
