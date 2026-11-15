# Phân công, tiến độ & lộ trình — nhóm 4 người

> Cập nhật: 2026-11-15.
> Mỗi người sở hữu **một domain end-to-end**: schema Prisma, module API, nối dữ liệu cho màn hình, test và tài liệu của domain đó.
> Shared kernel (`backend/src/common`, `packages/shared`, `infra`, `.github`) thuộc **cả nhóm**: mọi PR chạm vào đây cần ≥ 2 người review.
> **Giao diện = bản prototype, giống y hệt** (yêu cầu của khách hàng): không ai sửa giao diện các màn hình đã có, xem [frontend-migration.md](frontend-migration.md).

## 1. Phân công

| Thành viên | Domain                                                                                  | Thư mục chính                                                                                              | Màn hình (nối dữ liệu)                         |
| ---------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **TV1**    | Identity _(đã xong, làm mẫu)_, Profile, Địa chỉ, Thiết bị & Nhắc bảo trì, Admin console | `modules/identity`, `modules/profile`, `schema/identity.prisma`, `schema/profile.prisma`                   | Tổng quan, Hồ sơ, Thiết bị, Admin › Người dùng |
| **TV2**    | Catalog, Booking (state machine), Dispatch (điều phối)                                  | `modules/catalog`, `modules/booking`, `modules/dispatch`, `schema/catalog.prisma`, `schema/booking.prisma` | Vệ sinh, Sửa chữa, Đặt lịch, Admin › Điều phối |
| **TV3**    | Payments, payment-sandbox (VNPay giả lập), hoàn tiền, biên nhận                         | `modules/payments`, `payment-sandbox/`, `schema/payments.prisma`                                           | Thanh toán, Admin › Đối soát                   |
| **TV4**    | Kỹ thuật viên (web hiện có; app Expo nếu nhóm chốt), Tracking realtime, Notifications   | `modules/technician`, `modules/tracking`, `modules/notifications`, `schema/technician.prisma`, `mobile/`   | Kỹ thuật viên, Theo dõi, Admin › Bản đồ        |

Người phụ trách review theo đường dẫn: điền GitHub username vào `.github/CODEOWNERS` (hiện còn để trống).

## 2. Checklist tiến độ

### 2.1 Đã làm ✅

**Nền tảng & kiến trúc**

- [x] Monorepo pnpm: `backend/` (NestJS 11), `frontend/` (React), `packages/shared/` (zod schema, enum, mã lỗi, sự kiện realtime dùng chung).
- [x] Modular monolith với shared kernel: cấu hình kiểm tra bằng zod (production từ chối secret dev), log JSON có request id + tên replica, lỗi chuẩn `AppException` (thông báo tiếng Việt, không lộ thông tin nội bộ), health `live/ready`, metrics Prometheus, audit log, **transactional outbox** + tiến trình worker.
- [x] ESLint chặn import sai ranh giới module.
- [x] Prisma schema cho **toàn bộ MVP** (identity, profile, catalog, booking, dispatch, payments, technician, tracking, notifications, platform), migration đầu tiên, seed dữ liệu mẫu chạy lặp lại được.
- [x] **Module identity hoàn chỉnh** (spec: [specs/identity.md](specs/identity.md)): đăng ký, đăng nhập bằng email hoặc mã KTV, token 15 phút + refresh token xoay vòng có phát hiện đánh cắp, đăng xuất 1 thiết bị / tất cả, khóa tạm sau 5 lần sai, phân quyền 3 vai trò, admin xem và khóa/mở khóa người dùng.

**Frontend**

- [x] **Giao diện 1:1 bản prototype**: 11 màn hình (đăng nhập/đăng ký/quên mật khẩu, 8 màn hình khách hàng, trang 404, kỹ thuật viên), đã so khớp HTML, màu nền và font với bản cũ chạy song song.
- [x] Ghim đúng phiên bản thư viện của bản cũ: `tailwindcss 3.4.19`, `lucide-react 1.71.0`.
- [x] Đăng nhập/đăng ký/đăng xuất nối API thật; token chỉ nằm trong bộ nhớ, tự gia hạn, tải lại trang vẫn giữ phiên, đăng xuất ở một tab thì mọi tab cùng đăng xuất.
- [x] **Mock API** chép từ backend cũ (`frontend/src/mocks`) cho mọi màn hình nghiệp vụ, có test.
- [x] Màn hình mới: Admin › Người dùng (dữ liệu thật).

**Hạ tầng & vận hành**

- [x] Docker cho môi trường dev (Postgres, Redis, Mailpit, MinIO), mọi cổng chỉ mở trên `127.0.0.1`.
- [x] Stack giống production: Nginx cân bằng tải trước 3 replica API + worker. Đã kiểm chứng: request chia đều 10/10/10, đăng xuất có hiệu lực trên mọi replica.
- [x] Prometheus + dashboard Grafana, script đo tải k6.

**CI/CD & quy trình**

- [x] CI: lint, format, typecheck, unit test, e2e test trên Postgres + Redis, build, đẩy image lên GHCR; CodeQL; Dependabot; mọi GitHub Action ghim theo SHA.
- [x] Mô hình nhánh `feat/* → dev (staging) → main (production)`, job **Branch policy** chặn PR sai nhánh vào `main` ([ADR-0007](adr/0007-branching-strategy.md)).
- [x] GitHub đã cấu hình: ruleset cho `main` và `dev` (cấm xóa nhánh, cấm force-push, bắt buộc PR + 1 người duyệt + CI xanh); environment `staging` (chỉ nhận `dev`) và `production` (chỉ nhận `main`, phải có người duyệt).
- [x] Workflow CD deploy qua SSH cho staging và production (đã viết, **đang tắt**).
- [x] Bộ plugin, skill, agent Claude Code dùng chung; `CLAUDE.md` ghi quy tắc kiến trúc và quy tắc giao diện.

**Tài liệu & kiểm thử**

- [x] [System design](architecture/system-design.md) (C4, ERD, sequence, ước lượng tải, chống bypass, load balancing, CI/CD), ADR 0001–0007, spec identity, [hướng dẫn giao diện](frontend-migration.md).
- [x] Test: backend 17 unit + 14 e2e, frontend 6 (mock API).
- [x] PR #1 (nền móng) đã merge vào `dev`.

### 2.2 Chưa làm cho MVP ⬜

**Ngay bây giờ (cả nhóm)**

- [ ] Duyệt và merge PR #2 (đổi tên `backend/` `frontend/`, giao diện 1:1, mock API). Sau khi merge, mỗi người chuyển `apps/api/.env` → `backend/.env` và chạy `pnpm install`.
- [ ] Điền GitHub username vào `.github/CODEOWNERS`.
- [ ] TV4 + cả nhóm chốt: màn hình kỹ thuật viên giữ bản web hay làm app Expo ([frontend-migration.md](frontend-migration.md) mục 8).

**TV1 — Profile, thiết bị, admin**

- [ ] API thật cho `GET /dashboard`, `/devices`, `/reminders`, `/profile`, `/payment-methods`, `/profile-options` (trả đúng dạng dữ liệu của mock), xóa các route mock tương ứng.
- [ ] Job định kỳ tạo nhắc bảo trì đến hạn.
- [ ] Admin: quản lý kỹ thuật viên, xem audit log.
- [ ] Quên mật khẩu qua email thật (hiện giao diện vẫn mô phỏng như bản cũ), đổi mật khẩu.

**TV2 — Catalog, booking, dispatch**

- [ ] API `/services`, `/booking-options`, `/repair-options`, `/technicians`, `/technician-availability`; **báo giá tính ở server** (bỏ `amount` gửi từ trình duyệt).
- [ ] Booking: tạo/hủy, state machine + lịch sử + outbox, `Idempotency-Key`.
- [ ] Dispatch: chọn KTV theo kỹ năng/khu vực/lịch trống, offer có thời hạn (BullMQ), **exclusion constraint** chống trùng lịch KTV.

**TV3 — Thanh toán**

- [ ] `payment-sandbox/` (VNPay giả lập: redirect, ký HMAC, IPN).
- [ ] Module payments: tạo giao dịch từ số tiền của booking, IPN idempotent, tự hết hạn sau 15 phút; bỏ phần giả lập cổng thanh toán trong trình duyệt.
- [ ] Hoàn tiền khi hủy, biên nhận.

**TV4 — Kỹ thuật viên, realtime, thông báo**

- [ ] API `/technician/*` (công việc, đổi trạng thái, báo cáo hoàn thành).
- [ ] Tracking qua Socket.IO + Redis adapter: chỉ KTV được gán mới gửi vị trí, chống GPS giả, tính ETA; thay cho việc gửi `POST /technician/location` mỗi 5 giây.
- [ ] Ảnh trước/sau lưu MinIO (presigned URL).
- [ ] Thông báo in-app + email (Mailpit).
- [ ] Simulator KTV chạy theo lộ trình để demo.

**Vận hành & báo cáo (cả nhóm)**

- [ ] Server staging/production + secret + bật biến `STAGING_DEPLOY_ENABLED` / `DEPLOY_ENABLED`.
- [ ] Release đầu tiên `dev → main`, gắn tag `v0.1.0`.
- [ ] Playwright e2e cho các luồng chính.
- [ ] Đo tải k6, chụp Grafana khi scale 1 → 3 → 5 replica cho báo cáo.
- [ ] Xóa hết route mock khi mọi màn hình đã nối API thật (giữ `legacy/` làm bản đối chiếu giao diện).
- [ ] Báo cáo đồ án và slide (skill `document-skills`).

### 2.3 Hướng phát triển sau MVP 🔭

| Hạng mục         | Dự kiến                                                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Ứng dụng di động | App Expo đầy đủ cho KTV (GPS nền, camera, thông báo đẩy), giữ đúng giao diện bản web                                              |
| Thanh toán       | Cắm VNPay sandbox thật qua adapter `PaymentProvider` đã thiết kế ([ADR-0003](adr/0003-mock-vnpay-gateway.md))                     |
| Tính năng        | Bản đồ realtime cho điều phối, đánh giá KTV, chat khách hàng – KTV, đăng nhập Google, OTP số điện thoại, xác thực 2 lớp cho admin |
| Mở rộng hệ thống | PgBouncer, read replica, chia partition bảng vị trí theo ngày, Redis Sentinel                                                     |
| Kiến trúc        | Tách `tracking` thành microservice; dùng Kafka/RabbitMQ thay cho outbox poll ([system design](architecture/system-design.md) §11) |
| Quan sát         | OpenTelemetry tracing, cảnh báo theo SLO                                                                                          |
| Hạ tầng          | HTTPS + tên miền, Kubernetes, hạ tầng bằng code (Terraform)                                                                       |
| Code             | Chuyển dần các màn hình `.jsx` sang `.tsx` (giữ nguyên giao diện)                                                                 |

## 3. Lộ trình theo phase

### Phase 0 — Nền móng ✅

Hoàn tất (PR #1 đã merge vào `dev`; PR #2 chờ duyệt). Nội dung: mục 2.1.

### Phase 1 — Luồng đặt dịch vụ cơ bản

| TV  | Việc                                                                                                                                   | Xong khi                                                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| TV1 | `profile`: địa chỉ (có lat/lng), thiết bị, nhắc bảo trì; `GET /dashboard`                                                              | Tổng quan / Thiết bị / Hồ sơ đọc API thật, giao diện vẫn khớp bản cũ; e2e có test IDOR |
| TV2 | `catalog` (dịch vụ, add-on, voucher, **báo giá phía server**), `booking` (tạo, hủy, state machine + history + outbox, Idempotency-Key) | Đặt được lịch từ web, không thể sửa giá; unit test bảng chuyển trạng thái              |
| TV3 | `payment-sandbox` + `payments` (URL ký HMAC, IPN idempotent, hết hạn 15')                                                              | Demo được: thành công / thất bại / hủy / IPN gửi lặp 2 lần                             |
| TV4 | Chốt web hay Expo; API `/technician/*`                                                                                                 | Màn hình KTV đọc API thật, đăng nhập và xem việc được trên điện thoại                  |

### Phase 2 — Realtime & điều phối

| TV  | Việc                                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------- |
| TV1 | Admin: quản lý KTV, xem audit log                                                                                          |
| TV2 | `dispatch`: chọn KTV theo kỹ năng/khu vực/lịch trống, offer có timeout (BullMQ), **exclusion constraint** chống trùng lịch |
| TV3 | Hoàn tiền khi hủy (chính sách theo thời điểm hủy), biên nhận PDF/email                                                     |
| TV4 | `tracking` gateway (Socket.IO + Redis adapter), ETA, notifications in-app + email (Mailpit)                                |

### Phase 3 — Hoàn thiện & bảo vệ

- Ảnh trước/sau qua MinIO; simulator KTV để demo.
- Playwright e2e; k6 + ảnh Grafana khi scale 1 → 3 → 5 replica cho báo cáo.
- Deploy qua CD, release `v1.0.0`; viết báo cáo (export sơ đồ Mermaid trong `system-design.md`).

## 4. Quy trình làm việc

```
feat/* fix/* chore/*  ──PR──▶  dev (staging)  ──release PR──▶  main (production)  ──tag vX.Y.Z
hotfix/* (tách từ main) ──PR──▶  main, rồi merge main ngược về dev
```

1. **Nhánh:** tách từ `dev`, đặt tên `feat/<module>-<mô-tả>`, `fix/...`, `chore/...`. Không push thẳng vào `dev` hay `main` (ruleset chặn). Chi tiết: [ADR-0007](adr/0007-branching-strategy.md).
   ```bash
   git switch dev && git pull
   git switch -c feat/booking-create
   ```
2. **Trước khi code:** viết spec ngắn trong `docs/specs/<tính-năng>.md` theo `_template.md` (skill `homecare-feature-workflow`); [specs/identity.md](specs/identity.md) là bản mẫu.
3. **Khi nối dữ liệu cho một màn hình:** API trả đúng dạng dữ liệu của route mock, xóa route mock đó, xử lý các `TODO` trong màn hình, **không sửa giao diện**, rồi so lại với bản cũ ([frontend-migration.md](frontend-migration.md) mục 3 và 6).
4. **Commit:** Conventional Commits (`feat(booking): ...`), không thêm dòng đồng tác giả AI. Lệnh `/commit` của plugin commit-commands giúp viết message.
5. **PR vào `dev`:** điền template; CI phải xanh; ≥ 1 review của thành viên khác (≥ 2 nếu chạm shared kernel); chạy agent `homecare-reviewer` trước khi xin review. Ruleset không cho ai tự duyệt, kể cả chủ repo. Merge xong thì xóa nhánh tính năng.
6. **Thử trên staging:** sau khi merge, CI build image; khi CD được bật, `dev` tự deploy lên staging để cả nhóm thử luồng chéo module.
7. **Phát hành (cuối mỗi phase / trước demo):** một người mở PR `dev → main` ghi tóm tắt thay đổi. Merge xong gắn tag trên `main`:
   ```bash
   git switch main && git pull
   git tag -a v0.1.0 -m "Phase 0: nền móng"
   git push origin v0.1.0
   ```
   CI chặn mọi PR vào `main` không xuất phát từ `dev` hoặc `hotfix/*`.
8. **Hotfix:** tách `hotfix/<mô-tả>` từ `main`, PR vào `main`, rồi mở PR `main → dev` để bản sửa không bị mất ở lần phát hành sau.
9. **Họp ngắn 2 lần/tuần:** mỗi người báo đã xong / sắp làm / đang vướng; **đánh dấu checklist ở mục 2** trong cùng PR với công việc.

## 5. Cấu hình GitHub

| Hạng mục                                                                        | Trạng thái                                                                                                                                          |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ruleset `main`: cấm xóa, cấm force-push, PR + 1 duyệt, CI xanh, `Branch policy` | ✅ Đã bật                                                                                                                                           |
| Ruleset `dev`: cấm xóa, cấm force-push, PR + 1 duyệt, CI xanh                   | ✅ Đã bật                                                                                                                                           |
| Environment `staging` (chỉ nhận `dev`)                                          | ✅ Đã tạo, chưa có secret                                                                                                                           |
| Environment `production` (chỉ nhận `main`, cần người duyệt)                     | ✅ Đã tạo, chưa có secret                                                                                                                           |
| Secret mỗi environment                                                          | ⬜ Cần server: `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `JWT_ACCESS_SECRET`, `POSTGRES_PASSWORD`, `MINIO_ROOT_PASSWORD`, `GRAFANA_ADMIN_PASSWORD` |
| Biến repo `STAGING_DEPLOY_ENABLED`, `DEPLOY_ENABLED`                            | ⬜ Bật khi đã có server                                                                                                                             |
| `.github/CODEOWNERS`                                                            | ⬜ Cần điền username                                                                                                                                |

Lưu ý: GitHub chỉ kích hoạt workflow CD khi file đã có trên nhánh mặc định `main`, nên CD chạy được từ sau release `dev → main` đầu tiên.
