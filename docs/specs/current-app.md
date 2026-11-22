# HomeCare — App đang làm gì (kiểm chứng bằng thao tác thật) và sẽ làm gì

> Cập nhật 2026-11-22. Kết quả 3 lượt dùng thử app trên máy local, mỗi lượt một vai trò, có thao tác ghi (đặt lịch, thanh toán, đổi trạng thái, khóa tài khoản).
> Báo cáo chi tiết từng bước: [khách hàng](../testing/2026-11-22-khach-hang.md) · [kỹ thuật viên](../testing/2026-11-22-ky-thuat-vien.md) · [quản trị](../testing/2026-11-22-quan-tri.md).
> Hướng sản phẩm đã chốt: **sàn dịch vụ hai phía** (khách ↔ kỹ thuật viên, HomeCare là bên trung gian), **app Expo** cho khách và kỹ thuật viên (giống ≥ 90% prototype về màu, font, icon, chữ; bố cục theo điện thoại), **web** cho quản trị (web khách giữ làm kênh dự phòng). Hạn bảo vệ: cuối tháng 12/2026.

## 1. Hiện trạng kỹ thuật trong một câu

**Chỉ đăng nhập/đăng ký và Admin › Người dùng là thật.** Mọi màn nghiệp vụ (khách và kỹ thuật viên) chạy trên dữ liệu giả trong trình duyệt (`frontend/src/mocks/legacy-server.js`): không có request mạng, tải lại trang là mất dữ liệu, và **dữ liệu giữa các vai trò không thông nhau** (khách đặt lịch thì kỹ thuật viên không thấy).

Backend thật có đúng 10 endpoint, đều thuộc module `identity`: `health/live`, `health/ready`, `auth/register|login|refresh|logout|logout-all|me`, `GET admin/users`, `PATCH admin/users/:id/status`. Schema Prisma đã có đủ bảng cho các module khác nhưng chưa có API.

## 2. Khách hàng (web, 8 màn + đăng nhập)

| Màn                 | Làm được gì (đã thử)                                                                                        | Ghi chú                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Đăng nhập / Đăng ký | Đăng nhập bằng email; đăng ký tạo tài khoản thật (trùng email → 409)                                        | **Thật**                                                   |
| Quên mật khẩu       | Hiện "đã gửi hướng dẫn" sau 0,9 giây                                                                        | **Giả lập hoàn toàn**, không có API                        |
| Tổng quan           | Số thiết bị, cảnh báo, lịch sắp tới, thanh toán gần đây, lối tắt                                            | Thẻ số không cập nhật khi có booking mới                   |
| Vệ sinh             | 8 gói, 5 khung giờ trong **hôm nay**, địa chỉ, ghi chú → tạo booking                                        | Không chọn được ngày và thợ                                |
| Sửa chữa            | 8 nhóm sự cố, 3 mức khẩn, phòng, thiết bị, mô tả → báo giá tạm tính → tạo yêu cầu                           | Luôn "hôm nay" kể cả mức thường                            |
| Thiết bị            | Danh sách theo phòng, thêm thiết bị, tạo nhắc bảo trì, đánh dấu hoàn tất, "Đặt lịch" từ nhắc                | Điểm sức khỏe do **khách tự gõ**                           |
| Đặt lịch            | 19 dịch vụ, chọn ngày + giờ, **chọn thợ** (điểm, khoảng cách, số job; thợ bận bị khóa), add-on, mã giảm giá | Mã sai không báo lỗi                                       |
| Theo dõi            | Danh sách booking, chi tiết, "timeline" 2 dòng                                                              | Không có vị trí, không ETA                                 |
| Thanh toán          | Chọn hóa đơn, 1 trong 4 cổng (VNPay, MoMo, NAPAS, tiền mặt), OTP 6 số, lịch sử giao dịch                    | Mọi OTP đều đúng, luôn "Thành công"                        |
| Hồ sơ               | Xem/sửa tên, SĐT; địa chỉ, thống kê, lịch sử, phương thức thanh toán, 3 tùy chọn thông báo                  | Nút Thêm địa chỉ / vật dụng / phương thức **không làm gì** |
| Chuông              | 10 cập nhật tổng hợp từ dữ liệu tổng quan                                                                   | Không phải hệ thống thông báo                              |

### Luật giá đang có trên màn hình (không thống nhất)

| Màn        | Công thức                                                                    | Ví dụ "Vệ sinh máy lạnh 180.000đ"   |
| ---------- | ---------------------------------------------------------------------------- | ----------------------------------- |
| Vệ sinh    | giá + phí nền tảng 12.000                                                    | 192.000                             |
| Đặt lịch   | giá + add-on + phí nền tảng 15.000 − mã giảm (cố định 30.000)                | 195.000                             |
| Sửa chữa   | (phí kiểm tra + phụ phí khẩn + chẩn đoán 45.000) × 1,08 bảo hành             | Sửa điện: 286.200, khẩn cấp 437.400 |
| Thanh toán | tiền booking + 1,5% "bảo vệ thanh toán" + phí cổng (MoMo 2.500, NAPAS 1.500) | 237.000 → 243.055                   |

Số tiền đang do **trình duyệt tính và gửi lên** (`amount`), vi phạm quy tắc "server là nguồn sự thật".

### Trạng thái booking quan sát được

`Chờ xác nhận thanh toán` → `Đã thanh toán` (mọi cổng, kể cả tiền mặt, ngay lập tức). Khách **không hủy, không đổi lịch** được. Trạng thái là chuỗi tiếng Việt tự do, không có state machine.

## 3. Kỹ thuật viên (web `/technician`, 5 tab)

| Tab       | Làm được gì (đã thử)                                                               | Ghi chú                                                                                                   |
| --------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Tổng quan | Việc được phân công, lịch hôm nay, thu nhập dự kiến, số việc hoàn thành            | Thu nhập = 100% giá, chưa trừ hoa hồng                                                                    |
| Công việc | 4 job mẫu; Nhận / Từ chối / Đã nhận / Đang di chuyển / Đang thực hiện / Hoàn thành | **Không có luật chuyển**: nhảy cóc, lùi, mở lại job đã từ chối đều được                                   |
| Vị trí    | Bật chia sẻ → lấy GPS thật mỗi 5 giây                                              | Tọa độ **không gửi đi đâu**; khoảng cách là chữ cố định                                                   |
| Báo cáo   | 2 ô ảnh trước/sau (bắt buộc), ghi chú, checklist                                   | Ảnh lưu base64 trong RAM; checklist chỉ để xem; gửi lặp được; nút "Hoàn thành" ở tab Công việc bỏ qua ảnh |
| Hồ sơ     | Mã, khu vực, kinh nghiệm, chứng chỉ, điểm, nhận xét                                | Chỉ đọc, số liệu tĩnh                                                                                     |

Đăng nhập bằng mã (`TECH-088`) hoặc email đều được. **Job của thợ (HC-24xx) không gắn với booking nào của khách.** Thợ thấy **đầy đủ SĐT và số nhà của khách** kể cả job chưa nhận.

## 4. Quản trị (web `/admin`)

| Mục                                             | Trạng thái                                                                                                                                                                        |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Người dùng                                      | **Thật**: lọc vai trò, tìm theo tên/email/mã KTV, phân trang 10 dòng, khóa/mở khóa có **lý do bắt buộc** (ghi audit log); tài khoản bị khóa đăng nhập nhận "Tài khoản đã bị khóa" |
| Điều phối, Đối soát thanh toán, Bản đồ realtime | Nhãn "Đang phát triển — TV2/3/4", không bấm được                                                                                                                                  |

Bảo mật đã kiểm chứng: không token → 401; sai vai trò → 403; đăng xuất thu hồi token ngay; đăng ký kèm `role: ADMIN` bị từ chối; sai mật khẩu 5 lần → khóa tạm 15 phút.

Admin **chưa** làm được: xem booking, điều phối, thanh toán, hoàn tiền, quản lý dịch vụ/giá, tạo tài khoản kỹ thuật viên, xem audit log, xem số liệu.

## 5. Lỗi và rủi ro tìm thấy

| #   | Vấn đề                                                                                                          | Mức                | Xử lý                                                                |
| --- | --------------------------------------------------------------------------------------------------------------- | ------------------ | -------------------------------------------------------------------- |
| 1   | Khóa tạm theo tên đăng nhập, không theo IP: ai cũng khóa được tài khoản người khác 15 phút; admin không gỡ được | Cao (backend thật) | Sửa riêng trong `identity`                                           |
| 2   | Giá do trình duyệt tính, 4 công thức khác nhau                                                                  | Cao                | Báo giá phía server, một công thức                                   |
| 3   | Không có state machine cho booking và job                                                                       | Cao                | `booking.state.ts`                                                   |
| 4   | Thợ thấy SĐT, số nhà khách trước khi nhận việc                                                                  | Cao                | API chỉ trả địa chỉ đầy đủ sau khi nhận; liên lạc qua chat trong app |
| 5   | Hoàn thành job không cần ảnh, báo cáo gửi lặp                                                                   | Trung bình         | Kiểm tra ở server + idempotency                                      |
| 6   | Thanh toán luôn thành công, OTP nào cũng đúng                                                                   | Trung bình         | payment-sandbox                                                      |
| 7   | Đặt lịch xong chuyển trang bằng tải lại → mất booking vừa tạo (chỉ xảy ra với mock)                             | Thấp               | Tự hết khi có API thật                                               |
| 8   | Quên mật khẩu giả lập                                                                                           | Trung bình         | API + email thật                                                     |
| 9   | Web trên điện thoại: không có menu điều hướng, KTV không có nút Đăng xuất, Tổng quan tràn ngang                 | Thấp               | Giao diện prototype; trên điện thoại dùng app                        |

## 6. Tính năng: đã có và sẽ làm

Ký hiệu: ✅ thật · 🟡 có giao diện, dữ liệu giả · ⬜ chưa có. Cột "Epic" khớp với epic trên Jira.

| Nhóm                | Tính năng                                                                     | Hiện tại | Sẽ làm                                                                                                                | Epic                 |
| ------------------- | ----------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Tài khoản           | Đăng ký, đăng nhập (email / mã KTV), refresh token, đăng xuất, khóa tài khoản | ✅       | Sửa lỗi khóa tạm, quên/đổi mật khẩu, đăng nhập vân tay/Face ID trên app                                               | Tài khoản & hồ sơ    |
| Hồ sơ               | Thông tin, địa chỉ, phương thức thanh toán                                    | 🟡       | API thật, địa chỉ có tọa độ (lấy từ GPS)                                                                              | Tài khoản & hồ sơ    |
| Thiết bị            | Danh sách, nhắc bảo trì, lịch sử                                              | 🟡       | API thật, **tem QR trên thiết bị**, nhắc bảo trì tự động                                                              | Thiết bị & QR        |
| Dịch vụ & giá       | 19 dịch vụ, add-on, mức khẩn, mã giảm                                         | 🟡       | Catalog thật, **một công thức giá tính ở server**                                                                     | Catalog & booking    |
| Đặt lịch            | Tạo booking, chọn thợ                                                         | 🟡       | State machine, hủy/đổi lịch, chống trùng lịch thợ, Idempotency-Key                                                    | Catalog & booking    |
| Điều phối           | —                                                                             | ⬜       | Tự gán thợ theo khoảng cách/kỹ năng/điểm, offer có hạn                                                                | Điều phối & gợi ý    |
| Gợi ý theo ngữ cảnh | Cảnh báo cứng ("90 ngày chưa vệ sinh")                                        | 🟡       | Gợi ý theo vị trí, thời tiết, thiết bị, xu hướng khu vực + push chủ động; bản đồ nhiệt cho admin                      | Điều phối & gợi ý    |
| Thanh toán          | 4 cổng, OTP, lịch sử                                                          | 🟡       | payment-sandbox (thẻ + OTP 3-D Secure, VietQR), **giữ tiền đến khi khách xác nhận**, hoàn tiền, hoa hồng/thu nhập thợ | Thanh toán kiểu sàn  |
| Theo dõi            | Danh sách booking                                                             | 🟡       | Vị trí thợ realtime qua Socket.IO, ETA, geofence "đã đến", timeline đầy đủ                                            | Realtime & app thợ   |
| App thợ             | 5 tab web                                                                     | 🟡       | App Expo: nhận việc, GPS nền, ảnh lên MinIO, cập nhật offline                                                         | Realtime & app thợ   |
| Thông báo           | Chuông tổng hợp                                                               | 🟡       | In-app + push + email                                                                                                 | Realtime & app thợ   |
| AI                  | —                                                                             | ⬜       | Agent đặt lịch bằng chat, MCP server                                                                                  | AI agent & MCP       |
| CSKH                | —                                                                             | ⬜       | Chat hỗ trợ (bot → nhân viên), khiếu nại gắn booking, chat khách–thợ, hotline                                         | CSKH & khiếu nại     |
| Admin               | Người dùng                                                                    | ✅       | Điều phối, đối soát, hỗ trợ, quản lý KTV, audit log                                                                   | Admin console        |
| Vận hành            | Load balancer 3 replica, CI/CD, Grafana                                       | ✅       | Server staging cho điện thoại gọi tới, release, k6                                                                    | Nền tảng & phát hành |
