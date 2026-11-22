# Kế hoạch đến buổi bảo vệ (cuối 12/2026) — đọc file này trước

> Cập nhật 22/11/2026. Thay cho lộ trình cũ ở [team.md](team.md) §3. Các quy tắc code trong [CLAUDE.md](../CLAUDE.md) vẫn giữ nguyên.

## 1. Đổi hướng gì

| Trước                          | Bây giờ                                                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Web cho khách, màn web cho thợ | **App Expo** cho khách và thợ (một app, 2 vai trò). **Admin vẫn là web**. Web khách giữ làm kênh dự phòng |
| App đặt dịch vụ                | **Sàn hai phía**: khách ↔ thợ, HomeCare giữ tiền, điều phối, giải quyết khiếu nại                         |
| Chủ yếu CRUD                   | Thêm 4 điểm nhấn để chấm điểm (mục 3)                                                                     |

App giống **≥ 90% prototype**: giữ màu, font, icon, câu chữ; được đổi bố cục cho điện thoại (thanh tab dưới, một cột). Android là máy demo chính (không có Mac nên iPhone chỉ chạy Expo Go).

## 2. App hiện đang làm gì (đã dùng thử thật ngày 22/11)

Chỉ **đăng nhập/đăng ký** và **Admin › Người dùng** là thật. Mọi màn khác chạy dữ liệu giả trong trình duyệt, tải lại là mất, khách và thợ không thấy dữ liệu của nhau.

Chi tiết từng màn, luật giá, lỗi tìm được: [specs/current-app.md](specs/current-app.md). Nhật ký thao tác: [testing/](testing/).

## 3. Bốn điểm nhấn

Sản phẩm hoàn chỉnh trông như thế nào, kể theo hành trình demo: [tinh-nang-noi-bat.md](tinh-nang-noi-bat.md).

1. **AI agent + MCP:** khách chat "đặt vệ sinh máy lạnh sáng thứ 7" → AI tự gọi công cụ của hệ thống để báo giá, xem lịch trống, tạo booking nháp. Cùng bộ công cụ mở ra qua MCP để Claude Desktop dùng được.
2. **Gợi ý theo ngữ cảnh:** dựa vào vị trí, thời tiết, thiết bị trong nhà, xu hướng khu vực → gợi ý dịch vụ có kèm lý do và gửi push chủ động. Tem **QR dán trên thiết bị** để xem lịch sử và đặt lại 1 chạm.
3. **Thanh toán kiểu sàn:** cổng giả lập VNPay (nhập thẻ test + OTP), **giữ tiền đến khi khách xác nhận xong việc**, hoàn tiền, hoa hồng cho thợ.
4. **Realtime + CSKH:** vị trí thợ trên bản đồ, tự báo "đã đến" khi vào gần nhà khách, chat khách–thợ (ẩn số điện thoại), chat hỗ trợ (bot trả lời trước, chuyển nhân viên khi cần), khiếu nại gắn với tiền.

Để sau buổi bảo vệ: RabbitMQ, gọi thoại, multi-agent (chỉ làm nếu còn thời gian).

## 4. Làm việc trên Jira

- Project **HomeCare (HC)**, bảng Kanban. 12 epic theo domain, 73 việc.
- **Nhãn `dot-1`, `dot-2`, `dot-3`** là đợt: 23/11–06/12, 07/12–20/12, 21/12–27/12. Nhãn `tv1`…`tv4`, `team` là người **gợi ý** theo domain; chưa ai được gán.
- **Thứ tự trên bảng đã sắp sẵn:** việc nền ở trên, việc phụ thuộc ở dưới. Lấy việc từ trên xuống trong đợt của mình. Mỗi ticket ghi **"Làm sau"** (phải đợi việc nào) và **"Vùng code"** (sẽ sửa thư mục nào).
- Việc có chữ **[Nếu kịp]** chỉ làm khi xong hết phần còn lại.
- Mỗi người tối đa **2 việc "In Progress"** cùng lúc.
- Tên nhánh và commit có key Jira: nhánh `feat/HC-23-booking-api`, commit `feat(booking): create booking (HC-23)`.

| Người | Domain                                       |
| ----- | -------------------------------------------- |
| TV1   | Tài khoản, hồ sơ, thiết bị + QR, AI agent    |
| TV2   | Catalog, báo giá, booking, điều phối, gợi ý  |
| TV3   | Thanh toán, sandbox, CSKH và khiếu nại       |
| TV4   | Khung app Expo, realtime, app thợ, thông báo |

## 5. Tránh conflict

1. **Mỗi người sửa trong thư mục của mình**: `backend/src/modules/<module>/`, `backend/prisma/schema/<module>.prisma`, `mobile/app/(customer)/<màn>/`, `frontend/src/pages/admin/<màn>`.
2. **Ba việc nền phải xong trước** vì nhiều người dựa vào: khung app Expo (TV4), state machine booking (TV2), Socket.IO gateway (TV4). Người làm việc nền merge sớm, các người khác rebase rồi mới làm tiếp.
3. **File dùng chung** — chỉ thêm dòng, PR nhỏ, merge trong ngày:
   - `backend/src/app.module.ts` (thêm module của mình)
   - `packages/shared/src/` (schema, tên sự kiện socket)
   - khung điều hướng của `mobile/`
   - `frontend/src/mocks/legacy-server.js` (chỉ xóa route mock của mình khi API thật đã chạy)
4. **Migration:** mỗi PR một migration riêng; trước khi merge thì rebase `dev` và chạy lại `pnpm db:migrate`; không sửa migration đã merge.
5. Mở PR sớm (draft) để người khác thấy mình đang đụng file nào.

## 6. Việc đầu tiên của tuần này

- **Cả nhóm:** đọc file này và [specs/current-app.md](specs/current-app.md); gắn tag `v0.1.0`; điền CODEOWNERS; dựng tunnel để điện thoại gọi được API.
- **TV1:** sửa lỗi khóa tạm đăng nhập (ai cũng khóa được tài khoản người khác 15 phút), rồi API hồ sơ và địa chỉ.
- **TV2:** state machine booking, rồi báo giá phía server (gộp 4 công thức giá đang lệch nhau thành một).
- **TV3:** payment-sandbox.
- **TV4:** khung app Expo, rồi Socket.IO gateway.
