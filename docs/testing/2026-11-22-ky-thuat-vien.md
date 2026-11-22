# Kiểm thử thủ công — vai trò KỸ THUẬT VIÊN (KTV)

Ngày 2026-11-22, web http://localhost:3020 (tab riêng `tab-3` trong browser pane), nhánh `feat/frontend-legacy-ui`. Không sửa code.
Nguồn dữ liệu xác định bằng `read_network_requests`: chỉ `/api/v1/auth/*` (và `/admin/users` khi thử) đi ra mạng; mọi route `/technician/*` được `apiFetch` (`frontend/src/lib/api-client.ts`) trả ngay trong trình duyệt bằng `mockFetch` → **không có request mạng nào**, kể cả khi bật vị trí (đã hook `window.fetch`: 0 lần gọi).

## (A) Màn / tab

Đăng nhập: cả `TECH-088` và `viet.technician@homecare.test` đều vào `/technician` (backend thật, `POST /auth/login` 200). `tech-018` (chữ thường) cũng được chuẩn hóa và đăng nhập được.

**Dashboard (Tổng quan)**

- 4 thẻ: Công việc được phân công (đếm job khác "Từ chối"), Lịch hôm nay (đếm job có `time` bắt đầu "Hôm nay"), Thu nhập dự kiến, Hoàn thành. Số cập nhật ngay sau thao tác ghi.
- "Công việc nổi bật": 3 job đầu danh sách, chỉ để xem (không bấm được từng thẻ).
- Nút "Xem quản lý công việc" chuyển sang tab Công việc.
- "Lịch hôm nay": dòng cố định 08:30 Check-in kho + các job "Hôm nay" kèm địa chỉ.

**Công việc**

- Danh sách 4 job HC-2408/2411/2415/2422 (mã, dịch vụ, khách, giờ, địa chỉ, trạng thái, khoảng cách, ưu tiên, giá). Job "Từ chối" vẫn nằm trong danh sách.
- Bấm thẻ → panel "Thao tác công việc": ghi chú, tên khách, SĐT, địa chỉ.
- 6 nút: Nhận công việc / Từ chối / Đã nhận / Đang di chuyển / Đang thực hiện / Hoàn thành — **không nút nào bị disable** ở bất kỳ trạng thái nào. Toast "Đã cập nhật HC-xxxx: <trạng thái>."

**Vị trí**

- Hiển thị lat/lng/độ chính xác/giờ cập nhật; ban đầu lấy từ bản ghi seed `technicianLocations` (10.7777, 106.7015, "Mô phỏng", giờ 17:36 = createdAt seed).
- Công tắc Bật/Tắt chia sẻ gọi `navigator.geolocation.getCurrentPosition` thật, lặp mỗi 5 s.
- "Tuyến đường đến <job>": là **job đang chọn ở tab Công việc** (không phải job đang di chuyển), khoảng cách là chuỗi tĩnh từ seed.

**Báo cáo**

- Áp dụng cho job đang chọn; 2 ô ảnh (input file `accept="image/*" capture="environment"`), textarea ghi chú, nút "Xác nhận hoàn thành".
- Checklist chỉ là các chip chữ (span), không có ô tick.

**Hồ sơ**

- Chỉ đọc: tên, vai trò, mã, SĐT, email, khu vực, kinh nghiệm, 3 chứng chỉ "Đã xác thực bởi HomeCare", rating 4.9, "1284 công việc đã hoàn thành", 3 nhận xét. Không có trường sửa.
- Số 1284 là tĩnh, không tăng khi hoàn thành job.

## (B) Thao tác đã thử

| Thao tác                                                      | Kết quả                                                                                                         | Nguồn                           |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Đăng nhập `TECH-088`                                          | Vào `/technician`, "Xin chào, Phạm Quốc Việt"                                                                   | Backend thật (login 200) + mock |
| Đăng xuất                                                     | Về `/login` (logout 204)                                                                                        | Backend thật                    |
| Đăng nhập `viet.technician@homecare.test`                     | Vào `/technician`, cùng dữ liệu                                                                                 | Backend thật + mock             |
| Nhận HC-2408 (Chờ nhận)                                       | → Đã nhận; thu nhập 580k → 760k                                                                                 | Mock                            |
| Từ chối HC-2422 (Chờ nhận)                                    | → Từ chối; "phân công" 4 → 3; thu nhập không đổi; job vẫn hiện                                                  | Mock                            |
| HC-2408 Đã nhận → **Hoàn thành** (nhảy cóc)                   | Cho phép, không cần báo cáo/ảnh                                                                                 | Mock                            |
| HC-2408 Hoàn thành → **Đang di chuyển** (lùi)                 | Cho phép                                                                                                        | Mock                            |
| HC-2411 Đã nhận → Đang di chuyển → Đang thực hiện             | Thành công từng bước                                                                                            | Mock                            |
| HC-2422 Từ chối → **Nhận công việc**                          | Cho phép; thu nhập → 1.000.000đ                                                                                 | Mock                            |
| Báo cáo không ảnh                                             | Chặn ở client: "Cần ảnh trước và ảnh sau trước khi xác nhận hoàn thành." (không gọi mock)                       | Client                          |
| Báo cáo chỉ có ảnh trước                                      | Chặn như trên                                                                                                   | Client                          |
| Báo cáo đủ 2 ảnh (HC-2422, đang "Đã nhận")                    | "Đã xác nhận hoàn thành HC-2422."; job → Hoàn thành; Hoàn thành 0 → 1                                           | Mock                            |
| Gửi lại báo cáo cho job đã Hoàn thành                         | Vẫn thành công; mock lưu **3 báo cáo** cho HC-2422 (không chống trùng)                                          | Mock                            |
| Bật chia sẻ vị trí (quyền thật)                               | Toast "User denied Geolocation", công tắc tự tắt                                                                | Trình duyệt                     |
| Bật chia sẻ (geolocation stub qua JS)                         | Tọa độ đổi theo stub, gọi lại mỗi ~5000 ms, 0 request mạng                                                      | Mock                            |
| Vào `/` và `/admin/users`                                     | Đều bị chuyển im lặng về `/technician` (không thông báo); full reload → dữ liệu mock reset (580k, 0 hoàn thành) | Client guard + refresh thật     |
| Gọi `GET /api/v1/admin/users` bằng token KTV (qua `apiFetch`) | 403 `FORBIDDEN` "Bạn không có quyền thực hiện thao tác này"                                                     | Backend thật                    |
| Đăng nhập `tech-018`                                          | Vào được; mọi tab trống + banner "Không tìm thấy dữ liệu kỹ thuật viên"                                         | Backend thật + mock 404         |
| Viewport mobile 375×812                                       | Xem (G) bên dưới                                                                                                | —                               |

Ghi chú về ảnh: built-in browser không có công cụ chọn file, nên ảnh được gán bằng JS (`DataTransfer` với PNG 1×1, phát sự kiện `change`). App đọc file bằng `FileReader` thành data URL base64 và gửi nguyên chuỗi đó vào mock.

## (C) Vòng đời job và luật chuyển trạng thái

- Trạng thái thấy được: `Chờ nhận`, `Đã nhận`, `Từ chối`, `Đang di chuyển`, `Đang thực hiện`, `Hoàn thành` (chuỗi tiếng Việt).
- Mock `PUT /technician/jobs/:id/status` chỉ kiểm tra: job thuộc KTV đang đăng nhập (404 nếu không) và trạng thái nằm trong danh sách 6 giá trị. **Không có bảng chuyển trạng thái**: đi tới, nhảy cóc, lùi lại, Từ chối → Đã nhận đều được.
- Nút "Hoàn thành" trong tab Công việc bỏ qua hoàn toàn yêu cầu ảnh của tab Báo cáo.
- Báo cáo (`POST /technician/jobs/:id/report`) không kiểm tra trạng thái hiện tại (chấp nhận job "Đã nhận"), ép job thành `Hoàn thành`, gửi lặp lại được.
- Thu nhập dự kiến = tổng `fee` của job ở Đã nhận / Đang di chuyển / Đang thực hiện / Hoàn thành (100% giá, không trừ hoa hồng). Từ chối hoặc Chờ nhận không tính. Số tính lại ở client (useMemo) giống công thức mock.
- Không có lịch sử/timeline, không ghi ai đổi, không lý do từ chối, không timeout.

## (D) Vị trí/GPS và báo cáo ảnh

- **Vị trí**: có gọi Geolocation API thật (`enableHighAccuracy`, timeout 3 s) mỗi 5 s, ghi vào mảng `technicianLocations` trong bộ nhớ của mock. Không có request mạng, không Socket.IO, không ai khác (khách/admin) đọc được. Trong built-in browser quyền bị từ chối tự động → không bật được nếu không stub. Tọa độ hiển thị lúc đầu là seed "Mô phỏng". Khoảng cách/ETA không tính từ tọa độ (chuỗi tĩnh "3.2 km").
- **Ảnh**: input file thật, đọc thành data URL base64 lưu trong RAM (không upload, không MinIO, không giới hạn dung lượng). Ảnh không gắn với booking của khách. Checklist không bắt buộc (chỉ hiển thị).
- Reload trang là mất hết (job, vị trí, báo cáo về seed).

## (E) Lỗi, chỗ giả lập, rủi ro

1. **Không có state machine**: nhảy cóc / lùi / mở lại job đã từ chối đều được; "Hoàn thành" không cần báo cáo ảnh.
2. **Báo cáo trùng**: một job nhận nhiều báo cáo; báo cáo được cho job chưa "Đang thực hiện".
3. **Lộ dữ liệu khách**: KTV thấy họ tên đầy đủ, SĐT đầy đủ (vd 0912 456 789) và địa chỉ số nhà chính xác cho cả job "Chờ nhận" chưa nhận và job đã "Từ chối".
4. **Mobile không có nút Đăng xuất**: sidebar `hidden lg:flex` bị ẩn dưới 1024 px; thanh tab trên cùng không có Đăng xuất → KTV trên điện thoại không đăng xuất được.
5. Truy cập sai vai trò (`/`, `/admin/users`) bị chuyển hướng im lặng, không có thông báo 403 trên UI (backend thì trả 403 đúng).
6. TECH-018: banner lỗi "Không tìm thấy dữ liệu kỹ thuật viên" thay vì trạng thái rỗng; header "Xin chào," không tên; các nút thao tác vẫn hiện khi không có job.
7. Hồ sơ mock có email `viet.technician@homecare.vn` khác email đăng nhập thật `@homecare.test`; seed mock còn chứa trường `password: "123456"` (dữ liệu mock, không dùng để đăng nhập).
8. Tab Vị trí "tuyến đường đến" job đang chọn, kể cả job ngày mai hoặc đã từ chối.
9. Rủi ro khi test song song: refresh token là cookie dùng chung cả browser pane → đăng nhập ở tab này đổi phiên của các tab khác khi chúng reload.

## (G) Mobile 375×812

- Không cuộn ngang (scrollWidth = 375). Sidebar ẩn; header "Xin chào…" + 5 tab dạng nút xếp 2 hàng (3 + 2).
- Thẻ số liệu xếp 1 cột. Tab Công việc: danh sách ở trên, panel "Thao tác công việc" ở dưới (y≈1280 px) → phải cuộn qua cả danh sách mới thấy nút thao tác sau khi chọn job.
- Không có nút Đăng xuất (xem E4). Đã đặt lại preset desktop.
