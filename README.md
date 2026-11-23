# HomeCare — nền tảng dịch vụ chăm sóc nhà

Đồ án SE405 — nhóm 4 người. **Sàn dịch vụ tại nhà** (vệ sinh, sửa chữa, bảo trì thiết bị): khách và kỹ thuật viên dùng chung một **app Expo**, HomeCare đứng giữa để giữ tiền, điều phối và giải quyết khiếu nại; quản trị viên điều hành qua web console.

**Kiến trúc:** NestJS modular monolith · PostgreSQL + Prisma · Redis · Nginx load balancer (nhiều replica) · React 19 + Vite (giao diện 1:1 bản prototype) · Expo (app khách + thợ) · Docker · GitHub Actions CI/CD · Prometheus/Grafana.

| Tài liệu                                                                 | Nội dung                                                                         |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| [docs/ke-hoach.md](docs/ke-hoach.md)                                     | **Đọc trước:** kế hoạch đến buổi bảo vệ, cách làm trên Jira, cách tránh conflict |
| [docs/specs/current-app.md](docs/specs/current-app.md)                   | App đang làm gì thật (kiểm thử 22/11), lỗi tìm được, tính năng đã có / sẽ làm    |
| [docs/team.md](docs/team.md)                                             | Phân công, những gì đã làm, quy trình nhánh/PR, cấu hình GitHub                  |
| [docs/architecture/system-design.md](docs/architecture/system-design.md) | Thiết kế hệ thống: C4, ERD, luồng chính, chống bypass, load balancing, CI/CD     |
| [docs/frontend-migration.md](docs/frontend-migration.md)                 | Quy tắc giao diện giống y hệt bản cũ, mock API, cách nối API thật                |
| [docs/specs](docs/specs)                                                 | Spec từng tính năng; [identity](docs/specs/identity.md) là bản mẫu               |
| [docs/adr](docs/adr)                                                     | Các quyết định kiến trúc (ADR 0001–0007)                                         |
| [CLAUDE.md](CLAUDE.md)                                                   | Quy tắc bắt buộc cho cả nhóm (và cho Claude Code)                                |

## Sản phẩm khi hoàn thành (cuối 12/2026) — nhóm bám theo phần này

### 1. Khách mở app: app tự biết khách cần gì

- Đăng nhập bằng vân tay hoặc Face ID.
- Trang chủ có mục "Gợi ý cho bạn" kèm lý do, ví dụ: "Máy lạnh phòng ngủ đã 5 tháng chưa vệ sinh, tuần này Thủ Đức nắng 37°C, có 3 thợ rảnh trong bán kính 2 km".
- Gợi ý dựa trên vị trí, thời tiết, thiết bị trong nhà, lịch sử đặt và xu hướng khu vực. Không mở app vẫn nhận được push chủ động với nội dung tương tự.
- Tem QR dán trên máy lạnh, máy giặt: khách quét là thấy lịch sử bảo trì của đúng máy đó và đặt lại một chạm. Lần đầu đến nhà, thợ là người dán tem và nhập model, nên khách không phải tự gõ thông tin thiết bị.

### 2. Đặt lịch bằng cách chat với AI

- Khách gõ (hoặc nói): "Đặt vệ sinh máy lạnh sáng thứ 7 ở nhà".
- AI tự tìm dịch vụ, báo giá, xem khung giờ còn trống, hỏi lại khi cần, rồi đưa ra thẻ đặt lịch có nút Xác nhận.
- Giá luôn do server tính, và thao tác nào dính đến tiền cũng phải chính khách bấm xác nhận.
- Cùng bộ công cụ đó được mở qua MCP: lúc demo, đặt được lịch HomeCare ngay từ Claude Desktop.
- Vẫn đặt lịch theo cách bấm truyền thống được. Hệ thống tự chọn thợ phù hợp theo khoảng cách, kỹ năng, điểm đánh giá và lịch trống; thợ không nhận trong thời hạn thì tự chuyển cho người kế tiếp.

### 3. Thanh toán kiểu sàn

- Khách trả **khi việc xong**, sau khi thấy giá cuối trên app. Với sửa chữa, thợ báo giá tại nhà trong app và khách bấm duyệt trước khi làm.
- Trả qua cổng giả lập kiểu VNPay (nhập thẻ test, nhập OTP; app không bao giờ chạm vào số thẻ) hoặc trả tiền mặt cho thợ. Hai cách cùng một giá do server tính.
- Sổ cái của thợ: tiền trả qua app được HomeCare giữ 24 giờ rồi mới thành thu nhập rút được; tiền mặt thì thợ nợ hoa hồng, nợ quá hạn mức thì tạm ngưng nhận việc.
- Demo được đủ tình huống: thành công, thẻ bị từ chối, hủy giữa chừng, cổng gửi báo kết quả 2 lần mà vẫn chỉ ghi nhận 1 lần.
- Lưu thẻ, trả một chạm bằng vân tay: nếu kịp.

### 4. Theo dõi thợ như Grab

- Bản đồ hiện vị trí thợ di chuyển realtime cùng ETA.
- Thợ vào bán kính 100 m quanh nhà thì app tự báo "Thợ đã đến", thợ không cần bấm gì.
- Hệ thống phát hiện và đánh dấu GPS giả (vị trí nhảy bất thường).
- Chạy được khi khách và thợ kết nối vào hai máy chủ khác nhau sau load balancer. Đây là phần nối tiếp seminar Load Balancer của nhóm.

### 5. Phía thợ

- Nhận việc từ thông báo push, có nút Nhận/Từ chối.
- GPS chạy nền, tự điều chỉnh tần suất theo tốc độ di chuyển và mức pin.
- Chụp ảnh trước/sau bằng camera, ảnh được lưu lên server; không có ảnh thì không hoàn thành được việc.
- Mất sóng vẫn cập nhật được việc, có mạng lại thì tự đồng bộ (nếu kịp).
- Màn thu nhập thể hiện rõ phần tiền đã trừ hoa hồng cho sàn.

### 6. Kết thúc: giải ngân hoặc khiếu nại

- Khách bấm "Xác nhận hài lòng" (hoặc tự động sau 24 giờ) thì thu nhập của thợ mới rút được.
- Nếu không hài lòng trong 24 giờ, khách mở khiếu nại kèm ảnh. Thu nhập của thợ bị giữ lại cho đến khi admin xử lý: hoàn tiền, cho thợ làm lại, hoặc tặng voucher. Sửa chữa được bảo hành 7 ngày (làm lại miễn phí).
- Quy tắc chi tiết (hủy, khách vắng, không có thợ nhận, chống giao dịch ngoài sàn): [docs/specs/luong-nghiep-vu.md](docs/specs/luong-nghiep-vu.md).

### 7. Chăm sóc khách hàng

- Chat với thợ ngay trong app, không lộ số điện thoại của hai bên (để hai bên không giao dịch riêng ngoài sàn).
- Chat hỗ trợ: bot trả lời trước (tra đơn, chính sách hủy và hoàn tiền), rồi chuyển cho nhân viên khi chuyện liên quan tiền hoặc bot không giải quyết được.
- Có nút gọi hotline. Gọi thoại ngay trong app chỉ làm nếu kịp.

### 8. Admin trên web

Các màn điều hành: điều phối (gán tay thợ), đối soát giao dịch và hoàn tiền, hàng đợi hỗ trợ và khiếu nại, quản lý thợ, nhật ký thao tác. Nếu kịp thì thêm bản đồ nhiệt nhu cầu theo khu vực.

### Chủ đề seminar nhóm trình bày được

| Chủ đề                         | Thể hiện ở đâu                                          |
| ------------------------------ | ------------------------------------------------------- |
| Load balancer                  | 3 máy chủ sau Nginx, realtime vẫn chạy chéo máy (đã có) |
| Authentication & Authorization | Token, phân quyền 3 vai trò, vân tay/Face ID            |
| WebSocket / Realtime           | Theo dõi thợ, chat, thông báo                           |
| Location-based Services        | Gợi ý theo vị trí, geofence, điều phối theo khoảng cách |
| QR code                        | Tem thiết bị                                            |
| Mobile Payment & Fintech       | Cổng giả lập, OTP, giữ tiền rồi giải ngân, hoàn tiền    |
| ChatBot / AI                   | Agent đặt lịch, MCP, bot hỗ trợ                         |

## Trạng thái hiện tại

- ✅ **Nền móng xong:** monorepo, shared kernel (cấu hình, log, lỗi chuẩn, audit, outbox + worker), Prisma schema cho toàn bộ MVP, load balancer + 3 replica, CI/CD, ruleset GitHub.
- ✅ **Module identity xong:** đăng ký, đăng nhập (email / mã KTV), refresh token xoay vòng, đăng xuất tức thì trên mọi replica, khóa tạm, phân quyền, admin khóa/mở khóa người dùng.
- ✅ **Giao diện:** 11 màn hình chuyển 1:1 từ bản prototype (đã so khớp HTML với bản cũ). Đăng nhập dùng API thật, các màn hình nghiệp vụ dùng **dữ liệu giả** (`frontend/src/mocks`).
- ⬜ **Tiếp theo:** app Expo, API thật cho từng domain và các tính năng ở trên. Kế hoạch, Jira và cách tránh conflict: [docs/ke-hoach.md](docs/ke-hoach.md).

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

`mobile/` là app Expo cho khách và kỹ thuật viên (hướng dẫn chạy: [mobile/README.md](mobile/README.md)). Sẽ thêm: `payment-sandbox/` (cổng VNPay giả lập, TV3).

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

### Tài khoản mẫu

`pnpm db:seed` tạo các tài khoản test theo biến `SEED_*` trong `backend/.env`. Mật khẩu chung là `SEED_PASSWORD` (mặc định trong `.env.example`: `Homecare@123`). Chạy lại seed sẽ đặt lại tên, số điện thoại và mật khẩu của các tài khoản này. Khi deploy staging, đổi email và mật khẩu riêng; seed từ chối chạy khi `NODE_ENV=production`.

| Vai trò       | Đăng nhập bằng (mặc định)                                                                            |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| Quản trị      | `SEED_ADMIN_EMAIL` = `admin@homecare.test`                                                           |
| Khách hàng    | `SEED_CUSTOMER_EMAIL`, `SEED_CUSTOMER_2_EMAIL` = `khang.nguyen@example.com`, `linh.tran@example.com` |
| Kỹ thuật viên | `TECH-088`, `TECH-018`, `TECH-027`, `TECH-041`                                                       |

Mọi dữ liệu cá nhân trong seed và mock đều là giả: số điện thoại dải `0900 000 xxx`, email đuôi `example.com` / `homecare.test`.

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
