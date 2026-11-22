# Phân công theo gói — để cả nhóm vote

> Chốt ngày 22/11/2026. Mỗi người nhận **một gói** và làm **trọn từ backend đến màn hình** (API, bảng DB, màn app/web, test, phần báo cáo của gói).
> Lead giữ gói **Lead**. Ba người còn lại vote chọn **gói A, B, C**.
> `HC-xx` là mã trên Jira. `M1`…`M7` là việc mới, sẽ được tạo trên Jira.

## 1. Những điều đã chốt

1. **Backend mới chỉ có tài khoản là thật** (đăng nhập, đăng ký, phân quyền, admin khóa người dùng). Mọi API nghiệp vụ còn phải làm; mỗi gói làm API của phần mình.
2. **App Expo (`mobile/`) là kênh duy nhất cho khách và thợ.** Giao diện giống ≥ 90% prototype (màu, font, icon, câu chữ; bố cục theo điện thoại).
3. **Web chỉ còn cho admin sàn.** Màn web của khách và thợ được **đóng băng**, giữ làm bản tham chiếu giao diện cùng `legacy/`. API thiết kế cho app, không cần trả đúng dạng dữ liệu của mock.
4. Tính năng cần đạt: mục "Sản phẩm khi hoàn thành" trong [README](../README.md#sản-phẩm-khi-hoàn-thành-cuối-122026--nhóm-bám-theo-phần-này). Mục 3 dưới đây map từng dòng của phần đó sang gói và mã Jira.

## 2. Bốn gói

| Gói                                 | Chủ đề seminar                                                                            | Điểm cốt lõi |
| ----------------------------------- | ----------------------------------------------------------------------------------------- | ------------ |
| **Lead** — Thanh toán & Chatbot     | Mobile Payment & Fintech · ChatBot / AI (agent đặt lịch, bot hỗ trợ, MCP)                 | 57           |
| **A** — Đặt lịch, điều phối & gợi ý | Location-based (điều phối theo khoảng cách, gợi ý theo vị trí và thời tiết)               | 57           |
| **B** — App thợ & realtime          | WebSocket / Realtime · Location-based (GPS, geofence) · Load balancer (realtime chéo máy) | 55           |
| **C** — Tài khoản, thiết bị & CSKH  | Authentication & Authorization (vân tay/Face ID) · QR code · CSKH (ticket, khiếu nại)     | 61           |

Điểm cốt lõi không tính việc _(nếu kịp)_.

## 3. Tính năng → gói → Jira

### 1. Khách mở app: app tự biết khách cần gì

| Tính năng                                                                              | Gói | Jira         |
| -------------------------------------------------------------------------------------- | --- | ------------ |
| Đăng nhập bằng vân tay / Face ID                                                       | C   | HC-46        |
| Trang chủ khách                                                                        | C   | M5           |
| Mục "Gợi ý cho bạn" kèm lý do (vị trí, thời tiết, thiết bị, lịch sử, xu hướng khu vực) | A   | HC-43, HC-41 |
| Push gợi ý chủ động khi không mở app                                                   | A   | HC-48        |
| Tem QR: khách quét xem lịch sử, đặt lại một chạm                                       | C   | HC-50, HC-55 |
| Thợ dán tem và nhập model ở lần đến đầu                                                | C   | HC-55        |

### 2. Đặt lịch bằng cách chat với AI

| Tính năng                                                                                 | Gói  | Jira         |
| ----------------------------------------------------------------------------------------- | ---- | ------------ |
| **Chatbot đặt lịch:** tìm dịch vụ, báo giá, xem giờ trống, hỏi lại, tạo lịch chờ xác nhận | Lead | HC-53        |
| Màn chat có thẻ dịch vụ, ô chọn giờ, nút Xác nhận                                         | Lead | HC-58        |
| Nhập bằng giọng nói _(nếu kịp)_                                                           | Lead | M3           |
| Giá do server tính, thao tác dính tiền phải bấm xác nhận                                  | Lead | HC-53        |
| **MCP server:** đặt lịch từ Claude Desktop                                                | Lead | HC-75        |
| Đặt lịch bằng cách bấm truyền thống                                                       | A    | HC-37, HC-33 |
| Tự chọn thợ theo khoảng cách, kỹ năng, điểm, lịch trống                                   | A    | HC-51        |
| Thợ không nhận trong thời hạn → chuyển người kế tiếp                                      | A    | HC-56        |

### 3. Thanh toán kiểu sàn

| Tính năng                                                       | Gói  | Jira         |
| --------------------------------------------------------------- | ---- | ------------ |
| Cổng giả lập kiểu VNPay: thẻ test + OTP                         | Lead | HC-19        |
| App mở cổng, không chạm số thẻ, quay về app sau khi trả         | Lead | HC-38        |
| Tạo giao dịch từ số tiền booking, hết hạn 15 phút               | Lead | HC-36        |
| HomeCare giữ tiền, chưa trả cho thợ                             | Lead | HC-57        |
| Lưu thẻ, trả một chạm bằng vân tay                              | Lead | HC-74        |
| Demo: thành công, thẻ bị từ chối, hủy giữa chừng, IPN gửi 2 lần | Lead | HC-19, HC-36 |
| VietQR _(nếu kịp)_                                              | Lead | HC-80        |

### 4. Theo dõi thợ như Grab

| Tính năng                                           | Gói | Jira         |
| --------------------------------------------------- | --- | ------------ |
| Bản đồ vị trí thợ realtime + ETA                    | B   | HC-47, HC-49 |
| Vào bán kính 100 m thì tự báo "Thợ đã đến"          | B   | HC-52        |
| Phát hiện GPS giả                                   | B   | HC-47        |
| Chạy được khi khách và thợ nối vào hai máy chủ khác | B   | HC-24        |

### 5. Phía thợ

| Tính năng                                                                  | Gói  | Jira                |
| -------------------------------------------------------------------------- | ---- | ------------------- |
| Danh sách việc, nhận/từ chối, đổi trạng thái                               | B    | HC-34, HC-30, HC-35 |
| Push có nút Nhận/Từ chối                                                   | B    | M4                  |
| GPS chạy nền, tự chỉnh tần suất theo tốc độ và pin                         | B    | HC-47               |
| Ảnh trước/sau bằng camera, lưu lên server; thiếu ảnh không hoàn thành được | B    | HC-54, HC-72, HC-35 |
| Mất sóng vẫn cập nhật, có mạng thì đồng bộ _(nếu kịp)_                     | B    | HC-81               |
| Màn thu nhập đã trừ hoa hồng                                               | Lead | HC-77, M2           |

### 6. Kết thúc: giải ngân hoặc khiếu nại

| Tính năng                                                                   | Gói  | Jira      |
| --------------------------------------------------------------------------- | ---- | --------- |
| Nút "Xác nhận hoàn thành" (hoặc tự xác nhận sau 24 giờ) → giải ngân cho thợ | Lead | HC-57     |
| Khách mở khiếu nại kèm ảnh                                                  | C    | HC-63, M7 |
| Có khiếu nại thì giữ tiền; xử lý bằng hoàn tiền / làm lại / voucher         | C    | HC-63     |
| Hoàn tiền                                                                   | Lead | HC-62     |

### 7. Chăm sóc khách hàng

| Tính năng                                                             | Gói  | Jira      |
| --------------------------------------------------------------------- | ---- | --------- |
| Chat với thợ trong app, ẩn số điện thoại                              | B    | HC-45     |
| **Bot hỗ trợ trả lời trước:** tra đơn, chính sách hủy và hoàn tiền    | Lead | M1        |
| Ticket hỗ trợ, chuyển cho nhân viên khi cần, màn chat hỗ trợ trên app | C    | HC-59, M7 |
| Nút gọi hotline                                                       | B    | HC-28     |
| Gọi thoại trong app _(nếu kịp)_                                       | B    | HC-82     |
| Nhiều agent phối hợp _(nếu kịp)_                                      | Lead | HC-84     |

### 8. Admin trên web

| Màn                                    | Gói  | Jira  |
| -------------------------------------- | ---- | ----- |
| Người dùng (khóa/mở khóa)              | —    | đã có |
| Điều phối (gán tay thợ)                | A    | HC-60 |
| Đối soát giao dịch và hoàn tiền        | Lead | HC-61 |
| Hàng đợi hỗ trợ và khiếu nại           | C    | HC-78 |
| Quản lý thợ (tạo tài khoản mã TECH)    | C    | HC-42 |
| Nhật ký thao tác                       | C    | HC-69 |
| Bản đồ nhiệt nhu cầu _(nếu kịp)_       | A    | HC-79 |
| Bản đồ realtime vị trí thợ _(nếu kịp)_ | B    | HC-83 |

### Chủ đề seminar

| Chủ đề                         | Gói                                      | Jira chính                        |
| ------------------------------ | ---------------------------------------- | --------------------------------- |
| Load balancer                  | B + cả nhóm                              | HC-24, HC-68                      |
| Authentication & Authorization | C                                        | HC-16, HC-22, HC-46               |
| WebSocket / Realtime           | B                                        | HC-24, HC-44, HC-45, HC-47        |
| Location-based Services        | A (gợi ý, điều phối) + B (GPS, geofence) | HC-43, HC-51, HC-47, HC-52        |
| QR code                        | C                                        | HC-50, HC-55                      |
| Mobile Payment & Fintech       | Lead                                     | HC-19, HC-36, HC-57, HC-62, HC-74 |
| ChatBot / AI                   | Lead                                     | HC-53, HC-58, M1, HC-75           |

## 4. Việc nền (thay dữ liệu giả, CRUD, hạ tầng)

Không hiện thành tính năng nhưng các tính năng ở mục 3 cần đến.

| Gói  | Việc nền                                                                                                                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Lead | HC-15 khung app Expo (đã xong)                                                                                                                                                                               |
| A    | HC-17 dịch vụ và bảng giá · HC-29 một công thức giá ở server · HC-18 state machine booking · HC-31 thợ và lịch trống, chống trùng lịch · HC-71 hủy/đổi lịch                                                  |
| B    | HC-44 thông báo in-app + push + email · HC-67 simulator thợ để demo                                                                                                                                          |
| C    | HC-16 sửa lỗi khóa tạm đăng nhập · HC-22 quên/đổi mật khẩu · M6 đăng ký trên app · HC-21 hồ sơ và địa chỉ · HC-32 màn hồ sơ, địa chỉ, thiết bị · HC-23 thiết bị và nhắc bảo trì · HC-70 nhắc bảo trì định kỳ |

## 5. Checklist theo gói

Mỗi người dùng phần này để theo dõi việc của mình, xếp theo đợt.

**Lead — Thanh toán & Chatbot**

- Đợt 1: HC-15 khung app Expo (đã xong) · HC-19 cổng giả lập · HC-36 giao dịch + IPN · HC-38 màn thanh toán trên app
- Đợt 2: **HC-53 chatbot đặt lịch** · **HC-58 màn chat** · **M1 bot hỗ trợ** · HC-57 giữ tiền → giải ngân · HC-62 hoàn tiền · HC-61 Admin đối soát · M3 giọng nói _(nếu kịp)_
- Đợt 3: **HC-75 MCP server** · HC-74 lưu thẻ trả một chạm · HC-77 + M2 hoa hồng, màn thu nhập · HC-80 VietQR, HC-84 nhiều agent _(nếu kịp)_

**A — Đặt lịch, điều phối & gợi ý**

- Đợt 1: HC-17 dịch vụ · HC-18 state machine · HC-29 báo giá · HC-31 thợ và lịch trống · HC-33 Booking API · HC-37 màn đặt lịch
- Đợt 2: HC-41 dữ liệu mẫu · HC-43 gợi ý theo ngữ cảnh · HC-48 push gợi ý · HC-51 tự gán thợ · HC-56 offer có hạn · HC-60 Admin điều phối
- Đợt 3: HC-71 hủy/đổi lịch · HC-79 bản đồ nhiệt _(nếu kịp)_

**B — App thợ & realtime**

- Đợt 1: HC-24 Socket.IO gateway · HC-30 API thợ · HC-34 app thợ · HC-35 đổi trạng thái, bắt buộc ảnh · HC-28 hotline
- Đợt 2: HC-44 thông báo · M4 push Nhận/Từ chối · HC-45 chat khách–thợ · HC-47 vị trí, GPS giả, ETA · HC-49 bản đồ theo dõi · HC-52 geofence · HC-54 chụp ảnh
- Đợt 3: HC-72 ảnh lên server · HC-67 simulator · HC-81 offline, HC-82 gọi thoại, HC-83 bản đồ admin _(nếu kịp)_

**C — Tài khoản, thiết bị & CSKH**

- Đợt 1: HC-16 lỗi khóa tạm · HC-21 hồ sơ, địa chỉ · HC-22 quên mật khẩu · HC-23 thiết bị · HC-32 màn hồ sơ · M6 đăng ký trên app
- Đợt 2: HC-46 vân tay/Face ID · M5 trang chủ · HC-50 tem QR · HC-55 quét QR · HC-59 ticket hỗ trợ · HC-63 khiếu nại · M7 màn hỗ trợ, khiếu nại · HC-42 Admin quản lý thợ
- Đợt 3: HC-70 nhắc bảo trì định kỳ · HC-78 Admin hỗ trợ · HC-69 Admin nhật ký

**Cả nhóm (lead điều phối):** HC-13 ADR-0008 · HC-14 tunnel cho điện thoại · HC-20 tag v0.1.0 · HC-25 CODEOWNERS · HC-27 quy ước giao diện app · HC-40 server staging + CD · HC-39, HC-64, HC-85 release · HC-65 kịch bản demo · HC-66 báo cáo + slide · HC-68 đo tải k6 + Grafana · HC-73 ẩn màn khách/thợ khỏi web · HC-76 E2E luồng chính. HC-26 (Dependabot) đã xong.

## 6. Việc mới (sẽ tạo trên Jira)

| Mã  | Việc                                                            | Gói  | Đợt | Điểm |
| --- | --------------------------------------------------------------- | ---- | --- | ---- |
| M1  | Bot hỗ trợ: tra đơn, chính sách hủy/hoàn tiền, chuyển nhân viên | Lead | 2   | 3    |
| M2  | App thợ: màn thu nhập (đã trừ hoa hồng)                         | Lead | 3   | 3    |
| M3  | _(Nếu kịp)_ Chatbot: nhập bằng giọng nói                        | Lead | 2   | 2    |
| M4  | Push cho thợ có nút Nhận/Từ chối                                | B    | 2   | 2    |
| M5  | Trang chủ app khách + API tổng quan                             | C    | 2   | 5    |
| M6  | App: đăng ký tài khoản khách                                    | C    | 1   | 2    |
| M7  | App khách: chat hỗ trợ và mở khiếu nại                          | C    | 2   | 3    |

## 7. Dữ liệu giả cũ thuộc gói nào

| Route mock                                                                                                  | Gói  |
| ----------------------------------------------------------------------------------------------------------- | ---- |
| `/services`, `/booking-options`, `/repair-options`, `/technicians`, `/technician-availability`, `/bookings` | A    |
| `/technician/me`, `/technician/dashboard`, `/technician/jobs`, `/technician/location`                       | B    |
| `/profile`, `/profile-options`, `/payment-methods`, `/devices`, `/reminders`, `/dashboard`                  | C    |
| `/payments`, `/payment-gateways`                                                                            | Lead |

## 8. Chỗ các gói nối với nhau (chốt trong tuần đầu)

| Giữa     | Cần thống nhất                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------ |
| A ↔ Lead | Thanh toán lấy số tiền từ booking; sự kiện `payment.succeeded` chuyển booking sang đã thanh toán |
| A ↔ Lead | Chatbot gọi service báo giá, lịch trống và tạo booking của gói A                                 |
| A ↔ B    | Bảng trạng thái booking; booking gán cho thợ nào; sự kiện đổi trạng thái để phát realtime        |
| Lead ↔ C | Khiếu nại chặn giải ngân và gọi hoàn tiền; bot hỗ trợ (Lead) chuyển cuộc chat sang ticket (C)    |
| B ↔ C    | Chat hỗ trợ đi qua Socket.IO gateway của gói B                                                   |
| A ↔ C    | Gợi ý đọc thiết bị và địa chỉ qua service của `profile`; trang chủ hiện mục gợi ý của gói A      |

Ghi các thống nhất này vào `packages/shared` (schema, enum trạng thái, tên sự kiện) trước khi tách ra làm riêng.

## 9. Sau khi vote

1. Lead đổi nhãn trên Jira theo gói (`lead`, `goi-a`, `goi-b`, `goi-c`, `team`) và tạo M1–M7.
2. Mỗi người lọc bảng theo nhãn gói, tự gán việc, làm theo checklist ở mục 5.
3. Cách làm trên Jira và quy tắc tránh conflict: [ke-hoach.md](ke-hoach.md) mục 4–5.
