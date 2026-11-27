# Phân công theo luồng: gói 1, 2, 3, 4

> Chốt ngày 28/11/2026, thay cho cách chia 22/11 (Lead, A, B, C theo domain). Lý do đổi: cách cũ cắt nhiều luồng nghiệp vụ ra giữa hai người (đặt lịch ↔ thanh toán, điều phối ↔ lịch thợ, gợi ý ↔ thiết bị, bot hỗ trợ ↔ ticket), làm phát sinh phần lớn các lỗ hổng trong [rà soát nghiệp vụ 23/11](review/2026-11-23-ra-soat-nghiep-vu.md).
>
> Mỗi gói là **một luồng nghiệp vụ trọn vẹn**, làm từ backend đến màn hình (API, bảng DB, màn app/web, test, chương báo cáo của luồng đó). **Lead nhận gói 1 kèm CI/CD và release.** Ba người còn lại chọn gói 2, 3, 4.
>
> `HC-xx` là mã Jira; nhãn gói trên Jira là `goi-1` … `goi-4`, việc chung là `team`. Danh sách đầy đủ có cột "Làm sau": [backlog.md](backlog.md). Quy tắc nghiệp vụ mọi gói phải theo: [specs/luong-nghiep-vu.md](specs/luong-nghiep-vu.md), [ADR-0009](adr/0009-thanh-toan-khi-hoan-thanh-va-so-cai-ktv.md), [ADR-0010](adr/0010-tro-ly-ai-mot-agent.md).

## 1. Nguyên tắc

1. **Một luồng, một người.** Ai làm một đoạn của hành trình khách thì làm luôn các bước kề nhau dùng chung dữ liệu và quy tắc (ví dụ: đặt lịch và thanh toán; báo giá tại chỗ phía server và màn thợ).
2. **Một module, một chủ.** Module nào thuộc gói nào thì chỉ gói đó sửa; gói khác gọi qua `index.ts` hoặc nghe sự kiện outbox ([CLAUDE.md](../CLAUDE.md), quy tắc 1). Chủ module review mọi PR chạm vào module mình.
3. **App Expo (`mobile/`) là kênh duy nhất cho khách và thợ**; web chỉ cho admin. Màn web khách/thợ cũ đóng băng làm bản tham chiếu cùng `legacy/`. Giao diện app giống ≥ 90% prototype.
4. **Backend hiện chỉ có `identity` là thật**; app mới có khung. Mọi API nghiệp vụ còn phải làm.

## 2. Bốn gói

| Gói                                    | Người  | Luồng sở hữu                                                                                                          | Module                                                            | Seminar                                                               | Điểm (đợt 1 / 2 / 3)  |
| -------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------- |
| **1 — Đặt lịch & Thanh toán**          | Lead   | Khách chọn dịch vụ → báo giá → đặt → trả tiền (qua app / tiền mặt) → hoàn tiền; sổ cái thu nhập thợ; CI/CD, release   | `catalog`, `booking`, `payments`, `payment-sandbox`, hàng đợi job | Mobile Payment & Fintech                                              | **75** (29 / 30 / 16) |
| **2 — Điều phối & Vận hành thợ**       | (chọn) | Điều phối → thợ nhận → đi → đến → báo giá tại chỗ → làm → báo xong; đặt lại thợ quen; đo tải                          | `dispatch`, `technician`, `tracking`, lưu ảnh                     | Location-based (điều phối theo khoảng cách, GPS, geofence)            | **70** (23 / 28 / 19) |
| **3 — Giao tiếp: Realtime, AI & CSKH** | (chọn) | Thông báo, chat khách–thợ, trợ lý AI đặt lịch, bot + chat hỗ trợ, ticket, khiếu nại; tunnel dev                       | `realtime`, `notifications`, `support`, `assistant`               | WebSocket / Realtime, Load balancer (realtime chéo máy), ChatBot / AI | **68** (23 / 27 / 18) |
| **4 — Tài khoản, Ngôi nhà & Gợi ý**    | (chọn) | Đăng ký, đăng nhập, vân tay → hồ sơ, địa chỉ, thiết bị, tem QR, nhắc bảo trì → gợi ý theo ngữ cảnh; màn admin quản lý | `identity`, `profile`, `recommendation`, khung app                | Authentication & Authorization, QR code, Location-based (gợi ý)       | **70** (28 / 26 / 16) |

Điểm không tính việc _(nếu kịp)_ và việc chung. Gói 1 nặng nhất vì kèm CI/CD và release; nếu trễ, HC-107 chuyển sang gói 4 trước.

## 3. Tính năng → gói → Jira

Theo mục "Sản phẩm khi hoàn thành" trong [README](../README.md#sản-phẩm-khi-hoàn-thành-cuối-122026--nhóm-bám-theo-phần-này).

| Hành trình      | Tính năng                                                                             | Gói | Jira                                            |
| --------------- | ------------------------------------------------------------------------------------- | --- | ----------------------------------------------- |
| 1. Khách mở app | Đăng ký, đăng nhập, quên mật khẩu, vân tay / Face ID                                  | 4   | HC-15, HC-88, HC-89, HC-46                      |
|                 | Trang chủ, mục "Gợi ý cho bạn" kèm lý do, push gợi ý                                  | 4   | HC-98, HC-43, HC-41, HC-48                      |
|                 | Tem QR: khách quét xem lịch sử, đặt lại; thợ dán tem lần đầu                          | 4   | HC-50, HC-55                                    |
| 2. Đặt lịch     | Đặt bằng cách bấm, báo giá ở server, Lịch của tôi                                     | 1   | HC-37, HC-33, HC-29, HC-91                      |
|                 | Chatbot đặt lịch, màn chat có thẻ và nút Xác nhận, MCP, giọng nói _(nếu kịp)_         | 3   | HC-53, HC-58, HC-75, HC-96                      |
|                 | Tự chọn thợ, offer có hạn, đặt lại thợ quen                                           | 2   | HC-51, HC-56, HC-103                            |
| 3. Thanh toán   | Cổng giả lập, giao dịch + IPN, màn thanh toán, tiền mặt hai bên xác nhận              | 1   | HC-19, HC-36, HC-38, HC-105                     |
|                 | Thu nhập chờ → khả dụng, sổ cái, nợ hoa hồng, nạp tiền, nợ của khách, hoàn tiền       | 1   | HC-57, HC-77, HC-107, HC-106, HC-62             |
|                 | Lưu thẻ, VietQR _(nếu kịp)_                                                           | 1   | HC-74, HC-80                                    |
| 4. Theo dõi thợ | Vị trí realtime, ETA, GPS giả, GPS chạy nền, bản đồ, geofence                         | 2   | HC-47, HC-92, HC-49, HC-52                      |
|                 | Chạy được khi khách và thợ nối vào hai máy chủ khác nhau                              | 3   | HC-24, HC-87                                    |
| 5. Phía thợ     | Danh sách việc, đổi trạng thái, tab thợ, bật/tắt nhận việc                            | 2   | HC-30, HC-34, HC-35, HC-90                      |
|                 | Ảnh trước/sau, báo giá tại chỗ, khách vắng, màn thu nhập                              | 2   | HC-54, HC-72, HC-102, HC-104, HC-100            |
|                 | Push có nút Nhận/Từ chối                                                              | 3   | HC-97                                           |
| 6. Kết thúc     | Khiếu nại kèm ảnh, màn hỗ trợ và khiếu nại                                            | 3   | HC-63, HC-99                                    |
|                 | Hủy, đổi lịch, phí hủy muộn                                                           | 1   | HC-71                                           |
|                 | Đánh giá thợ _(nếu kịp)_                                                              | 2   | HC-101                                          |
| 7. CSKH         | Thông báo, chat khách–thợ, bot hỗ trợ + RAG, ticket, hotline                          | 3   | HC-44, HC-93, HC-45, HC-94, HC-95, HC-59, HC-28 |
| 8. Admin (web)  | Điều phối tay, bản đồ realtime thợ _(nếu kịp)_                                        | 2   | HC-60, HC-83                                    |
|                 | Hàng đợi hỗ trợ và khiếu nại                                                          | 3   | HC-78                                           |
|                 | Quản lý thợ, nhật ký thao tác, đối soát (đọc API của gói 1), bản đồ nhiệt _(nếu kịp)_ | 4   | HC-42, HC-69, HC-61, HC-79                      |
| Nền tảng        | Hàng đợi job, staging + CD, release                                                   | 1   | HC-86, HC-40, HC-39, HC-64, HC-85               |
|                 | Tunnel cho điện thoại                                                                 | 3   | HC-14                                           |
|                 | Đo tải k6 + Grafana                                                                   | 2   | HC-68                                           |
|                 | E2E luồng chính                                                                       | 4   | HC-76                                           |

## 4. Checklist theo gói

Xếp theo thứ tự nên làm. ◆ là việc có mốc merge (mục 7) vì gói khác đang chờ.

**Gói 1 — Đặt lịch & Thanh toán (Lead)**

- Đợt 1: ◆ HC-18 state machine · ◆ HC-17 catalog · HC-29 báo giá · ◆ HC-33 Booking API (tạo + chi tiết trước, danh sách sau) · ◆ HC-86 hàng đợi job · HC-37 màn đặt lịch · HC-39 release v0.2.0
- Đợt 2: HC-19 cổng giả lập · HC-36 giao dịch + IPN · HC-38 màn thanh toán · HC-105 tiền mặt · HC-57 thu nhập chờ → khả dụng · HC-91 Lịch của tôi · HC-40 staging + CD · HC-64 release v0.3.0
- Đợt 3: HC-62 hoàn tiền · HC-77 sổ cái · HC-107 nạp tiền trả nợ · HC-106 nợ của khách · HC-71 hủy/đổi lịch · HC-85 release v1.0.0 · HC-74, HC-80 _(nếu kịp)_

Thanh toán nằm ở đợt 2 vì khách trả khi việc xong (ADR-0009): cần luồng của gói 2 chạy tới `WORK_DONE` trước.

**Gói 2 — Điều phối & Vận hành thợ**

- Đợt 1: HC-30 API thợ · HC-31 lịch trống, chống trùng lịch · HC-35 đổi trạng thái · HC-34 app thợ · HC-90 tab thợ, bật/tắt nhận việc · HC-72 upload ảnh dùng chung · HC-54 chụp ảnh
- Đợt 2: HC-51 tự gán thợ · HC-56 offer có hạn, không có thợ nhận · HC-47 vị trí, GPS giả, ETA · HC-92 GPS chạy nền · HC-49 bản đồ theo dõi · HC-102 báo giá tại chỗ · HC-104 màn báo giá, khách vắng
- Đợt 3: HC-60 admin điều phối · HC-52 geofence · HC-103 đặt lại thợ quen · HC-100 màn thu nhập thợ · HC-67 simulator · HC-68 đo tải k6 · HC-81, HC-83, HC-101 _(nếu kịp)_

**Gói 3 — Giao tiếp: Realtime, AI & CSKH**

- Đợt 1: ◆ HC-24 Socket.IO gateway · HC-87 socket client trên app · HC-44 thông báo + API push token · HC-45 chat khách–thợ (server, lọc SĐT) · HC-14 tunnel · HC-28 hotline
- Đợt 2: HC-53 chatbot đặt lịch · HC-58 màn chat AI · HC-95 bot hỗ trợ + RAG chính sách · HC-59 ticket hỗ trợ · HC-94 màn chat khách–thợ · HC-93 màn thông báo
- Đợt 3: HC-63 khiếu nại · HC-99 màn hỗ trợ, khiếu nại · HC-78 admin hỗ trợ · HC-97 push Nhận/Từ chối · HC-75 MCP server · HC-82, HC-84, HC-96 _(nếu kịp)_

**Gói 4 — Tài khoản, Ngôi nhà & Gợi ý**

- Đợt 1: ◆ HC-15 khung app (đăng nhập, SecureStore, tab) · HC-16 lỗi khóa tạm · ◆ HC-21 hồ sơ, địa chỉ · HC-23 thiết bị · HC-22 quên mật khẩu · HC-89 màn mật khẩu · HC-32 màn hồ sơ, thiết bị · HC-88 đăng ký
- Đợt 2: HC-46 vân tay / Face ID · HC-50 tem QR · HC-55 quét QR · HC-41 seed lịch sử · HC-43 gợi ý theo ngữ cảnh · HC-98 trang chủ · HC-61 admin đối soát
- Đợt 3: HC-48 push gợi ý · HC-70 nhắc bảo trì · HC-42 admin quản lý thợ · HC-69 audit log · HC-76 E2E luồng chính · HC-79 _(nếu kịp)_

**Việc chung (Lead điều phối, chia đều):** HC-13 ADR-0008 · HC-20 tag v0.1.0 · HC-25 CODEOWNERS · HC-27 quy ước giao diện app · HC-65 kịch bản demo · HC-66 báo cáo + slide (mỗi gói viết chương luồng của mình, Lead ghép) · HC-73 gỡ mock trên web. HC-26 đã xong.

## 5. Chủ luồng

Mỗi gói đồng thời là **chủ luồng** của mình:

1. **E2E test cho cả luồng**, kể cả phần chạy qua module của gói khác.
2. **Review chéo**: PR của một gói cần một review từ gói kế tiếp trên hành trình (1 → 2 → 3 → 4 → 1), vì gói đó dùng kết quả của gói trước.
3. **Demo luồng** của mình trên máy thật vào cuối mỗi đợt.
4. Giữ phần tương ứng trong [luong-nghiep-vu.md](specs/luong-nghiep-vu.md) và viết chương báo cáo.

## 6. Chỗ các gói nối với nhau

Ghi vào `packages/shared` (zod schema, tên sự kiện, chữ ký service) trước khi code phần phụ thuộc; bên chờ làm tiếp bằng stub hoặc dữ liệu seed.

| Giữa  | Hợp đồng                                                                                                                                                                                                  |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 ↔ 2 | Gói 2 chuyển trạng thái qua `BookingService` (state machine của gói 1); gói 1 phát `booking.status_changed`. `WORK_DONE` (gói 2) mở bước thanh toán (gói 1)                                               |
| 1 ↔ 2 | Báo giá tại chỗ (gói 2) tính giá qua hàm quote của `catalog` (gói 1). Sổ cái (gói 1) phát `technician.dispatch_suspended` / `_resumed` để điều phối (gói 2) lọc thợ                                       |
| 1 ↔ 3 | Chatbot gọi `CatalogService` (tìm, báo giá) và `BookingService` (lịch trống, lịch nháp). Khiếu nại (gói 3) phát `dispute.opened` / `_resolved`; gói 1 giữ thu nhập và cung cấp `PaymentsService.refund()` |
| 1 ↔ 4 | Booking gọi `ProfileService.getOwnedAddress(userId, addressId)`; cột `Booking.deviceId` cho tem QR. Màn đối soát (gói 4) chỉ đọc API của `payments`                                                       |
| 2 ↔ 3 | Vị trí, offer, trạng thái job phát qua Socket.IO gateway (gói 3). Push có nút (gói 3) gọi API nhận/từ chối offer của gói 2                                                                                |
| 2 ↔ 4 | Admin tạo tài khoản thợ (gói 4) ghi hồ sơ thợ qua `TechnicianService` (gói 2). Thợ đăng ký thiết bị (gói 4) chỉ khi có job đang `ARRIVED` / `IN_PROGRESS`                                                 |
| 3 ↔ 4 | Push gợi ý (gói 4) gửi qua `NotificationsService.send(userId, template, data)` (gói 3); khung app (gói 4) có sẵn chỗ cho màn thông báo, chat                                                              |

## 7. Mốc merge

| Mốc   | Việc                              | Gói | Ai đang chờ                         |
| ----- | --------------------------------- | --- | ----------------------------------- |
| 30/11 | HC-15 khung app, đăng nhập, tab   | 4   | Mọi màn app                         |
| 30/11 | HC-18 state machine booking       | 1   | Gói 2 (HC-30), gói 1 (HC-31, HC-33) |
| 01/12 | HC-17 catalog                     | 1   | HC-29, chatbot                      |
| 01/12 | HC-21 địa chỉ, `getOwnedAddress`  | 4   | HC-33                               |
| 02/12 | HC-24 Socket.IO gateway           | 3   | Thông báo, chat, theo dõi           |
| 03/12 | HC-33 phần tạo + chi tiết booking | 1   | Chatbot, điều phối, màn đặt lịch    |
| 03/12 | HC-86 hàng đợi job                | 1   | Offer có hạn, hết hạn thanh toán    |

Ai trễ mốc thì báo nhóm ngay hôm đó; người đang chờ làm tiếp bằng stub theo hợp đồng ở mục 6.

## 8. Chuyển từ cách chia cũ

| Cũ   | Phần chuyển sang                                                                                                                               |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Lead | Thanh toán → gói 1. Chatbot, bot hỗ trợ, MCP, màn chat khách–thợ → gói 3. Khung app HC-15 → gói 4                                              |
| A    | Catalog, booking, báo giá, màn đặt lịch, Lịch của tôi, hủy lịch → gói 1. Điều phối, lịch thợ, báo giá tại chỗ, thợ quen → gói 2. Gợi ý → gói 4 |
| B    | App thợ, vị trí, ảnh → gói 2. Realtime, thông báo, chat → gói 3. Quản lý thợ (admin) → gói 4                                                   |
| C    | Tài khoản, hồ sơ, thiết bị, QR → gói 4. Ticket, khiếu nại, màn hỗ trợ → gói 3                                                                  |

Ticket nào **đã có người làm dở** thì người đó làm xong và merge, sau đó module chuyển cho chủ mới. Đổi đợt so với bản 23/11: HC-19, HC-36, HC-38 sang đợt 2; HC-44, HC-45, HC-54, HC-72 lên đợt 1; HC-46 sang đợt 2; HC-60, HC-62, HC-63, HC-99 sang đợt 3.

## 9. Dữ liệu giả cũ thuộc gói nào

| Route mock                                                                                                                        | Gói |
| --------------------------------------------------------------------------------------------------------------------------------- | --- |
| `/services`, `/booking-options`, `/repair-options`, `/bookings`, `/payments`, `/payment-gateways`, `/payment-methods`             | 1   |
| `/technicians`, `/technician-availability`, `/technician/me`, `/technician/dashboard`, `/technician/jobs`, `/technician/location` | 2   |
| `/profile`, `/profile-options`, `/devices`, `/reminders`, `/dashboard`                                                            | 4   |

## 10. Hiện trạng ngày 28/11

- Trên `dev` mới có docs (PR #23, #25) và seed tài khoản đọc từ env; chưa có code nghiệp vụ nào được merge.
- Backend: chỉ module `identity` là thật. Schema Prisma đã có bảng nhưng chưa có API; chưa cài BullMQ, Socket.IO, MinIO client, SDK Claude.
- Mobile: Expo Router + NativeWind và một màn chờ; HC-15 chưa xong.
- Web admin: chỉ màn Người dùng là thật.
- CI trên `dev` và `main` xanh; `main` chưa có tag.
