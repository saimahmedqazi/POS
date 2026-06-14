# CybSOC POS

> **A full-stack point-of-sale system** built for offline-first retail operations, powered by CybSOC.

---

## Apps

| App | Stack | Description |
|-----|-------|-------------|
| **POS Desktop** | Tauri v2 + React + Vite | Windows offline POS terminal |
| **Retailer Mobile** | Expo / React Native | Android mobile app for retailers |
| **Admin Panel** | React + Vite → GitHub Pages | SaaS license management dashboard |

---

## Architecture

```
POS/
├── apps/
│   ├── web/          # Tauri desktop app (Windows .exe)
│   ├── mobile/       # Expo Android app (.apk)
│   └── admin/        # GitHub Pages admin dashboard
├── .github/
│   └── workflows/
│       ├── release-app.yml      # Builds Windows installer on git tag
│       ├── build-mobile.yml     # EAS Android build trigger
│       └── deploy-admin.yml     # Deploys admin to GitHub Pages
```

**Backend:** Supabase (PostgreSQL + Auth + Edge Functions + Storage)

---

## Setup

### Prerequisites
- Node.js 20+, pnpm 9+
- Rust (for Tauri builds)
- Expo CLI + EAS CLI (for mobile)

### Install
```bash
pnpm install
```

### Environment Variables
Copy `.env.example` to `.env` in each app directory:

**`apps/web/.env`**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**`apps/admin/.env`**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**`apps/mobile/.env`**
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Development

```bash
# POS Desktop
pnpm --filter web tauri dev

# Admin Panel
pnpm --filter admin dev

# Mobile
cd apps/mobile && npx expo start
```

---

## Releasing

### POS Desktop (Windows)
Push a git tag to trigger the GitHub Actions release pipeline:
```bash
git tag v1.0.0
git push origin main --tags
```
The workflow builds a signed Windows `.msi` and `.exe` installer and uploads them to GitHub Releases automatically.

### Mobile App (Android)
```bash
cd apps/mobile
npx eas-cli build --platform android --profile production
```
Download the `.apk` from the EAS build dashboard.

### Admin Panel
Any push to `main` that touches `apps/admin/` automatically deploys to GitHub Pages.

---

## Features

### POS Desktop
- 🔐 Offline PIN authentication
- 🛒 Full cart + barcode scanner support (F3)
- 📦 Inventory management with stock tracking
- 💳 Customer ledger & credit management
- 📊 Sales reports & analytics dashboard
- ☁️ Cloud backup & restore to Supabase
- 🖨️ Standard + Thermal print receipts
- 🔄 Auto-updater via GitHub Releases
- 🌙 Dark/Light/System theme + accent colors

### Retailer Mobile
- 📱 Browse products & place orders
- 🛒 Full cart management
- ✅ Order confirmation with summary
- 🔐 Supabase auth login

### Admin Panel
- 🏢 License overview dashboard
- ⚙️ Issue, suspend, expire licenses
- 📈 Active / Expired / Expiring-soon metrics

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Desktop shell | Tauri v2 (Rust) |
| Frontend | React 19, Vite 8, TypeScript |
| Styling | Vanilla CSS + custom design tokens |
| State | Zustand |
| Mobile | Expo SDK 54, React Native 0.81 |
| Database (local) | SQLite via Tauri plugin |
| Backend | Supabase (Postgres, Auth, Edge Functions) |
| CI/CD | GitHub Actions |
| Mobile builds | EAS (Expo Application Services) |

---

## License

Proprietary — © 2025 CybSOC. All rights reserved.

---

<div align="center">
  <sub>Powered by <strong>CybSOC</strong></sub>
</div>
