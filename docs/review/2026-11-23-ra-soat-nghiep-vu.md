# Rà soát nghiệp vụ trước khi code (23/11/2026)

- Phạm vi: toàn bộ luồng khách, kỹ thuật viên (KTV), admin của HomeCare, đối chiếu với kế hoạch trên Jira (HC-13…HC-101), schema Prisma và code hiện có.
- Mục tiêu: tìm lỗ hổng nghiệp vụ **trước khi** viết code; chặn các đường đi vòng (bypass) về tiền, dữ liệu cá nhân và trạng thái; đưa quy trình về gần với cách các sàn dịch vụ thật đang vận hành (Grab, bTaskee, TaskRabbit, Airbnb).
- Kết quả: **35 phát hiện** (13 mức Cao, 16 Trung bình, 6 Thấp). Hai thay đổi thiết kế lớn được ghi thành quyết định kiến trúc: [ADR-0009](../adr/0009-thanh-toan-khi-hoan-thanh-va-so-cai-ktv.md) (thanh toán) và [ADR-0010](../adr/0010-tro-ly-ai-mot-agent.md) (trợ lý AI). Luồng đã sửa nằm ở [specs/luong-nghiep-vu.md](../specs/luong-nghiep-vu.md).

Cách đọc: **Mức** Cao = có thể mất tiền, rò dữ liệu cá nhân hoặc bị lách khỏi sàn; Trung bình = sai nghiệp vụ, khó vận hành thật; Thấp = chất lượng, trải nghiệm. Cột **Ticket** là việc trên Jira chịu trách nhiệm. HC-102…HC-107 được tạo từ chính đợt rà soát này; mô tả của các ticket còn lại đã được bổ sung quy tắc tương ứng (ghi "Rà soát nghiệp vụ 23/11" kèm mã phát hiện).

## 1. Tổng quan theo lĩnh vực

| Lĩnh vực                          | Cao | Trung bình | Thấp | Gói  |
| --------------------------------- | --- | ---------- | ---- | ---- |
| Thanh toán, sổ cái, hoàn tiền     | 6   | 2          | 1    | Lead |
| Giá, đặt lịch, hủy, điều phối     | 3   | 7          | 1    | A    |
| KTV, vị trí, bằng chứng, chat     | 3   | 3          | 1    | B    |
| Tài khoản, hồ sơ, CSKH, khiếu nại | 1   | 3          | 2    | C    |
| Trợ lý AI                         | 0   | 1          | 1    | Lead |
| **Tổng**                          | 13  | 16         | 6    |      |

## 2. Thay đổi thiết kế lớn

### 2.1 Mô hình thanh toán (ADR-0009)

| Trước                                                                         | Sau                                                                                      |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Khách trả trước khi điều phối; booking `PENDING_PAYMENT` → `PAID` → điều phối | Khách trả **khi việc xong**, sau khi thấy giá cuối trên app; điều phối ngay khi đặt      |
| "Giữ tiền" mô phỏng authorize → capture trên cổng                             | "Giữ tiền" là **thu nhập chờ 24 giờ** trên sổ cái KTV; có khiếu nại thì đứng yên         |
| Tiền mặt chỉ là một trạng thái (`CONFIRMED_CASH`), sàn không thu được gì      | Tiền mặt ghi **nợ hoa hồng** vào sổ cái KTV; nợ vượt hạn mức thì KTV tạm ngưng nhận việc |
| Giá sửa chữa tính bằng công thức cố định lúc đặt                              | Phí kiểm tra lúc đặt + **báo giá tại chỗ** có khung giá, khách duyệt trên app            |
| Màn thanh toán cộng 1,5% "bảo vệ thanh toán" và phí cổng                      | Một giá duy nhất cho khách; phí cổng do sàn chịu                                         |

### 2.2 Trợ lý AI (ADR-0010)

| Trước                                                                | Sau                                                                                                                                    |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Hai bot: agent đặt lịch (HC-53) và bot hỗ trợ (M1); RAG để "nếu kịp" | **Một agent**, hai điểm vào (đặt lịch, hỗ trợ); dữ liệu có cấu trúc lấy qua công cụ, văn bản chính sách lấy qua **RAG có trích nguồn** |
| Chưa quy định bot được làm gì với tiền                               | Bot chỉ tạo **lịch nháp**; khách bấm Xác nhận trên thẻ mới tạo lịch thật; bot không bao giờ thu tiền                                   |

## 3. Danh sách phát hiện

### 3.1 Thanh toán, sổ cái, hoàn tiền (Lead)

| ID    | Mức  | Phát hiện                                                                                   | Tác động                                                            | Giải pháp                                                                                                                                                         | Ticket       |
| ----- | ---- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| PAY-1 | Cao  | Thanh toán tiền mặt/chuyển khoản thẳng cho KTV không để lại nghĩa vụ nào với sàn            | Sàn mất hoa hồng; KTV có động cơ kéo khách sang trả tiền mặt        | Sổ cái KTV: job tiền mặt ghi **nợ hoa hồng**; nợ vượt hạn mức (mặc định 300.000đ) thì KTV tạm ngưng nhận việc đến khi nạp tiền hoặc được trừ vào thu nhập qua app | HC-77        |
| PAY-2 | Cao  | "Giữ tiền rồi giải ngân" không áp dụng được cho tiền mặt và không cần authorize/capture     | Thiết kế phức tạp mà không giải quyết được trường hợp phổ biến nhất | Giữ tiền = thu nhập ở trạng thái **chờ** 24 giờ sau hoàn thành; khách xác nhận sớm thì chuyển **khả dụng** ngay; có khiếu nại thì giữ                             | HC-57        |
| PAY-3 | Cao  | Khách đã nhận dịch vụ nhưng không trả (không trả qua app, cũng không đưa tiền mặt)          | KTV mất tiền công, sàn không có cơ chế thu                          | KTV báo "chưa thu được"; khoản nợ ghi vào tài khoản khách; khách **không đặt lịch mới** đến khi thanh toán                                                        | HC-106       |
| PAY-4 | Cao  | Hoàn tiền cho booking trả tiền mặt không thể đi qua cổng thanh toán                         | Không có cách hoàn tiền nhất quán                                   | Hoàn về đúng phương thức gốc; tiền mặt hoàn bằng **số dư/voucher của sàn**; nếu lỗi do KTV thì trừ vào sổ cái KTV                                                 | HC-62        |
| PAY-5 | Cao  | Khiếu nại được chấp nhận **sau khi** đã chi trả cho KTV                                     | Sàn phải tự gánh khoản hoàn                                         | Thu hồi qua sổ cái (số dư KTV được phép âm, trừ dần vào các job sau)                                                                                              | HC-62, HC-77 |
| PAY-6 | Cao  | KTV và khách khai lệch nhau về tiền mặt (KTV nói đã thu, khách nói chưa trả hoặc ngược lại) | Tranh chấp không có căn cứ                                          | Tiền mặt cần **hai phía xác nhận**: KTV ghi đã thu, khách xác nhận trên app; lệch thì tự mở khiếu nại                                                             | HC-105       |
| PAY-7 | TB   | Màn thanh toán cộng phụ phí 1,5% và phí cổng theo từng cổng                                 | Khách thấy giá khác lúc đặt; không giống sàn thật                   | Một giá cho khách (tạm tính + phí dịch vụ cố định − giảm giá); phí cổng do sàn chịu                                                                               | HC-29, HC-38 |
| PAY-8 | TB   | Chưa có quy trình chi trả cho KTV                                                           | Không biết thu nhập "khả dụng" đi đâu                               | Đợt chi trả hằng tuần; admin đánh dấu đã chuyển; không chi khoản đang chờ hoặc đang bị giữ                                                                        | HC-61, HC-77 |
| PAY-9 | Thấp | Lưu thẻ và trả một chạm (HC-74) không phục vụ luồng chính                                   | Tốn thời gian của gói đang nặng                                     | Hạ xuống "nếu kịp"                                                                                                                                                | HC-74        |

### 3.2 Giá, đặt lịch, hủy, điều phối (A)

| ID     | Mức  | Phát hiện                                                                                       | Tác động                                                                   | Giải pháp                                                                                                                                                | Ticket         |
| ------ | ---- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| BKG-1  | Cao  | Giá sửa chữa được chốt lúc đặt, trong khi thực tế chỉ biết sau khi kiểm tra                     | Phát sinh tại nhà được thỏa thuận miệng, ngoài app                         | **Báo giá tại chỗ**: KTV chọn hạng mục từ danh mục có khung giá (tối thiểu–tối đa), khách duyệt trên app trước khi làm; từ chối thì chỉ trả phí kiểm tra | HC-102, HC-104 |
| BKG-2  | Cao  | Voucher chỉ có giới hạn tổng, cập nhật `usedCount` không nguyên tử                              | Một người dùng lại nhiều lần; vượt giới hạn khi nhiều người dùng cùng lúc  | Giới hạn theo người dùng; giữ lượt khi tạo lịch, trả lại khi hủy; tăng lượt bằng câu lệnh có điều kiện trong cùng transaction                            | HC-29, HC-33   |
| BKG-3  | Cao  | Chưa rõ ai chịu khoản giảm giá                                                                  | Thu nhập KTV bị trừ oan, hoặc sàn tính sai doanh thu                       | Voucher do sàn tài trợ: thu nhập KTV tính trên giá **trước** giảm giá                                                                                    | HC-29, HC-77   |
| BKG-4  | TB   | Nhận đặt lịch mà không kiểm tra còn KTV phục vụ được khung giờ đó                               | Đặt thành công rồi không có ai nhận                                        | Lịch trống tính theo số KTV đúng kỹ năng, đúng khu vực, chưa có việc trùng giờ                                                                           | HC-31          |
| BKG-5  | TB   | Không có quy trình khi **không KTV nào nhận**                                                   | Lịch treo vô thời hạn                                                      | Hết lượt offer → đưa vào hàng đợi điều phối tay của admin; trước giờ hẹn 1 giờ vẫn chưa có người → hủy miễn phí, báo khách                               | HC-56, HC-60   |
| BKG-6  | TB   | Chưa có chính sách hủy, đổi lịch theo thời điểm, chưa có bù cho KTV                             | Khách hủy sát giờ khi KTV đã đi; KTV chịu thiệt                            | Hủy trước giờ hẹn ≥ 2 giờ: miễn phí; sau đó hoặc khi KTV đã xuất phát: phí hủy, phần lớn trả cho KTV. Đổi lịch giữ nguyên booking, điều phối lại nếu cần | HC-71          |
| BKG-7  | TB   | Chưa xử lý khách vắng nhà                                                                       | KTV mất công không có bù                                                   | KTV đã đến (geofence) + chờ 15 phút + đã liên hệ qua app → được báo "khách vắng", áp phí hủy muộn                                                        | HC-71          |
| BKG-8  | TB   | KTV nhận việc rồi bỏ, hoặc từ chối chọn lọc việc giá thấp                                       | Lịch hỏng sát giờ; KTV "kén việc"                                          | Bỏ việc sau khi nhận thì điều phối lại với ưu tiên cao; tỷ lệ nhận/bỏ việc vào điểm xếp hạng điều phối                                                   | HC-51, HC-56   |
| BKG-9  | TB   | Thời hạn offer giống nhau cho mọi loại lịch                                                     | Lịch hẹn trước nhiều ngày bị chuyển người quá nhanh; lịch khẩn chờ quá lâu | Lịch hẹn: 10 phút mỗi lượt; sửa chữa khẩn: 90 giây                                                                                                       | HC-56          |
| BKG-10 | TB   | Điều phối có thể chọn KTV đang nợ quá hạn mức, đang tạm ngưng, hoặc có vị trí bị gắn cờ GPS giả | Giao việc cho người không được phép nhận                                   | Bộ lọc điều phối loại các KTV đó; dùng khu vực đăng ký khi vị trí không tin cậy                                                                          | HC-51          |
| BKG-11 | Thấp | Khách được chọn KTV tự do từ danh sách                                                          | Lộ danh sách KTV; dễ bị dùng để tìm người làm ngoài                        | Chỉ cho chọn lại **KTV đã từng phục vụ mình** ("Đặt lại thợ quen"); còn lại để hệ thống gán                                                              | HC-103         |

### 3.3 KTV, vị trí, bằng chứng, chat (B)

| ID    | Mức  | Phát hiện                                                                       | Tác động                                       | Giải pháp                                                                                                                       | Ticket       |
| ----- | ---- | ------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| TEC-1 | Cao  | Ảnh trước/sau có thể là ảnh cũ chọn từ thư viện                                 | Báo hoàn thành giả                             | Chỉ chụp bằng camera trong app; server kiểm tra ảnh được tải lên **trong khung thời gian** job đang diễn ra                     | HC-54, HC-72 |
| TEC-2 | Cao  | Trạng thái "đã đến" có thể do client tự báo                                     | KTV báo đến mà không đến                       | Geofence tính **ở server** từ chuỗi vị trí; KTV chỉ được báo tay khi GPS yếu, và lần báo tay đó bị gắn cờ                       | HC-52        |
| TEC-3 | Cao  | Chat khách–KTV vẫn cho gửi số điện thoại, link Zalo                             | Hai bên trao đổi để giao dịch riêng            | Lọc và che chuỗi giống số điện thoại, link mạng xã hội; ghi nhận số lần vi phạm                                                 | HC-45        |
| TEC-4 | TB   | KTV xem được tên, địa chỉ khách vô thời hạn sau khi xong việc                   | Liên hệ khách ngoài sàn ở các lần sau          | Địa chỉ đầy đủ chỉ hiện từ khi nhận việc đến 24 giờ sau hoàn thành; lịch sử chỉ giữ quận/phường; chat chuyển chỉ đọc sau 7 ngày | HC-30, HC-45 |
| TEC-5 | TB   | Tạm ngưng nhận việc (do nợ hoa hồng) bị lẫn với khóa tài khoản                  | KTV bị khóa thì không đăng nhập để trả nợ được | Tách hai trạng thái: **khóa đăng nhập** (admin, identity) và **tạm ngưng nhận việc** (sổ cái, technician)                       | HC-30, HC-77 |
| TEC-6 | TB   | Hoàn thành job khi chưa có trạng thái "đã đến" hoặc chưa có giá cuối được duyệt | Rút ngắn quy trình, bỏ qua kiểm soát           | State machine: `IN_PROGRESS` chỉ sau `ARRIVED`; báo xong cần đủ ảnh và (với sửa chữa) báo giá đã duyệt                          | HC-18, HC-35 |
| TEC-7 | Thấp | Đồng bộ ngoại tuyến (HC-81) có thể gửi lại thao tác với thời gian lùi           | Né thời hạn offer, làm sai lịch sử             | Server tự gán thời gian nhận và kiểm tra lại trạng thái; không tin thời gian client cho các mốc tiền                            | HC-81        |

### 3.4 Tài khoản, hồ sơ, CSKH, khiếu nại (C)

| ID    | Mức  | Phát hiện                                                                              | Tác động                                              | Giải pháp                                                                                                                               | Ticket        |
| ----- | ---- | -------------------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| ACC-1 | Cao  | Khóa tạm đăng nhập tính theo tên đăng nhập, không theo IP                              | Bất kỳ ai cũng khóa được tài khoản người khác 15 phút | Đếm theo (định danh + IP) và theo IP; admin gỡ được khóa tạm                                                                            | HC-16         |
| ACC-2 | TB   | Khiếu nại không có thời hạn và không giới hạn số lần                                   | Lạm dụng để lấy voucher, hoàn tiền                    | Hoàn tiền trong 24 giờ sau hoàn thành; bảo hành sửa chữa 7 ngày chỉ "làm lại"; bắt buộc ảnh; theo dõi tỷ lệ khiếu nại của từng khách    | HC-63         |
| ACC-3 | TB   | Mức hoàn tiền chưa có ràng buộc                                                        | Hoàn nhiều hơn số đã trả                              | Tổng các lần hoàn ≤ số đã thanh toán; mỗi quyết định ghi lý do và audit                                                                 | HC-62, HC-63  |
| ACC-4 | TB   | KTV đăng ký thiết bị (tem QR) thay khách không cần khách biết                          | Ghi dữ liệu vào hồ sơ người khác                      | Chỉ khi đang có job với khách đó; khách thấy và sửa được thông tin thiết bị                                                             | HC-50, HC-55  |
| ACC-5 | Thấp | "Điểm sức khỏe" thiết bị do khách tự nhập                                              | Gợi ý dựa trên số liệu không đáng tin                 | Tính ở server từ lần bảo trì gần nhất và chu kỳ của loại thiết bị                                                                       | HC-23         |
| ACC-6 | Thấp | Một người có thể vừa là khách vừa là KTV để tự đặt, tự làm (nâng điểm, lấy khuyến mãi) | Gian lận điểm đánh giá và voucher người mới           | Email, SĐT không dùng chung giữa tài khoản khách và KTV; voucher người mới một lần mỗi SĐT; chỉ booking đã thanh toán mới được đánh giá | HC-42, HC-101 |

### 3.5 Trợ lý AI (Lead)

| ID   | Mức  | Phát hiện                                                              | Tác động                                                  | Giải pháp                                                                                                                      | Ticket       |
| ---- | ---- | ---------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| AI-1 | TB   | Chưa tách rõ "câu trả lời của bot" và "hành động có hiệu lực"          | Bot hiểu nhầm "ok" thành xác nhận, tạo lịch ngoài ý khách | Công cụ chỉ tạo **lịch nháp** có hạn; lịch thật chỉ tạo khi khách bấm nút Xác nhận trên thẻ, qua đúng API của luồng đặt thường | HC-53, HC-58 |
| AI-2 | Thấp | Chính sách hủy, hoàn tiền, bảo hành nằm rải rác trong code và tài liệu | Bot và nhân viên trả lời không thống nhất                 | Một bộ tài liệu chính sách làm nguồn duy nhất cho RAG; bot trả lời kèm nguồn, không có nguồn thì chuyển nhân viên              | HC-95        |

## 4. Chống đi vòng khỏi sàn (tổng hợp)

Không có biện pháp kỹ thuật nào chặn hoàn toàn việc khách và KTV giao dịch riêng. Thiết kế đi theo hướng của các sàn thật: **làm cho ở lại sàn có lợi hơn**, và để lại dấu vết khi đi ra ngoài.

| Lớp        | Biện pháp                                                                      | Phát hiện liên quan |
| ---------- | ------------------------------------------------------------------------------ | ------------------- |
| Tiền       | Nợ hoa hồng tiền mặt, hạn mức, tạm ngưng nhận việc; khách nợ thì không đặt mới | PAY-1, PAY-3        |
| Liên lạc   | Ẩn SĐT, lọc số điện thoại trong chat, hạn chế xem địa chỉ sau khi xong         | TEC-3, TEC-4        |
| Giá        | Báo giá tại chỗ trong app có khung giá                                         | BKG-1               |
| Quyền lợi  | Bảo hành, khiếu nại, voucher chỉ cho job hoàn thành trong app                  | ACC-2               |
| Giữ chân   | "Đặt lại thợ quen" trong app                                                   | BKG-11              |
| Bằng chứng | Geofence ở server, ảnh chụp trong app, hủy sau khi đã đến bị gắn cờ            | TEC-1, TEC-2        |

## 5. Việc tiếp theo

1. Cả nhóm duyệt tài liệu này và [luồng nghiệp vụ](../specs/luong-nghiep-vu.md) trong buổi họp 24/11.
2. Gói A cập nhật bảng trạng thái booking trong HC-18 **trước khi code** (đã đổi theo mô hình thanh toán mới).
3. ~~Lead tạo ticket cho các phát hiện chưa có việc và cập nhật mô tả các ticket liên quan trên Jira.~~ Đã xong 23/11: tạo HC-102…HC-107, bổ sung quy tắc vào mô tả 29 ticket, thêm link phụ thuộc, dời HC-48 sang đợt 3.
