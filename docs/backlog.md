# Backlog đến buổi bảo vệ (cuối 12/2026)

Bản chính nằm trên Jira (project HomeCare, bảng Kanban). File này để đối chiếu. Cách dùng: xem [ke-hoach.md](ke-hoach.md) mục 4–5.

- **#** là thứ tự trên bảng: làm từ trên xuống trong đợt của mình.
- **Người** là gợi ý theo domain, chưa gán. **Điểm** là độ lớn ước lượng.

| Đợt | Thời gian               |
| --- | ----------------------- |
| 1   | 2026-11-23 → 2026-12-06 |
| 2   | 2026-12-07 → 2026-12-20 |
| 3   | 2026-12-21 → 2026-12-27 |

## Đợt 1

| #   | Việc                                                                                 | Epic                                    | Người | Điểm | Làm sau         |
| --- | ------------------------------------------------------------------------------------ | --------------------------------------- | ----- | ---- | --------------- |
| 1   | ADR-0008: app Expo cho khách và KTV, web cho admin, phạm vi mở rộng                  | Nền tảng & phát hành                    | Nhóm  | 2    |                 |
| 2   | Cho điện thoại gọi được API khi dev (tunnel)                                         | Nền tảng & phát hành                    | Nhóm  | 3    |                 |
| 3   | Khởi tạo app Expo trong mobile/: Expo Router, NativeWind, đăng nhập, 2 vai trò       | App mobile Expo (khách + kỹ thuật viên) | TV4   | 5    |                 |
| 4   | Sửa lỗi khóa tạm đăng nhập: ai cũng khóa được tài khoản người khác 15 phút           | Tài khoản & hồ sơ                       | TV1   | 3    |                 |
| 5   | Catalog API: /services, /booking-options, /repair-options                            | Catalog, báo giá & booking              | TV1   | 3    |                 |
| 6   | Booking state machine + lịch sử + audit + outbox                                     | Catalog, báo giá & booking              | TV2   | 5    |                 |
| 7   | payment-sandbox: nhập thẻ test, OTP 3-D Secure, ký HMAC, IPN                         | Thanh toán kiểu sàn                     | TV3   | 8    |                 |
| 8   | Gắn tag v0.1.0 và cập nhật checklist team.md                                         | Nền tảng & phát hành                    | Nhóm  | 1    |                 |
| 9   | Module profile: địa chỉ có tọa độ (CRUD) và API hồ sơ                                | Tài khoản & hồ sơ                       | TV1   | 3    |                 |
| 10  | Quên mật khẩu qua email thật + đổi mật khẩu                                          | Tài khoản & hồ sơ                       | TV1   | 5    |                 |
| 11  | API thiết bị & nhắc bảo trì (/devices, /reminders)                                   | Thiết bị & tem QR                       | TV1   | 5    |                 |
| 12  | Socket.IO gateway + Redis adapter: xác thực JWT, phòng booking/ticket/user           | Realtime & app thợ                      | TV4   | 8    |                 |
| 13  | Điền GitHub username vào .github/CODEOWNERS                                          | Nền tảng & phát hành                    | Nhóm  | 1    |                 |
| 14  | Xử lý 3 PR Dependabot (Node 26, nginx 1.29)                                          | Nền tảng & phát hành                    | Nhóm  | 1    |                 |
| 15  | Quy ước giao diện app: giống ≥90% prototype                                          | App mobile Expo (khách + kỹ thuật viên) | Nhóm  | 2    |                 |
| 16  | Nút gọi hotline trên app                                                             | CSKH & khiếu nại                        | TV4   | 1    |                 |
| 17  | Báo giá phía server: một công thức cho mọi kênh                                      | Catalog, báo giá & booking              | TV2   | 5    | #5              |
| 18  | API kỹ thuật viên thật: job = booking được gán                                       | Realtime & app thợ                      | TV4   | 5    | #6              |
| 19  | Thợ và lịch trống: /technicians, /technician-availability + chống trùng lịch ở DB    | Catalog, báo giá & booking              | TV2   | 3    | #6              |
| 20  | App khách: hồ sơ, địa chỉ, thiết bị                                                  | App mobile Expo (khách + kỹ thuật viên) | TV1   | 3    | #3, #9          |
| 21  | Booking API: tạo (Idempotency-Key), danh sách, chi tiết                              | Catalog, báo giá & booking              | TV2   | 8    | #5, #17, #6, #9 |
| 22  | App thợ: danh sách job, chi tiết, đổi trạng thái                                     | App mobile Expo (khách + kỹ thuật viên) | TV4   | 3    | #3, #18         |
| 23  | Thợ đổi trạng thái qua state machine; hoàn thành bắt buộc ảnh, báo cáo không gửi lặp | Realtime & app thợ                      | TV4   | 3    | #18             |
| 24  | Payments: tạo giao dịch từ booking.total, IPN idempotent, hết hạn 15 phút            | Thanh toán kiểu sàn                     | TV3   | 5    | #21, #7         |
| 25  | App khách: luồng đặt lịch (gộp Vệ sinh, Sửa chữa, Đặt lịch)                          | App mobile Expo (khách + kỹ thuật viên) | TV2   | 5    | #3, #21         |
| 26  | App khách: thanh toán qua payment-sandbox và deep link quay về app                   | App mobile Expo (khách + kỹ thuật viên) | TV3   | 3    | #3, #24         |
| 27  | Release v0.2.0: PR dev → main + tag                                                  | Nền tảng & phát hành                    | Nhóm  | 1    |                 |

## Đợt 2

| #   | Việc                                                                                           | Epic                                    | Người | Điểm | Làm sau  |
| --- | ---------------------------------------------------------------------------------------------- | --------------------------------------- | ----- | ---- | -------- |
| 28  | Server staging có tên miền + HTTPS, nạp secret, bật CD                                         | Nền tảng & phát hành                    | Nhóm  | 5    |          |
| 29  | Seed lịch sử đặt lịch giả khắp TP.HCM                                                          | Điều phối & gợi ý theo ngữ cảnh         | TV2   | 2    |          |
| 30  | Admin › Kỹ thuật viên: tạo tài khoản mã TECH, kỹ năng, khu vực                                 | Admin console (web)                     | TV1   | 3    |          |
| 31  | Gợi ý theo ngữ cảnh, có lý do: vị trí, thời tiết, thiết bị, lịch sử, xu hướng khu vực, thợ gần | Điều phối & gợi ý theo ngữ cảnh         | TV2   | 5    | #29, #11 |
| 32  | Thông báo in-app + push (Expo) + email từ sự kiện outbox                                       | Realtime & app thợ                      | TV4   | 5    | #12      |
| 33  | Chat khách–thợ theo booking, ẩn số điện thoại                                                  | CSKH & khiếu nại                        | TV4   | 5    | #12      |
| 34  | App: đăng nhập lại bằng vân tay / Face ID                                                      | Tài khoản & hồ sơ                       | TV1   | 3    | #3       |
| 35  | Vị trí thợ: chỉ thợ được gán, throttle, chống GPS giả, ETA, lưu mẫu 30 giây                    | Realtime & app thợ                      | TV4   | 5    | #12, #18 |
| 36  | Push gợi ý chủ động                                                                            | Điều phối & gợi ý theo ngữ cảnh         | TV2   | 3    | #31, #32 |
| 37  | App khách: theo dõi thợ trên bản đồ live + ETA + timeline                                      | App mobile Expo (khách + kỹ thuật viên) | TV4   | 3    | #35      |
| 38  | Tem QR thiết bị: token, model/serial, gắn booking với thiết bị                                 | Thiết bị & tem QR                       | TV1   | 5    | #11, #21 |
| 39  | Điều phối tự gán thợ: điểm theo khoảng cách, kỹ năng, điểm đánh giá, tải việc                  | Điều phối & gợi ý theo ngữ cảnh         | TV2   | 5    | #21, #19 |
| 40  | Geofence: thợ vào bán kính 100 m thì tự báo "đã đến"                                           | Realtime & app thợ                      | TV4   | 3    | #35      |
| 41  | Module assistant: agent đặt lịch bằng chat (Claude + công cụ)                                  | AI agent & MCP                          | TV1   | 8    | #21      |
| 42  | App thợ: chụp ảnh trước/sau và gửi báo cáo hoàn thành                                          | App mobile Expo (khách + kỹ thuật viên) | TV4   | 2    | #22      |
| 43  | App: quét tem QR (khách xem lịch sử, đặt lại; thợ đăng ký thiết bị lần đầu)                    | Thiết bị & tem QR                       | TV1   | 3    | #38, #3  |
| 44  | Offer có hạn: thợ nhận/từ chối, hết hạn thì chuyển người kế (BullMQ)                           | Điều phối & gợi ý theo ngữ cảnh         | TV2   | 5    | #39      |
| 45  | Giữ tiền đến khi khách xác nhận hoàn thành (authorize → capture)                               | Thanh toán kiểu sàn                     | TV3   | 5    | #24, #23 |
| 46  | App: màn chat với thẻ dịch vụ, ô chọn giờ, nút xác nhận                                        | AI agent & MCP                          | TV1   | 3    | #41, #3  |
| 47  | Module support: ticket + chat hỗ trợ realtime, bot trả lời trước, chuyển nhân viên             | CSKH & khiếu nại                        | TV3   | 5    | #12, #41 |
| 48  | Admin › Điều phối: booking chờ gán, gán tay thợ                                                | Admin console (web)                     | TV2   | 5    | #39      |
| 49  | Admin › Đối soát: giao dịch, IPN, hoàn tiền                                                    | Admin console (web)                     | TV3   | 3    | #24      |
| 50  | Hoàn tiền: khi hủy (theo thời điểm) và theo kết quả khiếu nại                                  | Thanh toán kiểu sàn                     | TV3   | 3    | #45      |
| 51  | Khiếu nại gắn booking: loại, ảnh, trạng thái, SLA, cách xử lý                                  | CSKH & khiếu nại                        | TV3   | 5    | #47, #45 |
| 52  | Release v0.3.0: PR dev → main + tag                                                            | Nền tảng & phát hành                    | Nhóm  | 1    |          |

## Đợt 3

| #   | Việc                                                                        | Epic                            | Người | Điểm | Làm sau           |
| --- | --------------------------------------------------------------------------- | ------------------------------- | ----- | ---- | ----------------- |
| 53  | Kịch bản demo + video dự phòng                                              | Kiểm thử, demo & báo cáo        | Nhóm  | 2    |                   |
| 54  | Báo cáo đồ án + slide bảo vệ                                                | Kiểm thử, demo & báo cáo        | Nhóm  | 8    |                   |
| 55  | Simulator thợ chạy theo lộ trình để demo                                    | Realtime & app thợ              | TV4   | 3    |                   |
| 56  | Đo tải k6 + ảnh Grafana khi scale 1 → 3 → 5 replica                         | Kiểm thử, demo & báo cáo        | Nhóm  | 3    |                   |
| 57  | Admin › Audit log: xem và lọc                                               | Admin console (web)             | TV1   | 2    |                   |
| 58  | Job định kỳ tạo nhắc bảo trì theo chu kỳ từng loại thiết bị                 | Thiết bị & tem QR               | TV1   | 3    | #11               |
| 59  | Khách hủy và đổi lịch theo chính sách                                       | Catalog, báo giá & booking      | TV2   | 3    | #21               |
| 60  | Ảnh trước/sau lên MinIO (presigned URL), server kiểm tra ảnh tồn tại        | Realtime & app thợ              | TV4   | 5    | #23               |
| 61  | Gỡ toàn bộ mock, chạy web với VITE_USE_MOCKS=false                          | Kiểm thử, demo & báo cáo        | Nhóm  | 2    | #21, #24, #11, #9 |
| 62  | Lưu thẻ dạng token, thanh toán 1 chạm xác nhận bằng sinh trắc               | Thanh toán kiểu sàn             | TV3   | 3    | #24               |
| 63  | MCP server mở cùng bộ công cụ, demo bằng Claude Desktop                     | AI agent & MCP                  | TV1   | 5    | #41               |
| 64  | E2E luồng chính: đặt → giữ tiền → gán thợ → theo dõi → xác nhận → giải ngân | Kiểm thử, demo & báo cáo        | Nhóm  | 5    | #45, #39, #35     |
| 65  | Hoa hồng nền tảng và sổ thu nhập của thợ                                    | Thanh toán kiểu sàn             | TV3   | 5    | #45               |
| 66  | Admin › Hỗ trợ: hàng đợi ticket, chat, ghi chú nội bộ, xử lý khiếu nại      | Admin console (web)             | TV3   | 3    | #47               |
| 67  | [Nếu kịp] Admin: bản đồ nhiệt nhu cầu theo khu vực và khung giờ             | Điều phối & gợi ý theo ngữ cảnh | TV2   | 3    |                   |
| 68  | [Nếu kịp] VietQR trong sandbox                                              | Thanh toán kiểu sàn             | TV3   | 3    |                   |
| 69  | [Nếu kịp] Thợ cập nhật job khi offline, tự đồng bộ khi có mạng              | Realtime & app thợ              | TV4   | 3    |                   |
| 70  | [Nếu kịp] Gọi thoại trong app bằng WebRTC                                   | CSKH & khiếu nại                | TV4   | 5    |                   |
| 71  | [Nếu kịp] Admin › Bản đồ realtime vị trí thợ                                | Admin console (web)             | TV4   | 3    |                   |
| 72  | [Nếu kịp] Multi-agent: điều phối + agent hỗ trợ trả lời chính sách (RAG)    | AI agent & MCP                  | TV1   | 3    | #41               |
| 73  | Release v1.0.0: PR dev → main + tag                                         | Nền tảng & phát hành            | Nhóm  | 1    |                   |
