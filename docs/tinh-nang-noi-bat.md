# Tính năng nổi bật khi hoàn thành

> Mục tiêu cho buổi bảo vệ (cuối 12/2026). Kế hoạch và việc cụ thể: [ke-hoach.md](ke-hoach.md), [backlog.md](backlog.md). Hiện trạng: [specs/current-app.md](specs/current-app.md).
> Việc ghi _(nếu kịp)_ chỉ làm khi còn thời gian.

HomeCare là một **sàn dịch vụ tại nhà trên điện thoại**: khách và thợ dùng chung một app Expo, HomeCare đứng giữa để giữ tiền, điều phối và giải quyết tranh chấp. Admin điều hành trên web.

Các mục dưới đây đi theo đúng hành trình của buổi demo.

## 1. Khách mở app: app tự biết khách cần gì

- Đăng nhập bằng **vân tay hoặc Face ID**.
- Trang chủ có mục **"Gợi ý cho bạn" kèm lý do**, ví dụ: _"Máy lạnh phòng ngủ đã 5 tháng chưa vệ sinh, tuần này Thủ Đức nắng 37°C, có 3 thợ rảnh trong bán kính 2 km"_.
- Gợi ý dựa trên vị trí, thời tiết, thiết bị trong nhà, lịch sử đặt và xu hướng khu vực. Không mở app vẫn nhận được **push chủ động** với nội dung tương tự.
- **Tem QR dán trên máy lạnh, máy giặt:** khách quét là thấy lịch sử bảo trì của đúng máy đó và đặt lại một chạm. Lần đầu đến nhà, thợ là người dán tem và nhập model, nên khách không phải tự gõ thông tin thiết bị.

## 2. Đặt lịch bằng cách chat với AI

- Khách gõ: _"Đặt vệ sinh máy lạnh sáng thứ 7 ở nhà"_.
- AI tự tìm dịch vụ, báo giá, xem khung giờ trống, hỏi lại khi cần, rồi đưa ra **thẻ đặt lịch có nút Xác nhận**.
- Giá luôn do server tính, và thao tác nào dính đến tiền cũng phải chính khách bấm xác nhận.
- Cùng bộ công cụ đó được mở qua **MCP**: đặt được lịch HomeCare ngay từ Claude Desktop.
- Vẫn đặt theo cách bấm truyền thống được. Hệ thống **tự chọn thợ phù hợp** theo khoảng cách, kỹ năng, điểm đánh giá và lịch trống; thợ không nhận trong thời hạn thì tự chuyển cho người kế tiếp.

## 3. Thanh toán kiểu sàn

- Trả qua cổng giả lập kiểu VNPay: nhập thẻ test, nhập **OTP**. App không bao giờ chạm vào số thẻ.
- **Tiền được HomeCare giữ lại, chưa trả cho thợ.**
- Thẻ đã lưu thì lần sau trả bằng một chạm, xác nhận bằng vân tay.
- Demo được đủ tình huống: thành công, thẻ bị từ chối, hủy giữa chừng, cổng báo kết quả 2 lần mà vẫn chỉ ghi nhận 1 lần.

## 4. Theo dõi thợ như Grab

- Bản đồ hiện **vị trí thợ di chuyển realtime** cùng ETA.
- Thợ vào bán kính 100 m quanh nhà thì app **tự báo "Thợ đã đến"**.
- Hệ thống phát hiện và đánh dấu GPS giả.
- Chạy được khi khách và thợ kết nối vào hai máy chủ khác nhau sau load balancer (nối tiếp seminar Load Balancer của nhóm).

## 5. Phía thợ

- Nhận việc từ thông báo push, có nút Nhận/Từ chối.
- GPS chạy nền, tự điều chỉnh tần suất theo tốc độ và mức pin.
- Chụp ảnh trước/sau bằng camera, ảnh lưu lên server; **không có ảnh thì không hoàn thành được việc**.
- Mất sóng vẫn cập nhật được việc, có mạng lại thì tự đồng bộ _(nếu kịp)_.
- Màn thu nhập thể hiện rõ phần tiền đã trừ hoa hồng cho sàn.

## 6. Kết thúc: giải ngân hoặc khiếu nại

- Khách bấm **"Xác nhận hoàn thành"** (hoặc hệ thống tự xác nhận sau 24 giờ) thì tiền mới được chuyển cho thợ.
- Không hài lòng thì khách mở **khiếu nại** kèm ảnh. Tiền bị giữ cho đến khi admin xử lý: hoàn tiền, cho thợ làm lại, hoặc tặng voucher.

## 7. Chăm sóc khách hàng

- **Chat với thợ trong app**, không lộ số điện thoại của hai bên.
- **Chat hỗ trợ:** bot trả lời trước (tra đơn, chính sách hủy và hoàn tiền), chuyển cho nhân viên khi chuyện liên quan tiền hoặc bot không giải quyết được.
- Nút gọi hotline. Gọi thoại trong app _(nếu kịp)_.

## 8. Admin trên web

Điều phối (gán tay thợ), đối soát giao dịch và hoàn tiền, hàng đợi hỗ trợ và khiếu nại, quản lý thợ, nhật ký thao tác. Bản đồ nhiệt nhu cầu theo khu vực _(nếu kịp)_.

## Chủ đề seminar thể hiện trong sản phẩm

| Chủ đề                         | Thể hiện ở đâu                                          |
| ------------------------------ | ------------------------------------------------------- |
| Load balancer                  | 3 máy chủ sau Nginx, realtime vẫn chạy chéo máy (đã có) |
| Authentication & Authorization | Token, phân quyền 3 vai trò, vân tay/Face ID            |
| WebSocket / Realtime           | Theo dõi thợ, chat, thông báo                           |
| Location-based Services        | Gợi ý theo vị trí, geofence, điều phối theo khoảng cách |
| QR code                        | Tem thiết bị                                            |
| Mobile Payment & Fintech       | Cổng giả lập, OTP, giữ tiền rồi giải ngân, hoàn tiền    |
| ChatBot / AI                   | Agent đặt lịch, MCP, bot hỗ trợ                         |

**Tóm tắt để trình bày:** đây không chỉ là app đặt lịch mà là một sàn: hệ thống hiểu ngữ cảnh để gợi ý, AI tự thao tác thay khách, tiền được giữ an toàn đến khi khách hài lòng, và mọi thứ cập nhật realtime trên nhiều máy chủ.
