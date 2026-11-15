# HomeCare — nền tảng dịch vụ chăm sóc nhà

Đồ án SE405 — nhóm 4 người. Khách hàng đặt dịch vụ vệ sinh/sửa chữa/bảo trì, thanh toán qua cổng mô phỏng VNPay và theo dõi kỹ thuật viên **theo thời gian thực**; kỹ thuật viên nhận và làm việc trên màn hình riêng (bản web hiện có, app Expo dự kiến); quản trị viên điều hành qua web console.

**Kiến trúc:** NestJS modular monolith · PostgreSQL + Prisma · Redis · Nginx load balancer (nhiều replica) · React 19 + Vite (giao diện 1:1 bản prototype) · Expo _(dự kiến)_ · Docker · GitHub Actions CI/CD · Prometheus/Grafana.

| Tài liệu                                                                 | Nội dung                                                                                    |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [docs/team.md](docs/team.md)                                             | Phân công, **checklist đã làm / chưa làm / hướng phát triển**, lộ trình, quy trình làm việc |
| [docs/architecture/system-design.md](docs/architecture/system-design.md) | Thiết kế hệ thống: C4, ERD, luồng chính, chống bypass, load balancing, CI/CD                |
| [docs/frontend-migration.md](docs/frontend-migration.md)                 | Quy tắc giao diện giống y hệt bản cũ, mock API, cách nối API thật                           |
| [docs/specs](docs/specs)                                                 | Spec từng tính năng; [identity](docs/specs/identity.md) là bản mẫu                          |
| [docs/adr](docs/adr)                                                     | Các quyết định kiến trúc (ADR 0001–0007)                                                    |
| [CLAUDE.md](CLAUDE.md)                                                   | Quy tắc bắt buộc cho cả nhóm (và cho Claude Code)                                           |

## Trạng thái hiện tại

- ✅ **Nền móng xong:** monorepo, shared kernel (cấu hình, log, lỗi chuẩn, audit, outbox + worker), Prisma schema cho toàn bộ MVP, load balancer + 3 replica, CI/CD, ruleset GitHub.
- ✅ **Module identity xong:** đăng ký, đăng nhập (email / mã KTV), refresh token xoay vòng, đăng xuất tức thì trên mọi replica, khóa tạm, phân quyền, admin khóa/mở khóa người dùng.
- ✅ **Giao diện:** 11 màn hình chuyển 1:1 từ bản prototype (đã so khớp HTML với bản cũ). Đăng nhập dùng API thật, các màn hình nghiệp vụ dùng **dữ liệu giả** (`frontend/src/mocks`).
- ⬜ **Tiếp theo:** mỗi người làm API thật cho domain của mình (catalog/booking, payments + sandbox, tracking realtime, profile…) rồi thay dần mock.

Chi tiết từng hạng mục và ai phụ trách: [docs/team.md mục 2](docs/team.md#2-checklist-tiến-độ).

## Cấu trúc repo — BE ở đâu, FE ở đâu

```
HomeCare_SE405/
├─ backend/            ← BACKEND (NestJS)
│  ├─ src/main.ts              điểm khởi động API (HTTP)
│  ├─ src/worker.ts            tiến trình nền: gửi outbox, job định kỳ
│  ├─ src/app.module.ts        nơi ghép các module
│  ├─ src/modules/<module>/    code nghiệp vụ, mỗi module một thư mục (hiện có: identity)
│  ├─ src/common/              phần dùng chung: cấu hình, log, xử lý lỗi, health, audit, outbox
│  ├─ prisma/schema/           thiết kế database, mỗi module một file
│  └─ test/                    test e2e
├─ frontend/           ← FRONTEND (React)
│  └─ src/
│     ├─ main.tsx, App.tsx     khởi động + định tuyến trang
│     ├─ features/<màn hình>/  các màn hình nghiệp vụ, copy 1:1 từ bản cũ (không sửa giao diện)
│     ├─ layouts/              khung giao diện khách hàng (bản cũ) và admin (mới)
│     ├─ pages/                đăng nhập (bản cũ), 404, admin
│     ├─ auth/                 phiên đăng nhập, chặn trang theo vai trò
│     ├─ mocks/                dữ liệu giả chép từ backend cũ, thay dần bằng API thật
│     └─ lib/api-client.ts     chỗ frontend gọi backend (hoặc mock)
├─ packages/shared/     ← quy ước dữ liệu chung BE–FE (schema form, mã lỗi, enum)
├─ infra/               ← Docker: database, Redis, Nginx load balancer, Grafana
├─ tests/load/          ← script đo tải (k6)
├─ .github/             ← CI/CD chạy trên GitHub
├─ docs/                ← tài liệu thiết kế, ADR, spec, phân công, hướng dẫn
├─ legacy/              ← bản prototype cũ (JS) = bản đặc tả giao diện; không chạy, không import
└─ .claude/             ← cấu hình Claude Code cho nhóm, không phải code của app
```

Sẽ thêm: `payment-sandbox/` (cổng VNPay giả lập, TV3) và `mobile/` (app Expo nếu nhóm chốt, TV4).

**Đọc code từ đâu?** Đi theo luồng đăng nhập, đúng thứ tự một request chạy qua:

1. `frontend/src/pages/LoginPage.jsx` — form người dùng nhập (giao diện cũ)
2. `frontend/src/auth/auth-context.tsx` → `frontend/src/lib/api-client.ts` — gửi `POST /api/v1/auth/login`, giữ token trong bộ nhớ
3. `backend/src/modules/identity/auth.controller.ts` — backend nhận request
4. `backend/src/modules/identity/auth.service.ts` — kiểm tra mật khẩu, tạo phiên
5. `backend/src/modules/identity/token.service.ts` — tạo token
6. `backend/prisma/schema/identity.prisma` — bảng `users`, `sessions`

Màn hình nghiệp vụ đi đường khác: ví dụ `features/dashboard/DashboardPage.jsx` gọi `apiFetch('/dashboard')`, và `api-client.ts` trả dữ liệu từ `mocks/legacy-server.js` cho đến khi có API thật.

Mọi module sau này (booking, payments…) đều viết theo đúng khung của identity.

## Yêu cầu

- Node.js ≥ 22 (khuyên dùng 24) và pnpm 10: `corepack enable` (hoặc `npm i -g pnpm@10`)
- Docker Desktop

## Chạy lần đầu

```bash
pnpm install
pnpm infra:up                     # Postgres, Redis, Mailpit, MinIO
cp .env.example backend/.env     # PowerShell: Copy-Item .env.example backend/.env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

- Web: <http://127.0.0.1:3020>
- API + Swagger: <http://localhost:4000/api/docs>
- Mailpit (email dev): <http://localhost:8025>

Đã clone repo từ trước khi đổi tên thư mục (`apps/api`, `apps/web`)? Chuyển file `apps/api/.env` sang `backend/.env` rồi chạy lại `pnpm install`.

Giao diện giống y hệt bản prototype. Đăng nhập dùng API thật; các màn hình nghiệp vụ tạm dùng **dữ liệu giả** chép từ backend cũ, tải lại trang là dữ liệu về như ban đầu. Tắt mock: chạy với `VITE_USE_MOCKS=false`. Xem [docs/frontend-migration.md](docs/frontend-migration.md).

### Tài khoản mẫu (mật khẩu chung: `Homecare@123`)

| Vai trò       | Đăng nhập bằng                                      |
| ------------- | --------------------------------------------------- |
| Quản trị      | `admin@homecare.test`                               |
| Khách hàng    | `khang.nguyen@example.com`, `linh.tran@example.com` |
| Kỹ thuật viên | `TECH-088`, `TECH-018`, `TECH-027`, `TECH-041`      |

Dữ liệu giả có sẵn cho `khang.nguyen@example.com`, `linh.tran@example.com` và `TECH-088`; tài khoản khác thấy màn hình trống.

## Quy trình nhánh

```
feat/* fix/* ──PR──▶ dev (staging) ──release PR──▶ main (production)
```

Tách nhánh từ `dev` và mở PR vào `dev`. `main` chỉ nhận release PR từ `dev` hoặc `hotfix/*`. Chi tiết: [docs/team.md](docs/team.md#4-quy-trình-làm-việc), [ADR-0007](docs/adr/0007-branching-strategy.md).

## Kiểm tra chất lượng

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test          # unit backend + test mock API của frontend
pnpm test:e2e      # e2e trên Postgres/Redis thật (DB homecare_test), cần infra:up
```

CI chạy đúng các lệnh này (kèm build và image Docker) cho mọi PR.

## Chạy như production (load balancer + nhiều replica)

```bash
pnpm stack:up      # http://localhost:8080 — Nginx + 3 replica API + worker
pnpm obs:up        # Prometheus :9090, Grafana :3001 (dashboard "HomeCare API — overview")
docker compose -f infra/docker-compose.yml -f infra/docker-compose.stack.yml --profile stack up -d --scale api=5
k6 run tests/load/auth-smoke.js
```

Mỗi response có header `x-served-by` cho biết replica nào đã xử lý.

## Làm việc với Claude Code

Repo đã khai báo sẵn plugin trong `.claude/settings.json`. Khi mở repo và chọn tin cậy thư mục, Claude Code sẽ hỏi cài các plugin sau:

- **superpowers** — quy trình brainstorm → plan → TDD → review
- **agent-skills** — spec, API design, security, CI/CD, ADR
- **feature-dev**, **pr-review-toolkit**, **security-guidance**, **commit-commands**, **typescript-lsp**, **frontend-design** — plugin chính thức của Anthropic (`frontend-design` chỉ dùng cho **màn hình mới**, không dùng để sửa màn hình đã chuyển từ bản cũ)
- **c4-architecture**, **database-design**, **backend-api-security**, **payment-processing**, **cicd-automation**, **observability-monitoring** — từ wshobson/agents
- **document-skills** — viết báo cáo đồ án (docx, pptx, pdf)

Ngoài ra repo có skill và agent riêng của dự án trong `.claude/skills` (`homecare-feature-workflow`, `nest-module`, `homecare-review`) và `.claude/agents` (`homecare-architect`, `homecare-reviewer`). Quy trình làm việc chi tiết nằm trong [CLAUDE.md](CLAUDE.md).

Plugin `typescript-lsp` cần cài thêm language server:

```bash
npm i -g typescript-language-server typescript
```

## Code cũ (`legacy/`)

Prototype JS ban đầu được giữ trong [`legacy/`](legacy) làm **bản đặc tả giao diện**: mọi màn hình trong `frontend` phải giống y hệt `legacy/web/src` (yêu cầu của khách hàng). Thư mục này không chạy trong app mới và không được import. **Giữ lại** kể cả khi đã nối hết API thật, để còn đối chiếu giao diện ([docs/frontend-migration.md](docs/frontend-migration.md) mục 3).
