# HomeCare mobile (Expo)

App cho **khách hàng và kỹ thuật viên**. Hiện mới là khung: một màn chào. Đăng nhập và các tab theo vai trò làm ở các ticket sau (xem `docs/backlog.md`).

| Thành phần | Phiên bản                                      |
| ---------- | ---------------------------------------------- |
| Expo SDK   | 58 (React Native 0.88, React 19.3)             |
| Điều hướng | Expo Router, màn hình nằm trong `src/app/`     |
| Giao diện  | NativeWind 4.2.7 + Tailwind 3.4.19 (giống web) |
| Icon       | lucide-react-native 1.71.0 (giống web)         |

## Chạy thử

```bash
pnpm install                       # ở thư mục gốc repo
pnpm --filter @homecare/mobile start
```

Quét mã QR hiện ra bằng app **Expo Go** (Android hoặc iPhone, cùng mạng Wi-Fi với máy tính).

## Quy ước

- Chỉ cài thư viện bằng `npx expo install <tên>` (chạy trong `mobile/`) để lấy đúng phiên bản hợp với SDK.
- Giao diện giống ≥ 90% prototype: dùng lại màu, font, icon, câu chữ; bố cục theo điện thoại.
- `react-native-css-interop` được khai báo trực tiếp vì pnpm cài thư viện tách biệt: NativeWind cần nó ở cấp app. Khi nâng NativeWind phải nâng cả gói này cho khớp.
