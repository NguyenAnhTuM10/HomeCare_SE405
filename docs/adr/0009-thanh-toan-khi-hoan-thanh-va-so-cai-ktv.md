# ADR-0009: Thanh toán khi hoàn thành và sổ cái kỹ thuật viên

- Trạng thái: Đề xuất, chờ nhóm duyệt ngày 24/11/2026 (người đề xuất: Lead, gói Thanh toán)
- Ngày: 2026-11-23
- Thay một phần [ADR-0003](0003-mock-vnpay-gateway.md): giao dịch hết hạn không còn làm booking `EXPIRED`. Phần cổng giả lập, chữ ký HMAC và IPN idempotent giữ nguyên.
- Liên quan: [Rà soát nghiệp vụ](../review/2026-11-23-ra-soat-nghiep-vu.md) (PAY-1…PAY-9, BKG-1, BKG-3), [Luồng nghiệp vụ](../specs/luong-nghiep-vu.md) mục 5.6, 8

## Bối cảnh

Kế hoạch ban đầu cho khách trả trước qua cổng, booking chờ `PAID` rồi mới điều phối, và mô phỏng "giữ tiền" bằng authorize → capture. Rà soát ngày 23/11 cho thấy:

- Phần lớn khách dịch vụ tại nhà ở Việt Nam trả **tiền mặt hoặc chuyển khoản cho thợ khi xong việc**. Với các khoản đó sàn không giữ được gì, và kế hoạch cũ không thu được hoa hồng.
- Giá sửa chữa chỉ biết sau khi thợ kiểm tra tại nhà, nên không thể bắt trả trước đúng số tiền.
- Authorize/capture làm sandbox và luồng phức tạp hơn mà không thêm giá trị cho người dùng.

Các sàn thật giải quyết vấn đề này bằng **ví/sổ cái của đối tác**: tiền qua app thì sàn trả lại phần của đối tác sau khi trừ hoa hồng; tiền mặt thì đối tác nợ hoa hồng, nợ quá hạn mức thì ngừng nhận việc.

## Quyết định

1. **Khách trả khi việc xong**, sau khi thấy giá cuối trên app (sửa chữa: sau khi duyệt báo giá tại chỗ). Booking được điều phối ngay khi tạo.
2. Hai cách trả, cùng một số tiền `T` do server tính:
   - **Qua app** (cổng giả lập theo ADR-0003): payment tạo từ `T` khi booking ở `WORK_DONE`; chỉ IPN hợp lệ chuyển `SUCCEEDED` → booking `COMPLETED`.
   - **Tiền mặt cho KTV:** KTV ghi đã thu, khách xác nhận đã trả; hai bên khai lệch thì tự mở khiếu nại.
3. **Sổ cái KTV** append-only:
   - Job qua app: `+E` ở trạng thái **chờ** 24 giờ (hoặc đến khi khách xác nhận hài lòng), sau đó **khả dụng**; có khiếu nại thì giữ nguyên trạng thái chờ.
   - Job tiền mặt: `+E − T`, khả dụng ngay; thường là số âm, tức nợ hoa hồng.
   - Hoàn tiền sau khi đã chi trả: bút toán thu hồi. Nạp tiền trả nợ, chi trả hằng tuần: bút toán tương ứng.
   - Số dư khả dụng dưới hạn mức (mặc định −300.000đ): KTV **tạm ngưng nhận việc**, vẫn đăng nhập và nạp tiền được.
4. **Một giá cho khách**: `T = G + F − D`. Không phụ phí theo phương thức; phí cổng do sàn chịu. Voucher do sàn tài trợ, thu nhập KTV `E = G × (1 − c)` không bị trừ.
5. "Giữ tiền rồi giải ngân" trong README được hiểu là trạng thái chờ của thu nhập trên sổ cái, **không** phải authorize/capture trên cổng.
6. Lưu thẻ và trả một chạm (HC-74) hạ xuống "nếu kịp".

## Hệ quả

- (+) Một luồng thanh toán chung cho vệ sinh và sửa chữa; khớp cách khách Việt Nam đang trả tiền.
- (+) Thu được hoa hồng cả với tiền mặt; tạo động cơ để KTV ở lại sàn mà không cần chặn cứng.
- (+) Sandbox đơn giản hơn (bỏ authorize/capture); vẫn demo đủ: thành công, thẻ bị từ chối, hủy, IPN lặp, IPN sai chữ ký, hoàn tiền.
- (−) Khách có thể không trả sau khi nhận dịch vụ: xử lý bằng nợ của khách và chặn đặt lịch mới (PAY-3).
- (−) Bảng trạng thái booking phải đổi trước khi gói 1 code HC-18 (thêm `PENDING_DISPATCH`, `ARRIVED`, `WORK_DONE`; bỏ `PENDING_PAYMENT`, `CONFIRMED_CASH`, `PAID`, `EXPIRED`), bằng một migration mới.
- (−) Thêm bảng sổ cái và job chuyển thu nhập chờ → khả dụng (dùng hàng đợi HC-86).
