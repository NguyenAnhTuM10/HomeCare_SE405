# Phân công, tiến độ & lộ trình — nhóm 4 người

> **Kế hoạch hiện tại (app Expo, sàn hai phía) ở [ke-hoach.md](ke-hoach.md).**
>
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

### 2.2 Việc tiếp theo

Xem [ke-hoach.md](ke-hoach.md) (kế hoạch, Jira, cách tránh conflict) và [backlog.md](backlog.md). Tính năng cần đạt: [README](../README.md#sản-phẩm-khi-hoàn-thành-cuối-122026--nhóm-bám-theo-phần-này).

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
