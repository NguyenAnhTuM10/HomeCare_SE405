# Kế hoạch đến buổi bảo vệ (cuối 12/2026) — đọc file này trước

> Cập nhật 22/11/2026. Thay cho lộ trình cũ ở [team.md](team.md) §3. Các quy tắc code trong [CLAUDE.md](../CLAUDE.md) vẫn giữ nguyên.

## 1. Đổi hướng gì

| Trước                          | Bây giờ                                                                                                                       |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Web cho khách, màn web cho thợ | **App Expo** cho khách và thợ (một app, 2 vai trò). **Web chỉ còn cho admin**; màn web khách/thợ đóng băng làm bản tham chiếu |
| App đặt dịch vụ                | **Sàn hai phía**: khách ↔ thợ, HomeCare giữ tiền, điều phối, giải quyết khiếu nại                                             |
| Chủ yếu CRUD                   | Thêm 4 điểm nhấn để chấm điểm (mục 3)                                                                                         |

App giống **≥ 90% prototype**: giữ màu, font, icon, câu chữ; được đổi bố cục cho điện thoại (thanh tab dưới, một cột). Android là máy demo chính (không có Mac nên iPhone chỉ chạy Expo Go).

## 2. App hiện đang làm gì (đã dùng thử thật ngày 22/11)

Chỉ **đăng nhập/đăng ký** và **Admin › Người dùng** là thật. Mọi màn khác chạy dữ liệu giả trong trình duyệt, tải lại là mất, khách và thợ không thấy dữ liệu của nhau.

Chi tiết từng màn, luật giá, lỗi tìm được: [specs/current-app.md](specs/current-app.md). Nhật ký thao tác: [testing/](testing/).

## 3. Tính năng cần đạt

Danh sách đầy đủ, kể theo hành trình demo, nằm ở [README](../README.md#sản-phẩm-khi-hoàn-thành-cuối-122026--nhóm-bám-theo-phần-này). Cả nhóm bám theo phần đó.

Để sau buổi bảo vệ: RabbitMQ, gọi thoại, multi-agent (chỉ làm nếu còn thời gian).

## 4. Làm việc trên Jira

- Project **HomeCare (HC)**, bảng Kanban. 12 epic theo domain.
- **Nhãn `dot-1`, `dot-2`, `dot-3`** là đợt: 23/11–06/12, 07/12–20/12, 21/12–27/12. Nhãn gói `lead`, `goi-a`, `goi-b`, `goi-c`, `team` cho biết việc thuộc gói nào.
- **Thứ tự trên bảng đã sắp sẵn:** việc nền ở trên, việc phụ thuộc ở dưới. Lấy việc từ trên xuống trong đợt của mình. Mỗi ticket ghi **"Làm sau"** (phải đợi việc nào) và **"Vùng code"** (sẽ sửa thư mục nào).
- Việc có chữ **[Nếu kịp]** chỉ làm khi xong hết phần còn lại.
- Mỗi người tối đa **2 việc "In Progress"** cùng lúc.
- Tên nhánh và commit có key Jira: nhánh `feat/HC-23-booking-api`, commit `feat(booking): create booking (HC-23)`.

Phân công theo gói (lead giữ Thanh toán & AI, ba người còn lại vote gói A, B, C): **[phan-cong.md](phan-cong.md)**.

## 5. Tránh conflict

1. **Mỗi người sửa trong thư mục của mình**: `backend/src/modules/<module>/`, `backend/prisma/schema/<module>.prisma`, `mobile/app/(customer)/<màn>/`, `frontend/src/pages/admin/<màn>`.
2. **Ba việc nền phải xong trước** vì nhiều người dựa vào: khung app Expo (HC-15), state machine booking (HC-18), Socket.IO gateway (HC-24). Người làm việc nền merge sớm, các người khác rebase rồi mới làm tiếp.
3. **File dùng chung** — chỉ thêm dòng, PR nhỏ, merge trong ngày:
   - `backend/src/app.module.ts` (thêm module của mình)
   - `packages/shared/src/` (schema, tên sự kiện socket)
   - khung điều hướng của `mobile/`
4. **Migration:** mỗi PR một migration riêng; trước khi merge thì rebase `dev` và chạy lại `pnpm db:migrate`; không sửa migration đã merge.
5. Mở PR sớm (draft) để người khác thấy mình đang đụng file nào.

## 6. Việc đầu tiên của tuần này

- **Cả nhóm:** đọc file này và [specs/current-app.md](specs/current-app.md); gắn tag `v0.1.0`; điền CODEOWNERS; dựng tunnel để điện thoại gọi được API.
- **Vote gói** theo [phan-cong.md](phan-cong.md), rồi chốt các điểm nối giữa các gói (mục 4 của file đó).
- **Lead:** khung app Expo (HC-15), rồi payment-sandbox.
- **Gói A:** state machine booking, rồi báo giá phía server (gộp 4 công thức giá đang lệch nhau thành một).
- **Gói B:** Socket.IO gateway, rồi API kỹ thuật viên.
- **Gói C:** sửa lỗi khóa tạm đăng nhập (ai cũng khóa được tài khoản người khác 15 phút), rồi API hồ sơ và địa chỉ.
