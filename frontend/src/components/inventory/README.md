# Hướng dẫn Page Quản lý hàng hóa

## 1. Tổng quan
Page Quản lý hàng hóa có 2 tab chính:
- **Quản lý hàng hóa tổng**: Danh sách tất cả sản phẩm trong kho
- **Quản lý hàng hóa bán**: Chọn sản phẩm bán và tạo box

## 2. Quản lý hàng hóa tổng

### Thông tin sản phẩm
Mỗi sản phẩm gồm:
- **Tên sản phẩm**: Tên đặc trưng
- **Số lượng**: Tổng lượng hàng trong kho
- **Giá nhập**: Giá mua từ nhà cung cấp
- **Giá bán**: Giá bán cho khách hàng
- **Đơn vị**: Cái, hộp, kg, lít, gói
- **Danh mục**: Phân loại sản phẩm (Tùy chọn)
- **Mô tả**: Chi tiết về sản phẩm (Tùy chọn)

### Chức năng
- ✅ Thêm sản phẩm mới
- ✅ Sửa thông tin sản phẩm
- ✅ Xóa sản phẩm
- ✅ Tìm kiếm sản phẩm theo tên
- ✅ Hiển thị danh sách dạng bảng

## 3. Quản lý hàng hóa bán

### 3.1 Tab: Sản phẩm bán

#### Thông tin sản phẩm bán
Khi thêm sản phẩm bán, cần:
- **Chọn sản phẩm**: Từ danh sách hàng hóa tổng
- **Loại bán**:
  - 🔵 **Bán lẻ** - Bán từng cái
  - 🟣 **Bán combo** - Kết hợp nhiều sản phẩm
  - 🟢 **Bán box** - Sản phẩm được nhóm trong box
- **Giá tuỳ chỉnh** (Tùy chọn): Nếu khác giá gốc

#### Chức năng
- ✅ Thêm sản phẩm bán
- ✅ Sửa loại bán hoặc giá
- ✅ Xóa sản phẩm bán
- ✅ Tìm kiếm sản phẩm

### 3.2 Tab: Quản lý Box

#### Khái niệm Box
Box là tập hợp nhiều sản phẩm bán với:
- **Tên box**: VD "Box Café Sáng", "Box Quà Tặng"
- **Giá box**: Giá tổng của cả box
- **Danh sách sản phẩm**: Các sản phẩm bán được chọn
- **Số lượng mỗi sản phẩm**: Bao nhiêu cái sản phẩm trong 1 box
- **Mô tả** (Tùy chọn): Chi tiết về box

#### Cơ chế giảm kho
Khi bán **1 cái box**:
- Số lượng của mỗi sản phẩm trong box ở **Quản lý hàng hóa tổng** sẽ **giảm** theo số lượng trong box

**Ví dụ:**
- Box "Café Sáng" chứa:
  - Cà phê rang xay x2 (giảm 2 cái)
  - Sữa đặc x1 (giảm 1 cái)
  - Dê sy x3 (giảm 3 cái)
- Khi bán 1 box → Kho hàng tổng sẽ trừ: 2 cà phê + 1 sữa + 3 dê sy

#### Chức năng
- ✅ Tạo box mới
- ✅ Sửa box
- ✅ Bán box (trừ kho tự động)
- ✅ Xóa box
- ✅ Xem chi tiết box (nội dung)

## 4. Cấu trúc File

```
src/
├── pages/
│   └── ProductManagementPage.jsx          (Page chính)
├── components/
│   ├── Navigation.jsx                     (Điều hướng)
│   └── inventory/
│       ├── TotalInventory.jsx             (Hàng hóa tổng)
│       ├── SalesInventory.jsx             (Hàng hóa bán)
│       ├── ProductForm.jsx                (Form thêm/sửa sản phẩm tổng)
│       ├── SalesProductForm.jsx           (Form thêm sản phẩm bán)
│       ├── SalesProductTable.jsx          (Bảng sản phẩm bán)
│       ├── BoxForm.jsx                    (Form tạo/sửa box)
│       └── BoxManagement.jsx              (Quản lý box)
```

## 5. API Endpoints (cần tạo ở backend)

### Hàng hóa tổng
- `GET /api/products` - Lấy danh sách sản phẩm
- `POST /api/products` - Thêm sản phẩm
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

### Sản phẩm bán
- `GET /api/sales-products` - Lấy danh sách sản phẩm bán
- `POST /api/sales-products` - Thêm sản phẩm bán
- `PUT /api/sales-products/:id` - Cập nhật sản phẩm bán
- `DELETE /api/sales-products/:id` - Xóa sản phẩm bán

### Box
- `GET /api/boxes` - Lấy danh sách box
- `POST /api/boxes` - Tạo box
- `PUT /api/boxes/:id` - Cập nhật box
- `DELETE /api/boxes/:id` - Xóa box
- `POST /api/boxes/:id/sell` - Bán box (trừ kho)

## 6. Flow - Quy trình sử dụng

```
1. Nhập hàng → Quản lý hàng hóa tổng
   ├─ Thêm sản phẩm mới
   └─ Cập nhật số lượng, giá

2. Chuẩn bị bán → Quản lý hàng hóa bán
   ├─ Thêm sản phẩm bán (chọn từ hàng tổng)
   ├─ Đặt giá tuỳ chỉnh (nếu cần)
   └─ Đánh dấu loại bán (lẻ/combo/box)

3. Tạo Box → Tab Quản lý Box
   ├─ Chọn sản phẩm bán
   ├─ Số lượng mỗi sản phẩm trong box
   └─ Đặt giá box

4. Bán hàng
   ├─ Bán lẻ: Bán sản phẩm từ danh sách
   ├─ Bán combo: Chọn nhiều sản phẩm
   └─ Bán box: Bán box → Tự động trừ hàng tổng
```

## 7. Ví dụ thực tế

### Kịch bản: Cửa hàng Café

**Bước 1: Nhập hàng tổng**
| Tên | Số lượng | Giá nhập | Giá bán |
|-----|---------|---------|--------|
| Cà phê rang xay | 100 | 50,000 | 80,000 |
| Sữa đặc | 50 | 30,000 | 50,000 |
| Dê sy | 200 | 10,000 | 20,000 |

**Bước 2: Thêm vào hàng hóa bán**
- Cà phê rang xay → Bán lẻ → Giá 80,000
- Sữa đặc → Bán lẻ → Giá 50,000
- Dê sy → Bán lẻ → Giá 20,000

**Bước 3: Tạo Box "Café Sáng"**
- Giá box: 150,000
- Nội dung:
  - Cà phê rang xay x2
  - Sữa đặc x1
  - Dê sy x3

**Bước 4: Bán**
- Bán 1 box "Café Sáng" → Kho sẽ giảm:
  - Cà phê: 100 → 98
  - Sữa đặc: 50 → 49
  - Dê sy: 200 → 197

---

## 8. Hỗ trợ

Nếu có vấn đề:
- Kiểm tra console (F12) để xem lỗi
- Kiểm tra API backend có chạy không
- Kiểm tra dữ liệu gửi/nhận có đúng format
