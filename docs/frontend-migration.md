# Giao diện: dùng lại 1:1 bản cũ + dữ liệu giả

> Đọc file này trước khi đụng vào bất kỳ màn hình nào trong `frontend/`.

## 1. Yêu cầu

**Giao diện phải giống y hệt bản prototype** (`legacy/web`), coi như yêu cầu của khách hàng: không tự thêm, bớt hay "làm đẹp" bất cứ chi tiết nào (màu, chữ, khoảng cách, icon, thứ tự phần tử).

Giai đoạn hiện tại **chưa nối frontend với các module backend nghiệp vụ**: các màn hình chạy bằng **dữ liệu giả** lấy đúng từ bản cũ. Riêng đăng nhập dùng backend thật (module identity đã xong).

## 2. Hiện trạng

| Phần                   | Trạng thái                                                                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trang đăng nhập        | Giao diện cũ (`portal/RootShell.jsx`): Đăng nhập / Đăng ký / Quên mật khẩu. Đăng nhập, đăng ký đi qua API thật; quên mật khẩu vẫn mô phỏng như bản cũ |
| Khung khách hàng       | Sidebar, header, chuông thông báo, menu người dùng của `customer/App.jsx`                                                                             |
| 8 màn hình khách hàng  | Tổng quan, Vệ sinh, Sửa chữa, Thiết bị, Đặt lịch, Theo dõi, Thanh toán, Hồ sơ — dữ liệu giả                                                           |
| Màn hình kỹ thuật viên | `features/technician` — dữ liệu giả, đăng nhập bằng mã `TECH-088` ở trang đăng nhập chung                                                             |
| Admin › Người dùng     | **Mới** (bản cũ không có), dữ liệu thật                                                                                                               |

## 3. Đã kiểm chứng "giống y hệt" như thế nào

Chạy bản cũ (`legacy/web` + `legacy/backend`) và bản mới cạnh nhau, đăng nhập cùng tài khoản mẫu, rồi so **HTML của từng màn hình** (sau khi xếp thuộc tính HTML theo cùng thứ tự, vì React 19 ghi thuộc tính theo thứ tự khác React 18) và **màu nền, font** của trang:

- 11/11 màn hình trùng khớp hoàn toàn: đăng nhập, 8 màn hình khách hàng, trang 404, kỹ thuật viên.
- Màu nền và font trùng ở mọi màn hình (kể cả chi tiết bản cũ đổi font sang Inter sau khi mở màn hình nghiệp vụ đầu tiên).

Muốn kiểm tra lại sau khi sửa: `diff` file trong `frontend/src` với file gốc trong `legacy/web/src` (bảng mục 4). Các file này **không chạy qua Prettier** để `diff` chỉ ra đúng những dòng đã đổi.

## 4. Đã thay đổi gì so với bản cũ (chỉ phần "đường ống", không đụng giao diện)

| File mới (`frontend/src/…`)              | File gốc (`legacy/web/src/…`)                                 | Thay đổi                                                                                                                     |
| ---------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `features/<tên>/<Tên>Page.jsx` (×8)      | `features/<tên>/<Tên>App.jsx`, `customer/pages/Dashboard.jsx` | `fetch(${API_BASE_URL}…)` → `apiFetch('…')`; bỏ token trong `localStorage`; `react-router-dom` → `react-router`; thêm `TODO` |
| `features/technician/TechnicianPage.jsx` | `features/technician/TechnicianApp.jsx`                       | Như trên + bỏ form đăng nhập riêng (dùng trang đăng nhập chung)                                                              |
| `layouts/CustomerLayout.jsx`             | `customer/App.jsx`                                            | Đăng nhập/đăng xuất qua `useAuth()`; `<Outlet />` thay cho bộ định tuyến cũ                                                  |
| `pages/LoginPage.jsx`                    | `portal/RootShell.jsx`                                        | Đăng nhập/đăng ký qua `useAuth()`; phần giao diện trùng 100%                                                                 |
| `pages/NotFound.jsx`                     | `customer/pages/NotFound.jsx`                                 | Không đổi                                                                                                                    |
| `index.css`, `**/index.css`              | các file CSS tương ứng                                        | Không đổi (thứ tự nạp CSS giữ như bản cũ)                                                                                    |

Thư viện được **ghim đúng phiên bản bản cũ**: `tailwindcss 3.4.19`, `lucide-react 1.71.0` (Tailwind 4 có bảng màu khác, lucide bản khác có thể đổi nét icon). **Không nâng cấp hai thư viện này** nếu chưa so lại giao diện như mục 3.

## 5. Dữ liệu giả (mock API)

- `frontend/src/mocks/seed.json` — bản sao nguyên vẹn `legacy/backend/data/db.json`.
- `frontend/src/mocks/legacy-server.js` — chép lại từng route của `legacy/backend/src/server.js` (cùng logic, cùng dạng dữ liệu, cùng thông báo lỗi), chạy ngay trong trình duyệt.
- `apiFetch()` (`frontend/src/lib/api-client.ts`) hỏi mock trước; route nào mock không có thì gọi backend thật.
- Người đăng nhập được ghép với dữ liệu mẫu theo email (`khang.nguyen@example.com`, `linh.tran@example.com`) hoặc mã KTV (`TECH-088`). Tài khoản mới đăng ký thấy dữ liệu trống.
- Dữ liệu sửa trong phiên (đặt lịch, thanh toán…) nằm trong bộ nhớ, **tải lại trang là về như ban đầu**.
- Tắt toàn bộ mock: build/chạy với `VITE_USE_MOCKS=false`.
- Test: `pnpm --filter @homecare/frontend test`.

## 6. Khi làm API thật cho một màn hình (bước sau)

1. Làm API trong module của mình (skill `nest-module`), **trả về đúng dạng dữ liệu** mà route tương ứng trong `mocks/legacy-server.js` đang trả, để giao diện không phải sửa.
2. Xóa route đó khỏi `mocks/legacy-server.js` → `apiFetch` tự gọi API thật.
3. Xử lý các `TODO` của màn hình (mục 7).
4. So lại giao diện với bản cũ (mục 3) trước khi mở PR.

| Màn hình                     | Route mock đang phục vụ                                                                                     | Người phụ trách |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------- |
| Tổng quan + chuông thông báo | `GET /dashboard`                                                                                            | TV1             |
| Thiết bị & nhắc bảo trì      | `/devices`, `/reminders` (+ đọc `/bookings`, `/dashboard`)                                                  | TV1             |
| Hồ sơ                        | `/profile`, `/payment-methods`, `/profile-options`                                                          | TV1             |
| Vệ sinh, Sửa chữa, Đặt lịch  | `/services`, `/booking-options`, `/repair-options`, `/technicians`, `/technician-availability`, `/bookings` | TV2             |
| Thanh toán                   | `/payments`, `/payment-gateways`                                                                            | TV3             |
| Theo dõi                     | đọc `/bookings`, `/dashboard` (+ realtime mới)                                                              | TV4             |
| Kỹ thuật viên                | `/technician/dashboard`, `/technician/jobs/…`, `/technician/location`                                       | TV4             |

## 7. Những chỗ API thật phải làm khác bản cũ (đã đánh dấu `TODO` trong code)

Mock giữ nguyên hành vi bản cũ để giao diện chạy y hệt. Nhưng **API thật không được lặp lại các lỗ hổng sau** (vi phạm CLAUDE.md, reviewer sẽ không duyệt):

1. **Giá tiền do server tính.** Bản cũ gửi `amount: total` từ trình duyệt (`BookingPage.jsx`, `CleaningPage.jsx`, `RepairPage.jsx`, `PaymentPage.jsx` — tìm `TODO(owner)`). API thật bỏ qua số này, tự tính từ bảng giá; màn hình hiện con số server trả về.
2. **Không nhận tên kỹ thuật viên hay trạng thái từ trình duyệt** (`BookingPage.jsx`, `TODO(TV2)`): nhận `technicianId` hoặc để dispatch gán; trạng thái đi qua state machine.
3. **Thanh toán qua cổng giả lập thật** (`payment-sandbox`, [ADR-0003](adr/0003-mock-vnpay-gateway.md)); chỉ IPN có chữ ký hợp lệ mới ghi nhận đã thanh toán. Giao diện chọn phương thức giữ nguyên.
4. **Vị trí kỹ thuật viên qua Socket.IO** thay vì `POST /technician/location` mỗi 5 giây; server kiểm tra KTV có đang được gán booking đó ([ADR-0005](adr/0005-load-balancing-realtime.md)).
5. **Không bao giờ tự đọc/ghi token**; mọi lời gọi qua `apiFetch()` / `api()`.

## 8. Màn hình kỹ thuật viên: web hay app Expo? (cần nhóm quyết định)

Bản web cũ đã chạy ở `/technician`, giống y hệt bản prototype.

|                       | Giữ bản web (`TechnicianPage.jsx`)      | Làm app Expo (`mobile/`)              |
| --------------------- | --------------------------------------- | ------------------------------------- |
| Công sức              | Không thêm                              | Nhiều: viết lại giao diện cho di động |
| GPS                   | Chỉ chạy khi đang mở trang              | Chạy nền cả khi tắt màn hình          |
| Camera, thông báo đẩy | Chụp ảnh qua trình duyệt, không có push | Đầy đủ                                |

Gợi ý: dùng bản web cho MVP; nếu làm Expo thì giao diện cũng phải theo đúng bản web hiện có.
