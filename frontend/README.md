# Cấu trúc Frontend - Chopsticks

## Tổng quan dự án
- **Tên dự án**: Chopsticks
- **Mô tả**: Hệ thống quản lý nhập hàng & tạo hóa đơn
- **Công nghệ**: React + Vite + Tailwind CSS + shadcn + Axios

## Cấu trúc thư mục

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                              (Shadcn UI Components)
│   │   │   ├── button.jsx                   ✅
│   │   │   ├── card.jsx                     ✅
│   │   │   ├── input.jsx                    ✅
│   │   │   ├── textarea.jsx                 ✅
│   │   │   ├── badge.jsx                    ✅
│   │   │   ├── dialog.jsx                   ✅
│   │   │   ├── pagination.jsx               ✅
│   │   │   ├── label.jsx                    ✅
│   │   │   ├── sheet.jsx                    ✅
│   │   │   ├── alert.jsx                    ✅
│   │   │   ├── table.jsx                    ✅
│   │   │   ├── select.jsx                   ✅
│   │   │   ├── checkbox.jsx                 ✅
│   │   │   ├── dropdown.jsx                 ✅
│   │   │   └── tabs.jsx                     ✅
│   │   ├── inventory/                       (Quản lý hàng hóa)
│   │   │   ├── TotalInventory.jsx           ✅ (Hàng hóa tổng)
│   │   │   ├── SalesInventory.jsx           ✅ (Hàng hóa bán)
│   │   │   ├── ProductForm.jsx              ✅ (Form tổng)
│   │   │   ├── SalesProductForm.jsx         ✅ (Form bán)
│   │   │   ├── SalesProductTable.jsx        ✅ (Bảng bán)
│   │   │   ├── BoxForm.jsx                  ✅ (Form box)
│   │   │   ├── BoxManagement.jsx            ✅ (Quản lý box)
│   │   │   └── README.md                    ✅ (Hướng dẫn)
│   │   ├── Header.jsx                       ✅
│   │   ├── Footer.jsx                       ✅
│   │   └── Navigation.jsx                   ✅
│   ├── pages/
│   │   ├── HomePage.jsx                     ✅
│   │   ├── ProductManagementPage.jsx        ✅ (Quản lý hàng hóa)
│   │   └── NotFound.jsx                     ✅
│   ├── context/
│   │   └── AppContext.jsx                   ✅
│   ├── lib/
│   │   ├── utils.js                         ✅
│   │   ├── axios.js                         ✅
│   │   ├── data.js                          ✅
│   │   ├── hooks.js                         ✅
│   │   └── helpers.js                       ✅
│   ├── App.jsx                              ✅
│   ├── main.jsx                             ✅
│   └── index.css                            ✅
├── index.html                               ✅
├── package.json                             ✅
├── vite.config.js                           ✅
├── tailwind.config.js                       ✅
├── eslint.config.js                         ✅
├── .eslintrc.cjs                            ✅
└── .gitignore                               ✅
```

## Components UI được tạo

1. **Button** - Nút bấm với nhiều variants (default, outline, ghost, destructive, gradient)
2. **Card** - Thẻ hiển thị thông tin (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
3. **Input** - Input text cơ bản
4. **Textarea** - Vùng nhập text dài
5. **Badge** - Nhãn với nhiều variants (default, secondary, destructive, success, info)
6. **Dialog** - Hộp thoại (Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription)
7. **Pagination** - Phân trang
8. **Label** - Nhãn cho input
9. **Sheet** - Bảng điều khiển bên (sidebar)
10. **Alert** - Thông báo cảnh báo
11. **Table** - Bảng dữ liệu
12. **Select** - Dropdown chọn
13. **Checkbox** - Hộp kiểm
14. **Dropdown** - Menu thả xuống
15. **Tabs** - Các tab điều hướng

## Pages được tạo

### 1. HomePage ✅
- Bảng điều khiển chính với menu nhanh
- Route: `/`
- Các tùy chọn: Quản lý hàng hóa, Tạo đơn nhập, Tạo hóa đơn, Báo cáo thống kê

### 2. ProductManagementPage ✅
- Quản lý hàng hóa tổng và hàng hóa bán
- Route: `/products`
- Có 2 tab: Quản lý hàng hóa tổng & Quản lý hàng hóa bán

#### Tab 1: Quản lý hàng hóa tổng
- Danh sách tất cả sản phẩm
- Hiển thị: Tên, Số lượng, Giá nhập, Giá bán
- Chức năng: Thêm, Sửa, Xóa sản phẩm
- Tìm kiếm sản phẩm

#### Tab 2: Quản lý hàng hóa bán
- **Subtab 1: Sản phẩm bán**
  - Chọn sản phẩm từ hàng hóa tổng
  - Gán loại bán: Bán lẻ 🔵, Bán combo 🟣, Bán box 🟢
  - Giá tuỳ chỉnh (tùy chọn)
  - Chức năng: Thêm, Sửa, Xóa

- **Subtab 2: Quản lý Box**
  - Tạo box kết hợp nhiều sản phẩm bán
  - Chọn sản phẩm và số lượng trong mỗi box
  - Đặt giá box
  - Chức năng: Tạo, Sửa, Xóa, Bán box
  - **Khi bán box**: Số lượng sản phẩm trong hàng hóa tổng tự động giảm

## Các tệp cấu hình chính

- **package.json** - Dependencies và scripts
- **vite.config.js** - Cấu hình Vite với Tailwind CSS
- **tailwind.config.js** - Cấu hình Tailwind CSS (colors, animations, etc.)
- **index.css** - CSS variables và base styles
- **eslint.config.js** - ESLint configuration

## Utility Functions

### trong `lib/hooks.js`
- `useForm()` - Hook quản lý form state
- `useFetch()` - Hook fetch dữ liệu
- `formatCurrency()` - Format tiền VND
- `formatDate()` - Format ngày tháng
- `formatDateTime()` - Format ngày giờ

### trong `lib/helpers.js`
- `handleApiError()` - Xử lý lỗi API
- `validateEmail()` - Kiểm tra email
- `validatePhone()` - Kiểm tra số điện thoại
- `validateRequired()` - Kiểm tra bắt buộc
- `validateMinLength()` - Kiểm tra độ dài tối thiểu
- `validateMaxLength()` - Kiểm tra độ dài tối đa
- `validateNumber()` - Kiểm tra số
- `debounce()` - Debounce function
- `filterArray()` - Lọc mảng
- `sortArray()` - Sắp xếp mảng

## Hướng nhanh để chạy dự án

```bash
# 1. Cài đặt dependencies
npm install

# 2. Chạy dev server
npm run dev

# 3. Build cho production
npm run build

# 4. Kiểm tra linter
npm run lint
```

## Hướng tiếp tục

### Các trang cần tạo tiếp:
- [ ] Trang Quản lý nhà cung cấp (Suppliers)
- [ ] Trang Tạo đơn nhập hàng (Import Orders)
- [ ] Trang Tạo hóa đơn bán (Invoices)
- [ ] Trang Báo cáo thống kê (Reports)
- [ ] Trang Đăng nhập/Xác thực (Login/Auth)

### API Endpoints cần tạo ở backend:
```
# Hàng hóa tổng
GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id

# Sản phẩm bán
GET    /api/sales-products
POST   /api/sales-products
PUT    /api/sales-products/:id
DELETE /api/sales-products/:id

# Box
GET    /api/boxes
POST   /api/boxes
PUT    /api/boxes/:id
DELETE /api/boxes/:id
POST   /api/boxes/:id/sell (trừ kho)
```

## Liên hệ hỗ trợ
Nếu cần hỗ trợ:
1. Kiểm tra console (F12) để xem lỗi
2. Kiểm tra API backend có chạy không
3. Xem hướng dẫn chi tiết tại `src/components/inventory/README.md`
