# Phân công theo gói — để cả nhóm vote

> Chốt ngày 22/11/2026, cập nhật 23/11 sau khi đối chiếu code thật với Jira. Mỗi người nhận **một gói** và làm **trọn từ backend đến màn hình** (API, bảng DB, màn app/web, test, phần báo cáo của gói).
> Lead giữ gói **Lead**. Ba người còn lại vote chọn **gói A, B, C**.
> `HC-xx` là mã trên Jira. M1…M7 đã có trên Jira (HC-88, HC-95…HC-100). Nhãn gói trên Jira đã đổi xong; danh sách đầy đủ có cột "Làm sau" ở [backlog.md](backlog.md).
> Sơ đồ phụ thuộc (làn theo gói × đợt, nút cổ chai, đường găng): artifact "Sơ đồ phụ thuộc HomeCare" do Lead chia sẻ.
> **Quy tắc nghiệp vụ chung** (trạng thái booking, thanh toán, hủy, khiếu nại, chống giao dịch ngoài sàn): [specs/luong-nghiep-vu.md](specs/luong-nghiep-vu.md). Kết quả rà soát 35 lỗ hổng nghiệp vụ: [review/2026-11-23-ra-soat-nghiep-vu.md](review/2026-11-23-ra-soat-nghiep-vu.md). Mỗi gói đọc phần của mình trước khi code.

## 1. Những điều đã chốt

1. **Backend mới chỉ có tài khoản là thật** (đăng nhập, đăng ký, phân quyền, admin khóa người dùng). Mọi API nghiệp vụ còn phải làm; mỗi gói làm API của phần mình.
2. **App Expo (`mobile/`) là kênh duy nhất cho khách và thợ.** Giao diện giống ≥ 90% prototype (màu, font, icon, câu chữ; bố cục theo điện thoại).
3. **Web chỉ còn cho admin sàn.** Màn web của khách và thợ được **đóng băng**, giữ làm bản tham chiếu giao diện cùng `legacy/`. API thiết kế cho app, không cần trả đúng dạng dữ liệu của mock.
4. Tính năng cần đạt: mục "Sản phẩm khi hoàn thành" trong [README](../README.md#sản-phẩm-khi-hoàn-thành-cuối-122026--nhóm-bám-theo-phần-này). Mục 3 dưới đây map từng dòng của phần đó sang gói và mã Jira.

## 2. Bốn gói

| Gói                                 | Chủ đề seminar                                                                            | Điểm cốt lõi |
| ----------------------------------- | ----------------------------------------------------------------------------------------- | ------------ |
| **Lead** — Thanh toán & Chatbot     | Mobile Payment & Fintech · ChatBot / AI (agent đặt lịch, bot hỗ trợ, MCP)                 | 68           |
| **A** — Đặt lịch, điều phối & gợi ý | Location-based (điều phối theo khoảng cách, gợi ý theo vị trí và thời tiết)               | 72           |
| **B** — App thợ & realtime          | WebSocket / Realtime · Location-based (GPS, geofence) · Load balancer (realtime chéo máy) | 66           |
| **C** — Tài khoản, thiết bị & CSKH  | Authentication & Authorization (vân tay/Face ID) · QR code · CSKH (ticket, khiếu nại)     | 63           |

Điểm cốt lõi không tính việc _(nếu kịp)_. Bản 22/11 ghi 57/57/55/61 nhưng thiếu khoảng 30 điểm việc app và hạ tầng (xem mục 10); rà soát nghiệp vụ 23/11 thêm HC-102…HC-107 (A gồm cả HC-76 E2E chuyển từ việc chung). Theo đợt:

| Gói  | Đợt 1 | Đợt 2 | Đợt 3 |
| ---- | ----- | ----- | ----- |
| Lead | 21    | 30    | 17    |
| A    | 29    | 30    | 13    |
| B    | 25    | 30    | 11    |
| C    | 26    | 29    | 8     |

## 3. Tính năng → gói → Jira

### 1. Khách mở app: app tự biết khách cần gì

| Tính năng                                                                              | Gói | Jira         |
| -------------------------------------------------------------------------------------- | --- | ------------ |
| Đăng nhập bằng vân tay / Face ID                                                       | C   | HC-46        |
| Trang chủ khách                                                                        | C   | HC-98 (M5)   |
| Mục "Gợi ý cho bạn" kèm lý do (vị trí, thời tiết, thiết bị, lịch sử, xu hướng khu vực) | A   | HC-43, HC-41 |
| Push gợi ý chủ động khi không mở app                                                   | A   | HC-48        |
| Tem QR: khách quét xem lịch sử, đặt lại một chạm                                       | C   | HC-50, HC-55 |
| Thợ dán tem và nhập model ở lần đến đầu                                                | C   | HC-55        |

### 2. Đặt lịch bằng cách chat với AI

| Tính năng                                                                                 | Gói  | Jira         |
| ----------------------------------------------------------------------------------------- | ---- | ------------ |
| **Chatbot đặt lịch:** tìm dịch vụ, báo giá, xem giờ trống, hỏi lại, tạo lịch chờ xác nhận | Lead | HC-53        |
| Màn chat có thẻ dịch vụ, ô chọn giờ, nút Xác nhận                                         | Lead | HC-58        |
| Nhập bằng giọng nói _(nếu kịp)_                                                           | Lead | HC-96 (M3)   |
| Giá do server tính, thao tác dính tiền phải bấm xác nhận                                  | Lead | HC-53        |
| **MCP server:** đặt lịch từ Claude Desktop                                                | Lead | HC-75        |
| Đặt lịch bằng cách bấm truyền thống                                                       | A    | HC-37, HC-33 |
| Màn Lịch của tôi: danh sách, chi tiết, hủy/đổi lịch                                       | A    | HC-91, HC-71 |
| Tự chọn thợ theo khoảng cách, kỹ năng, điểm, lịch trống                                   | A    | HC-51        |
| Thợ không nhận trong thời hạn → chuyển người kế tiếp                                      | A    | HC-56        |

### 3. Thanh toán kiểu sàn

| Tính năng                                                       | Gói  | Jira         |
| --------------------------------------------------------------- | ---- | ------------ |
| Cổng giả lập kiểu VNPay: thẻ test + OTP                         | Lead | HC-19        |
| App mở cổng, không chạm số thẻ, quay về app sau khi trả         | Lead | HC-38        |
| Tạo giao dịch từ số tiền booking, hết hạn 15 phút               | Lead | HC-36        |
| HomeCare giữ tiền, chưa trả cho thợ                             | Lead | HC-57        |
| Lưu thẻ, trả một chạm bằng vân tay (API + màn app)              | Lead | HC-74        |
| Demo: thành công, thẻ bị từ chối, hủy giữa chừng, IPN gửi 2 lần | Lead | HC-19, HC-36 |
| VietQR _(nếu kịp)_                                              | Lead | HC-80        |

### 4. Theo dõi thợ như Grab

| Tính năng                                           | Gói | Jira                |
| --------------------------------------------------- | --- | ------------------- |
| Bản đồ vị trí thợ realtime + ETA                    | B   | HC-47, HC-49, HC-87 |
| Vào bán kính 100 m thì tự báo "Thợ đã đến"          | B   | HC-52               |
| Phát hiện GPS giả                                   | B   | HC-47               |
| Chạy được khi khách và thợ nối vào hai máy chủ khác | B   | HC-24               |

### 5. Phía thợ

| Tính năng                                                                  | Gói  | Jira                |
| -------------------------------------------------------------------------- | ---- | ------------------- |
| Danh sách việc, nhận/từ chối, đổi trạng thái                               | B    | HC-34, HC-30, HC-35 |
| Push có nút Nhận/Từ chối                                                   | B    | HC-97 (M4), đợt 3   |
| Tab Tổng quan, Hồ sơ, nút bật/tắt nhận việc                                | B    | HC-90               |
| GPS chạy nền, tự chỉnh tần suất theo tốc độ và pin                         | B    | HC-92 (app), HC-47  |
| Ảnh trước/sau bằng camera, lưu lên server; thiếu ảnh không hoàn thành được | B    | HC-54, HC-72, HC-35 |
| Mất sóng vẫn cập nhật, có mạng thì đồng bộ _(nếu kịp)_                     | B    | HC-81               |
| Màn thu nhập đã trừ hoa hồng                                               | Lead | HC-77, HC-100 (M2)  |

### 6. Kết thúc: giải ngân hoặc khiếu nại

| Tính năng                                                                   | Gói  | Jira                    |
| --------------------------------------------------------------------------- | ---- | ----------------------- |
| Nút "Xác nhận hoàn thành" (hoặc tự xác nhận sau 24 giờ) → giải ngân cho thợ | Lead | HC-57 (nút bấm ở HC-91) |
| Khách mở khiếu nại kèm ảnh                                                  | C    | HC-63, HC-99 (M7)       |
| Khách đánh giá thợ _(nếu kịp)_                                              | A    | HC-101                  |
| Có khiếu nại thì giữ tiền; xử lý bằng hoàn tiền / làm lại / voucher         | C    | HC-63                   |
| Hoàn tiền                                                                   | Lead | HC-62                   |

### 7. Chăm sóc khách hàng

| Tính năng                                                             | Gói     | Jira              |
| --------------------------------------------------------------------- | ------- | ----------------- |
| Chat với thợ trong app, ẩn số điện thoại (server B, màn app Lead)     | B, Lead | HC-45, HC-94      |
| **Bot hỗ trợ trả lời trước:** tra đơn, chính sách hủy và hoàn tiền    | Lead    | HC-95 (M1)        |
| Ticket hỗ trợ, chuyển cho nhân viên khi cần, màn chat hỗ trợ trên app | C       | HC-59, HC-99 (M7) |
| Thông báo: quyền push, màn Chuông, tùy chọn (server B, màn app C)     | B, C    | HC-44, HC-93      |
| Nút gọi hotline                                                       | B       | HC-28             |
| Gọi thoại trong app _(nếu kịp)_                                       | B       | HC-82             |
| Nhiều agent phối hợp _(nếu kịp)_                                      | Lead    | HC-84             |

### 8. Admin trên web

| Màn                                        | Gói  | Jira  |
| ------------------------------------------ | ---- | ----- |
| Người dùng (khóa/mở khóa)                  | —    | đã có |
| Điều phối (gán tay thợ)                    | A    | HC-60 |
| Đối soát giao dịch và hoàn tiền            | Lead | HC-61 |
| Hàng đợi hỗ trợ và khiếu nại               | C    | HC-78 |
| Quản lý thợ (tạo tài khoản mã TECH), đợt 3 | B    | HC-42 |
| Nhật ký thao tác                           | C    | HC-69 |
| Bản đồ nhiệt nhu cầu _(nếu kịp)_           | A    | HC-79 |
| Bản đồ realtime vị trí thợ _(nếu kịp)_     | B    | HC-83 |

### Chủ đề seminar

| Chủ đề                         | Gói                                      | Jira chính                        |
| ------------------------------ | ---------------------------------------- | --------------------------------- |
| Load balancer                  | B + cả nhóm                              | HC-24, HC-68                      |
| Authentication & Authorization | C                                        | HC-16, HC-22, HC-46               |
| WebSocket / Realtime           | B                                        | HC-24, HC-44, HC-45, HC-47        |
| Location-based Services        | A (gợi ý, điều phối) + B (GPS, geofence) | HC-43, HC-51, HC-47, HC-52        |
| QR code                        | C                                        | HC-50, HC-55                      |
| Mobile Payment & Fintech       | Lead                                     | HC-19, HC-36, HC-57, HC-62, HC-74 |
| ChatBot / AI                   | Lead                                     | HC-53, HC-58, HC-95, HC-75        |

## 4. Việc nền (thay dữ liệu giả, CRUD, hạ tầng)

Không hiện thành tính năng nhưng các tính năng ở mục 3 cần đến.

| Gói  | Việc nền                                                                                                                                                                                                                     |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lead | HC-15 khung app Expo (**chưa xong**: mới có màn chờ; còn đăng nhập, SecureStore, tab, CI)                                                                                                                                    |
| A    | HC-17 dịch vụ và bảng giá · HC-29 một công thức giá ở server · HC-18 state machine booking · HC-31 thợ và lịch trống, chống trùng lịch · HC-71 hủy/đổi lịch                                                                  |
| B    | HC-44 thông báo in-app + push + email · HC-86 hàng đợi job dùng chung · HC-87 socket client mobile · HC-72 upload ảnh dùng chung · HC-67 simulator thợ để demo                                                               |
| C    | HC-16 sửa lỗi khóa tạm đăng nhập · HC-22 + HC-89 quên/đổi mật khẩu · HC-88 (M6) đăng ký trên app · HC-21 hồ sơ và địa chỉ · HC-32 màn hồ sơ, địa chỉ, thiết bị · HC-23 thiết bị và nhắc bảo trì · HC-70 nhắc bảo trì định kỳ |

## 5. Checklist theo gói

Mỗi người dùng phần này để theo dõi việc của mình, xếp theo đợt và theo thứ tự nên làm. ◆ là mốc phải merge sớm vì gói khác đang chờ (mục 11).

**Lead — Thanh toán & Chatbot**

- Đợt 1: ◆ HC-15 khung app (đăng nhập, SecureStore, tab) · HC-19 cổng giả lập · HC-36 giao dịch + IPN (làm trên booking seed) · HC-38 màn thanh toán
- Đợt 2: **HC-53 chatbot đặt lịch** · **HC-58 màn chat** · HC-94 màn chat khách–thợ (đỡ B) · **HC-95 (M1) bot hỗ trợ + RAG chính sách** · HC-57 thu nhập chờ → khả dụng · HC-105 tiền mặt hai bên xác nhận · HC-62 hoàn tiền · HC-61 Admin đối soát · HC-96 (M3) giọng nói _(nếu kịp)_
- Đợt 3: **HC-75 MCP server** · HC-77 sổ cái KTV · HC-107 KTV nạp tiền trả nợ · HC-106 nợ của khách · HC-100 (M2) màn thu nhập · HC-74 lưu thẻ, HC-80 VietQR, HC-84 nhiều agent _(nếu kịp)_

**A — Đặt lịch, điều phối & gợi ý**

- Đợt 1: ◆ HC-18 state machine · ◆ HC-17 catalog · HC-29 báo giá · ◆ HC-33 Booking API (merge phần tạo + chi tiết trước, danh sách sau) · HC-31 thợ và lịch trống · HC-37 màn đặt lịch
- Đợt 2: HC-41 dữ liệu mẫu · HC-91 màn Lịch của tôi · HC-102 báo giá tại chỗ · HC-51 tự gán thợ · HC-56 offer có hạn · HC-60 Admin điều phối · HC-43 gợi ý theo ngữ cảnh
- Đợt 3: HC-71 hủy/đổi lịch · HC-48 push gợi ý · HC-103 đặt lại thợ quen · HC-76 E2E luồng chính · HC-101 đánh giá thợ, HC-79 bản đồ nhiệt _(nếu kịp)_

**B — App thợ & realtime**

- Đợt 1: ◆ HC-24 Socket.IO gateway · ◆ HC-86 hàng đợi job · HC-30 API thợ · HC-35 đổi trạng thái, bắt buộc ảnh · HC-34 app thợ · HC-90 tab Tổng quan/Hồ sơ, bật nhận việc · HC-87 socket client mobile · HC-28 hotline
- Đợt 2: HC-72 upload ảnh dùng chung (đầu đợt) · HC-44 thông báo + API push token · HC-47 vị trí, GPS giả, ETA · HC-92 GPS chạy nền trên app · HC-49 bản đồ theo dõi · HC-45 chat khách–thợ (server, lọc SĐT) · HC-54 chụp ảnh · HC-104 app thợ: báo giá tại chỗ, khách vắng
- Đợt 3: HC-52 geofence · HC-97 (M4) push Nhận/Từ chối · HC-67 simulator · HC-42 Admin quản lý thợ · HC-81 offline, HC-82 gọi thoại, HC-83 bản đồ admin _(nếu kịp)_

**C — Tài khoản, thiết bị & CSKH**

- Đợt 1: HC-16 lỗi khóa tạm · ◆ HC-21 hồ sơ, địa chỉ · HC-23 thiết bị · HC-22 quên mật khẩu (API) · HC-89 màn quên/đổi mật khẩu · HC-32 màn hồ sơ, thiết bị, nhắc bảo trì · HC-88 (M6) đăng ký · HC-46 vân tay/Face ID
- Đợt 2: HC-50 tem QR · HC-55 quét QR · HC-59 ticket hỗ trợ (không chờ chatbot) · HC-63 khiếu nại · HC-99 (M7) màn hỗ trợ, khiếu nại · HC-93 màn thông báo · HC-98 (M5) trang chủ
- Đợt 3: HC-70 nhắc bảo trì định kỳ · HC-78 Admin hỗ trợ · HC-69 Admin nhật ký

**Cả nhóm (lead điều phối):** HC-13 ADR-0008 · HC-14 tunnel cho điện thoại · HC-20 tag v0.1.0 (`main` chưa có tag nào) · HC-25 CODEOWNERS · HC-27 quy ước giao diện app · HC-40 server staging + CD · HC-39, HC-64, HC-85 release · HC-65 kịch bản demo · HC-66 báo cáo + slide · HC-68 đo tải k6 + Grafana · HC-73 gỡ mock trên web. HC-26 (Dependabot) đã xong.

## 6. Việc mới tạo ngày 23/11

| Mã     | Việc                                                       | Gói  | Đợt | Điểm |
| ------ | ---------------------------------------------------------- | ---- | --- | ---- |
| HC-86  | Worker: hàng đợi job dùng chung (BullMQ)                   | B    | 1   | 2    |
| HC-87  | Mobile: socket client dùng chung                           | B    | 1   | 1    |
| HC-88  | M6 · App: đăng ký tài khoản khách                          | C    | 1   | 2    |
| HC-89  | App: màn quên, đặt lại, đổi mật khẩu                       | C    | 1   | 2    |
| HC-90  | App thợ: tab Tổng quan, Hồ sơ, bật/tắt nhận việc           | B    | 1   | 2    |
| HC-91  | App khách: Lịch của tôi, hủy/đổi lịch, xác nhận hoàn thành | A    | 2   | 3    |
| HC-92  | App thợ: gửi GPS chạy nền                                  | B    | 2   | 3    |
| HC-93  | App: quyền push, push token, màn Chuông, tùy chọn          | C    | 2   | 3    |
| HC-94  | App: màn chat khách–thợ cho cả hai phía                    | Lead | 2   | 3    |
| HC-95  | M1 · Bot hỗ trợ                                            | Lead | 2   | 3    |
| HC-96  | M3 · Chatbot nhập bằng giọng nói _(nếu kịp)_               | Lead | 2   | 2    |
| HC-97  | M4 · Push cho thợ có nút Nhận/Từ chối                      | B    | 3   | 2    |
| HC-98  | M5 · Trang chủ app khách + API tổng quan                   | C    | 2   | 5    |
| HC-99  | M7 · App khách: chat hỗ trợ và mở khiếu nại                | C    | 2   | 3    |
| HC-100 | M2 · App thợ: màn thu nhập                                 | Lead | 3   | 3    |
| HC-101 | Khách đánh giá thợ _(nếu kịp)_                             | A    | 3   | 3    |

Cũng đổi ngày 23/11: HC-42 chuyển từ C sang B (đợt 3); HC-46 lên đợt 1; HC-52 sang đợt 3; HC-72 lên đầu đợt 2; HC-76 giao cho A; HC-59 không còn chờ HC-53.

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

| Lead ↔ B | Payments nghe `booking.status_changed` (COMPLETED), không gọi thẳng module của B |
| Lead ↔ C | C phát `dispute.opened` / `dispute.resolved`; Lead chặn giải ngân và cung cấp `PaymentsService.refund()` |
| Lead ↔ C | Bot M1 nghe `support.message_created`, trả lời qua `SupportService.postBotMessage`; HC-59 không chờ chatbot |
| A ↔ C | `ProfileService.getOwnedAddress(userId, addressId)`; booking có cột `deviceId` (nullable) cho tem QR |
| A, C ↔ B | `NotificationsService.send(userId, template, data)` để gửi push và in-app |

Ghi các thống nhất này vào `packages/shared` (schema, enum trạng thái, tên sự kiện, chữ ký service) **trước 25/11**, rồi mới tách ra làm riêng. Nét đứt trên sơ đồ là các chỗ "chỉ cần hợp đồng": làm song song được bằng dữ liệu seed hoặc bản stub.

## 9. Sau khi vote

1. ~~Lead đổi nhãn trên Jira theo gói và tạo M1–M7.~~ Đã xong ngày 23/11.
2. Mỗi người lọc bảng theo nhãn gói, tự gán việc, làm theo checklist ở mục 5.
3. Cách làm trên Jira và quy tắc tránh conflict: [ke-hoach.md](ke-hoach.md) mục 4–5.

## 10. Hiện trạng ngày 23/11 (kiểm tra code thật)

- **Backend:** chỉ module `identity` là thật (đăng ký, đăng nhập, refresh, `/admin/users`). Schema Prisma và migration `init` đã có bảng cho booking, payments, thiết bị, thợ nhưng chưa có API nào dùng. Chưa cài BullMQ, Socket.IO, MinIO client, SDK Claude.
- **Mobile:** mới có Expo Router + NativeWind và một màn chờ. HC-15 **chưa xong**.
- **Web admin:** chỉ màn Người dùng là thật.
- **Repo:** CI trên `dev` và `main` xanh, không có PR đang mở, `main` chưa có tag (HC-20).
- Bản phân công 22/11 thiếu phần màn app của nhiều ticket chỉ có backend (chat, thông báo, GPS chạy nền, Lịch của tôi, quên mật khẩu) và hai hạ tầng dùng chung (hàng đợi job, upload ảnh). Đã bổ sung thành HC-86…HC-101.

## 11. Ba ngày thống nhất, rồi code

| Ngày  | Việc                                                                                                                                                |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 23/11 | Đọc file này, [backlog.md](backlog.md) và sơ đồ. Vote gói A, B, C. Mỗi người tự gán ticket đợt 1 trên Jira.                                         |
| 24/11 | Họp 30 phút chốt mục 8: mỗi gói viết vào `packages/shared` các zod schema, tên sự kiện và chữ ký service mà gói khác gọi. PR nhỏ, merge trong ngày. |
| 25/11 | Dựng chung: HC-14 tunnel, HC-25 CODEOWNERS, HC-20 tag v0.1.0. Mỗi người mở draft PR cho ticket đầu tiên để thấy ai đụng file nào.                   |
| 26/11 | **Bắt đầu code** theo checklist mục 5.                                                                                                              |

Bốn việc không cần chờ hợp đồng nên **làm ngay từ 23/11**: HC-15 (Lead), HC-18 (A), HC-24 (B), HC-16 (C).

**Mốc phải merge** (gói khác đang chờ):

| Mốc   | Việc                              | Gói  |
| ----- | --------------------------------- | ---- |
| 27/11 | HC-15 khung app, đăng nhập, tab   | Lead |
| 27/11 | HC-18 state machine booking       | A    |
| 28/11 | HC-17 catalog                     | A    |
| 28/11 | HC-21 địa chỉ, `getOwnedAddress`  | C    |
| 30/11 | HC-24 Socket.IO gateway           | B    |
| 02/12 | HC-33 phần tạo + chi tiết booking | A    |
| 03/12 | HC-86 hàng đợi job                | B    |

Ai trễ mốc thì báo nhóm ngay hôm đó; người đang chờ làm tiếp bằng stub theo hợp đồng ở mục 8 thay vì ngồi đợi.
