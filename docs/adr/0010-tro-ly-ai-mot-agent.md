# ADR-0010: Trợ lý AI là một agent có công cụ, RAG cho văn bản chính sách

- Trạng thái: Đề xuất, chờ nhóm duyệt ngày 24/11/2026 (người đề xuất: Lead, gói Chatbot)
- Ngày: 2026-11-23
- Liên quan: [Rà soát nghiệp vụ](../review/2026-11-23-ra-soat-nghiep-vu.md) (AI-1, AI-2), [Luồng nghiệp vụ](../specs/luong-nghiep-vu.md) mục 5.2, 9; HC-53, HC-58, HC-95 (M1), HC-75, HC-84

## Bối cảnh

Kế hoạch có hai bot: agent đặt lịch (HC-53) và bot hỗ trợ (M1), còn RAG để "nếu kịp" trong HC-84. Hai bot trùng phần lớn công cụ (tìm dịch vụ, tra đơn) và dễ trả lời không thống nhất. Đồng thời chưa có quy tắc rõ về việc bot được làm gì với tiền và lịch.

## Quyết định

1. **Một agent**, hai điểm vào trên app: màn Đặt lịch bằng chat (HC-58) và màn Hỗ trợ (M7). Chạy bằng quyền của chính người dùng; lịch sử hội thoại lưu ở Postgres (API stateless).
2. **Dữ liệu có cấu trúc lấy qua công cụ**, gọi service đã export của các module: tìm dịch vụ, báo giá, lịch trống, đơn của tôi. Không dùng RAG cho giá và lịch, để bot không bịa số.
3. **Văn bản tự do lấy qua RAG**: chính sách hủy, hoàn tiền, bảo hành, FAQ cách dùng app, đặt trong `docs/policies/` làm nguồn duy nhất. Chỉ mục vector bằng pgvector trên Postgres sẵn có; câu trả lời kèm nguồn trích dẫn; không có nguồn phù hợp thì nói không biết và đề nghị chuyển nhân viên.
4. **Hành động có hiệu lực luôn do khách bấm.** Công cụ chỉ tạo lịch nháp có hạn 15 phút; lịch thật tạo khi khách bấm Xác nhận trên thẻ, qua đúng `POST /bookings` của luồng đặt thường. Bot không thanh toán, hủy hay hoàn tiền.
5. **Chuyển nhân viên** bằng công cụ tạo ticket hỗ trợ (gói C): bắt buộc khi liên quan tiền hoặc an toàn, khi khách yêu cầu, hoặc khi bot không giải quyết được sau 2 lượt.
6. **MCP server** (HC-75) mở đúng bộ công cụ trên với cùng giới hạn quyền.
7. Bảo vệ: nội dung người dùng và kết quả công cụ là dữ liệu, không phải lệnh; audit mọi lần gọi công cụ; giới hạn số tin mỗi người mỗi ngày.
8. Bot hỗ trợ M1 (HC-95) trở thành cấu hình thứ hai của cùng agent (thêm công cụ RAG và chuyển nhân viên); multi-agent (HC-84) vẫn là "nếu kịp".

## Hệ quả

- (+) Một nơi giữ logic AI; câu trả lời thống nhất giữa đặt lịch và hỗ trợ; ít code hơn hai bot riêng.
- (+) Không có đường nào để bot tạo lịch hoặc giao dịch mà khách không bấm xác nhận.
- (+) RAG có trích nguồn là điểm trình bày rõ ràng cho seminar ChatBot/AI.
- (−) Cần chọn một model embedding (Claude không cung cấp API embedding) và thêm extension pgvector vào Postgres.
- (−) Tài liệu chính sách phải được viết và duy trì; đổi chính sách thì phải nạp lại chỉ mục.
