# XIV STUDIO - WebStoreWithAI (High-End Streetwear & AI Assistant)

> Hệ thống Thương mại điện tử thời trang Streetwear cao cấp tích hợp **MongoDB (Mongoose ODM)**, **Trí tuệ nhân tạo (Google Gemini RAG)**, **Cổng thanh toán tự động VietQR Napas 247**, và **Hệ thống phân quyền 3 cấp độ (Admin / Employee / Customer)**.

---

## 1. 🏗️ Kiến trúc & Công nghệ

- **Frontend**: React 18, Vite 6, Tailwind CSS, Lucide Icons, Canvas Confetti. Giao diện SPA Dark Mode Glassmorphism Cyberpunk sang trọng.
- **Backend**: Node.js (LTS), Express.js, REST API, Server-Sent Events (SSE) Streaming.
- **Cơ sở dữ liệu (Database)**: **MongoDB (Mongoose ODM)** gồm 7 Collections chuẩn hóa:
  1. `xiv_users`: Quản lý tài khoản, phân quyền 3 roles, hạng thẻ hội viên, cơ chế chặn xóa Admin duy nhất.
  2. `xiv_products`: Quản lý kho, giá bán, sale price, tồn kho (`stock`), số lượng đã bán (`soldCount`), tags và thư viện ảnh.
  3. `xiv_categories`: Danh mục sản phẩm và slug SEO.
  4. `xiv_orders`: Quản lý đơn hàng với 5 trạng thái (`PENDING`, `PROCESSING`, `SHIPPING`, `DELIVERED`, `CANCELLED`), lịch sử timeline, thanh toán VietQR & COD.
  5. `xiv_faqs`: Câu hỏi thường gặp phục vụ hỗ trợ khách hàng và làm Grounding Context cho AI.
  6. `xiv_cart`: Lưu trữ giỏ hàng người dùng theo `userId` hoặc `sessionId`.
  7. `xiv_wishlist`: Danh sách sản phẩm yêu thích của khách hàng.
- **AI Integration (Google Gemini RAG)**:
  - **UC006 (AI Shopping Assistant)**: RAG Grounded Context (đọc trực tiếp dữ liệu kho và FAQ từ MongoDB), SSE Streaming thời gian thực, tự động chèn thẻ tương tác `[PRODUCT_CARD: <id>]`.
  - **UC008 (AI Sinh mô tả SEO)**: Hỗ trợ nhân viên sinh tự động mô tả sản phẩm chuẩn SEO e-commerce.
  - **UC010 (AI Phân tích Chiến lược kinh doanh)**: Hỗ trợ Admin phân tích doanh thu, cảnh báo đứt gãy chuỗi cung ứng (tồn kho $\le 10$) và đề xuất chiến dịch tiếp thị.
- **Cổng thanh toán VietQR Napas 247**:
  - Sinh mã QR động chuẩn Napas 247 khớp tự động số tài khoản, số tiền và mã đơn `XIV <OrderCode>`.

---

## 2. 📋 Yêu cầu Hệ thống (Prerequisites)

- **Node.js**: Phiên bản `>= 18.x` (khuyến nghị Node 20 LTS).
- **NPM**: Phiên bản `>= 9.x`.
- **MongoDB**:
  - MongoDB Community Server cài đặt cục bộ (`mongodb://127.0.0.1:27017`), hoặc
  - MongoDB Atlas Cloud Database connection string.

---

## 3. 🚀 Hướng dẫn Cài đặt & Khởi chạy Chi tiết

### Bước 1: Clone dự án và Cài đặt Dependencies

Tại thư mục gốc của dự án:
```bash
# 1. Cài đặt dependencies thư mục gốc (quản lý monorepo & concurrently)
npm install

# 2. Cài đặt dependencies cho Backend
cd backend
npm install
cd ..

# 3. Cài đặt dependencies cho Frontend
cd frontend
npm install
cd ..
```

---

### Bước 2: Cấu hình Biến môi trường (.env)

Sao chép file `.env.example` trong thư mục `backend/` thành `backend/.env`:
```bash
cp backend/.env.example backend/.env
```

Nội dung file `backend/.env`:
```env
PORT=5000
NODE_ENV=development

# MongoDB Connection URI (Local hoặc Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/xiv_studio

# JWT Secret
JWT_SECRET=xiv_studio_super_secret_jwt_key_2026

# Google Gemini API Key (Tùy chọn - nếu để trống hệ thống sẽ tự động chuyển sang chế độ giả lập thông minh)
GEMINI_API_KEY=your_gemini_api_key_here

# Cấu hình VietQR Napas 247
VIETQR_BANK_ID=MB
VIETQR_ACCOUNT_NO=5100101042006
VIETQR_ACCOUNT_NAME=VU DUC DAT
VIETQR_TEMPLATE=compact2
```

---

### Bước 3: Khởi tạo Dữ liệu Mẫu (Database Seeding)

Chạy lệnh nạp sẵn 8 danh mục, 20+ sản phẩm Streetwear cao cấp, tài khoản Demo và câu hỏi FAQ vào MongoDB:
```bash
npm run init:db
# hoặc: cd backend && npm run db:seed
```

---

### Bước 4: Khởi chạy Dự án

Chỉ với **1 câu lệnh duy nhất** từ thư mục gốc để chạy đồng thời cả Backend và Frontend:
```bash
npm run dev
```

- 🌐 **Frontend App:** [http://localhost:5173](http://localhost:5173)
- ⚡ **Backend API:** [http://localhost:5000](http://localhost:5000)
- 🩺 **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 4. 🔑 Danh sách Tài khoản Demo

| Vai trò (Role) | Email | Mật khẩu | Chức năng nổi bật |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@xivstudio.com` | `admin123` | KPI Dashboard, AI Chiến lược (UC010), Quản trị User, Cơ chế chặn xóa Admin duy nhất |
| **Employee** | `staff@xivstudio.com` | `staff123` | Quản lý kho hàng, Cảnh báo tồn kho $\le 10$, AI Sinh SEO (UC008), Quản lý 5 trạng thái đơn |
| **Customer** | `customer@gmail.com` | `customer123` | Mua sắm, VietQR Napas 247, Chat AI RAG, Tra cứu đơn hàng |

*(Hệ thống có hỗ trợ tính năng **1-Click Quick Role Switch** ngay trên Navbar và trang Đăng nhập để thuận tiện cho việc chấm bài / demo)*.

---

## 5. 📡 Danh sách API Endpoints Chính

| Module | Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Public | Đăng ký tài khoản |
| | `POST` | `/api/auth/login` | Public | Đăng nhập JWT |
| | `GET` | `/api/auth/me` | Authenticated | Lấy thông tin tài khoản hiện tại |
| **Products** | `GET` | `/api/products` | Public | Lấy danh sách sản phẩm (Filter, Search, Sort) |
| | `GET` | `/api/products/:id` | Public | Chi tiết sản phẩm theo ID hoặc SKU |
| | `POST` | `/api/products` | Employee, Admin | Thêm mới sản phẩm |
| | `PUT` | `/api/products/:id` | Employee, Admin | Cập nhật sản phẩm & tồn kho |
| | `DELETE` | `/api/products/:id` | Admin | Xóa sản phẩm |
| **Categories** | `GET` | `/api/categories` | Public | Lấy danh sách danh mục kèm số lượng sản phẩm |
| **Orders** | `POST` | `/api/orders` | Public / User | Đặt hàng mới (VietQR hoặc COD) |
| | `GET` | `/api/orders/my-orders` | Authenticated | Đơn hàng của tôi |
| | `GET` | `/api/orders/track/:code` | Public | Tra cứu đơn theo mã |
| | `PUT` | `/api/orders/:id/status`| Employee, Admin | Cập nhật trạng thái đơn (5 trạng thái) |
| | `GET` | `/api/orders/kpis` | Admin | Thống kê Dashboard KPI |
| **AI** | `POST` | `/api/ai/chat/stream` | Public | SSE Chatbot RAG Assistant |
| | `POST` | `/api/ai/generate-description` | Employee, Admin | AI Sinh mô tả chuẩn SEO |
| | `GET` | `/api/ai/strategic-analysis` | Admin | AI Báo cáo Chiến lược kinh doanh |
| **Users** | `GET` | `/api/users` | Admin | Quản lý danh sách người dùng |
| | `PUT` | `/api/users/:id/role` | Admin | Phân quyền (bảo vệ Admin duy nhất) |
| | `DELETE` | `/api/users/:id` | Admin | Xóa người dùng (chặn xóa Admin cuối cùng) |

---

## 6. 🛡️ Chuẩn bị Đẩy lên GitHub (DevOps Checklist)

Dự án đã được cấu hình các file chuẩn DevOps để sẵn sàng đẩy lên GitHub:
- [x] `.gitignore`: Loại bỏ toàn bộ `node_modules/`, `dist/`, `.env`, database binaries và file logs.
- [x] `.env.example`: Cung cấp file mẫu đầy đủ biến cấu hình.
- [x] `README.md`: Tài liệu hướng dẫn thiết lập từ A-Z.
- [x] Các Models Mongoose chuẩn hóa theo đúng yêu cầu đề tài.
