# Folder Structure

The project is structured as a **Monorepo** managed by `pnpm` workspaces. This architecture allows all three platforms (Admin, Web/Desktop, Mobile) to coexist in a single repository, sharing configurations, dependencies, and core logic.

## Directory Tree

```text
POS/
├── apps/                        # Application Workspaces
│   ├── admin/                   # 🖥️ CYBSOC Admin Portal (React / Vite)
│   │   ├── src/                 # React source code
│   │   └── package.json         # Admin dependencies
│   │
│   ├── web/                     # 💻 Desktop POS App (React / Tauri)
│   │   ├── src/                 # React UI for Cashiers
│   │   ├── src-tauri/           # Rust Core, Auto-Updater config, OS Hooks
│   │   └── package.json         # Desktop dependencies
│   │
│   └── mobile/                  # 📱 Retailer Mobile App (React Native / Expo)
│       ├── assets/              # App icons, splash screens
│       ├── src/                 # React Native source code
│       ├── app.json             # Expo native configuration
│       ├── eas.json             # Expo Application Services CI/CD config
│       └── package.json         # Mobile dependencies
│
├── docs/                        # 📚 Project Documentation
│   ├── ARCHITECTURE.md          # High-level system design
│   ├── WORKFLOWS.md             # CI/CD and Auth Flowcharts
│   └── STRUCTURE.md             # This file
│
├── packages/                    # 📦 Shared Internal Packages (Optional)
│   └── (shared UI or logic)
│
├── .github/
│   └── workflows/               # ⚙️ GitHub Actions CI/CD Pipelines
│       ├── deploy-admin.yml     # Automates Admin Panel to GitHub Pages
│       ├── release-app.yml      # Automates Tauri .exe Releases
│       └── build-mobile.yml     # Automates Expo APK builds
│
├── package.json                 # Root dependencies and workspace scripts
├── pnpm-workspace.yaml          # Defines monorepo paths
└── turbo.json                   # Turborepo caching configuration
```

## Key Concepts

1. **Monorepo Management**: Running `pnpm install` at the root seamlessly installs and links dependencies across all nested applications.
2. **Turborepo (`turbo.json`)**: Used to aggressively cache builds. If you build `apps/admin` twice, Turborepo instantly returns the cached build from `.turbo/` instead of recompiling.
3. **Environment Isolation**: Each app has its own `.env` file and handles its own environment variables, allowing `apps/mobile` and `apps/web` to use different Supabase API keys if necessary.
