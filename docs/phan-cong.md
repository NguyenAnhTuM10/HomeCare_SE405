# Phân công theo gói — để cả nhóm vote

> Chốt ngày 22/11/2026. Mỗi người nhận **một gói** và làm **trọn từ backend đến màn hình** (API, bảng DB, màn app/web, test, phần báo cáo của gói).
> Lead giữ gói **Lead**. Ba người còn lại vote chọn **gói A, B, C**. Mã việc là mã trên Jira (project HC).

## 1. Những điều đã chốt

1. **Backend mới chỉ có tài khoản là thật** (đăng nhập, đăng ký, phân quyền, admin khóa người dùng). Mọi API nghiệp vụ còn phải làm; mỗi gói làm API của phần mình.
2. **App Expo (`mobile/`) là kênh duy nhất cho khách và thợ.** Giao diện giống ≥ 90% prototype (màu, font, icon, câu chữ; bố cục theo điện thoại).
3. **Web chỉ còn cho admin sàn.** Các màn web của khách và thợ được **đóng băng**: không nối API, không sửa, giữ làm bản tham chiếu giao diện cùng `legacy/`. Vì vậy **API thiết kế cho app**, không cần trả đúng dạng dữ liệu của mock.
4. Phần nào làm xong API thì app dùng ngay; mock của web không cần xóa từng route (cuối kỳ ẩn hẳn màn khách/thợ khỏi web, việc HC-73).
5. Tính năng cần đạt và chủ đề seminar: mục "Sản phẩm khi hoàn thành" trong [README](../README.md#sản-phẩm-khi-hoàn-thành-cuối-122026--nhóm-bám-theo-phần-này).

## 2. Bốn gói

| Gói                                 | Chủ đề seminar                                                                            | Điểm cốt lõi | Đợt 1 / 2 / 3 |
| ----------------------------------- | ----------------------------------------------------------------------------------------- | ------------ | ------------- |
| **Lead** — Thanh toán & AI          | Mobile Payment & Fintech · ChatBot / AI (agent, MCP)                                      | 54           | 16 / 24 / 22  |
| **A** — Đặt lịch, điều phối & gợi ý | Location-based (điều phối theo khoảng cách, gợi ý theo vị trí và thời tiết)               | 57           | 29 / 25 / 6   |
| **B** — App thợ & realtime          | WebSocket / Realtime · Location-based (GPS, geofence) · Load balancer (realtime chéo máy) | 53           | 20 / 25 / 19  |
| **C** — Tài khoản, thiết bị & CSKH  | Authentication & Authorization (vân tay/Face ID) · QR code · CSKH (bot → nhân viên)       | 61           | 21 / 32 / 8   |

Điểm cốt lõi không tính việc "[Nếu kịp]". Gói A nặng ở đợt 1 vì booking là nền cho mọi gói khác; gói C nặng ở đợt 2.

### Gói Lead — Thanh toán & AI

- **Trên app:** màn thanh toán (mở cổng giả lập, quay về app), lưu thẻ trả một chạm bằng vân tay, màn chat đặt lịch với AI, màn thu nhập của thợ.
- **Backend:** `payment-sandbox/` (thẻ test, OTP, ký HMAC, IPN), module `payments` (giao dịch, IPN chỉ ghi nhận 1 lần, hết hạn 15 phút, giữ tiền → giải ngân, hoàn tiền, hoa hồng), module `assistant` (agent Claude gọi công cụ của hệ thống) và MCP server.
- **Admin web:** Đối soát (giao dịch, IPN, hoàn tiền).
- **Việc:** HC-15 (đang làm), HC-19, HC-36, HC-38 · HC-53, HC-57, HC-58, HC-61, HC-62 · HC-74, HC-75, HC-77, _màn thu nhập (mới)_ · [Nếu kịp] HC-80, HC-84, _nhập bằng giọng nói (mới)_.

### Gói A — Đặt lịch, điều phối & gợi ý

- **Trên app:** luồng đặt lịch (gộp Vệ sinh, Sửa chữa, Đặt lịch), mục "Gợi ý cho bạn" kèm lý do, hủy/đổi lịch.
- **Backend:** module `catalog` (dịch vụ, add-on, mức khẩn, báo giá **một công thức ở server**), `booking` (state machine, Idempotency-Key, chống trùng lịch thợ), `dispatch` (tự gán thợ theo khoảng cách/kỹ năng/điểm, offer có hạn), `recommendation` (vị trí, thời tiết, thiết bị, xu hướng khu vực) + push gợi ý.
- **Admin web:** Điều phối (gán tay thợ); bản đồ nhiệt nếu kịp.
- **Việc:** HC-17, HC-18, HC-29, HC-31, HC-33, HC-37 · HC-41, HC-43, HC-48, HC-51, HC-56, HC-60 · HC-71 · [Nếu kịp] HC-79.

### Gói B — App thợ & realtime

- **Trên app:** app thợ (danh sách việc, nhận/từ chối, đổi trạng thái, chụp ảnh trước/sau), push có nút Nhận/Từ chối, bản đồ theo dõi thợ + ETA cho khách, chat khách–thợ, nút gọi hotline.
- **Backend:** Socket.IO gateway + Redis adapter (dùng chung cho theo dõi, chat, thông báo), module `technician` (việc = booking được gán), `tracking` (vị trí, chống GPS giả, ETA, geofence "đã đến"), `notifications` (in-app, push, email), ảnh lên MinIO, simulator thợ để demo.
- **Admin web:** bản đồ realtime nếu kịp.
- **Việc:** HC-24, HC-28, HC-30, HC-34, HC-35 · HC-44, HC-45, HC-47, HC-49, HC-52, HC-54, _push có nút Nhận/Từ chối (mới)_ · HC-67, HC-72 · [Nếu kịp] HC-81, HC-82, HC-83.

### Gói C — Tài khoản, thiết bị & CSKH

- **Trên app:** đăng ký, đăng nhập lại bằng vân tay/Face ID, trang chủ khách, hồ sơ và địa chỉ (lấy vị trí GPS), thiết bị, quét tem QR, chat hỗ trợ và mở khiếu nại.
- **Backend:** sửa lỗi khóa tạm đăng nhập, quên/đổi mật khẩu, module `profile` (hồ sơ, địa chỉ, thiết bị, nhắc bảo trì, tem QR), API tổng quan cho trang chủ, module `support` (ticket, chat hỗ trợ, khiếu nại gắn tiền; bot dùng agent của gói Lead).
- **Admin web:** Kỹ thuật viên (tạo tài khoản mã TECH), Hỗ trợ (hàng đợi, xử lý khiếu nại), Audit log.
- **Việc:** HC-16, HC-21, HC-22, HC-23, HC-32, _đăng ký trên app (mới)_ · HC-42, HC-46, HC-50, HC-55, HC-59, HC-63, _trang chủ + API tổng quan (mới)_, _chat hỗ trợ và khiếu nại trên app (mới)_ · HC-69, HC-70, HC-78.

### Việc chung (cả nhóm, lead điều phối)

HC-13 (ADR-0008), HC-14 (tunnel cho điện thoại), HC-20 (tag v0.1.0), HC-25 (CODEOWNERS), HC-27 (quy ước giao diện app), HC-40 (server staging + CD), HC-39 / HC-64 / HC-85 (release), HC-65, HC-66 (demo, báo cáo), HC-68 (đo tải k6 + Grafana), HC-73 (ẩn màn khách/thợ khỏi web), HC-76 (E2E luồng chính). HC-26 (Dependabot) đã xong.

## 3. Mock cũ thuộc gói nào

Danh sách để biết dữ liệu giả nào đã có API thật thay thế.

| Route mock                                                                                                  | Gói  |
| ----------------------------------------------------------------------------------------------------------- | ---- |
| `/services`, `/booking-options`, `/repair-options`, `/technicians`, `/technician-availability`, `/bookings` | A    |
| `/technician/me`, `/technician/dashboard`, `/technician/jobs`, `/technician/location`                       | B    |
| `/profile`, `/profile-options`, `/payment-methods`, `/devices`, `/reminders`, `/dashboard`                  | C    |
| `/payments`, `/payment-gateways`                                                                            | Lead |

## 4. Chỗ các gói nối với nhau (chốt trong tuần đầu)

| Giữa     | Cần thống nhất                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------ |
| A ↔ Lead | Thanh toán lấy số tiền từ booking; sự kiện `payment.succeeded` chuyển booking sang đã thanh toán |
| A ↔ B    | Bảng trạng thái booking; booking nào gán cho thợ nào; sự kiện đổi trạng thái để phát realtime    |
| Lead ↔ C | Khiếu nại chặn giải ngân và gọi hoàn tiền; bot hỗ trợ dùng chung agent của gói Lead              |
| B ↔ C    | Chat hỗ trợ đi qua Socket.IO gateway của gói B                                                   |
| A ↔ C    | Gợi ý đọc thiết bị và địa chỉ qua service của `profile`                                          |

Ghi các thống nhất này vào `packages/shared` (schema, enum trạng thái, tên sự kiện) trước khi tách ra làm riêng.

## 5. Sau khi vote

1. Lead đổi nhãn trên Jira cho khớp người (nhãn `lead`, `goi-a`, `goi-b`, `goi-c`, `team`).
2. Mỗi người lọc bảng theo nhãn gói của mình, tự gán việc, lấy từ trên xuống.
3. Cách làm trên Jira và quy tắc tránh conflict: [ke-hoach.md](ke-hoach.md) mục 4–5.
