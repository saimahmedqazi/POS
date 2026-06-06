# 🛒 CYBSOC Point of Sale (POS)

> A high-performance, multi-platform Software-as-a-Service Point of Sale ecosystem.

![CYBSOC POS](/apps/mobile/assets/icon.png)

Welcome to the CYBSOC POS Monorepo! This repository contains the complete suite of applications required to run, manage, and scale the CYBSOC POS ecosystem. It is powered by React, Tauri, React Native, and Supabase.

---

## 📚 Official Documentation

To understand how this massive system is glued together, please read our official documentation:

- 🏗️ **[System Architecture](docs/ARCHITECTURE.md)**: Visual diagrams of how the platforms and backend databases communicate.
- 🔄 **[CI/CD & Workflows](docs/WORKFLOWS.md)**: Flowcharts explaining the automated deployment pipelines and license authentication logic.
- 📁 **[Monorepo Structure](docs/STRUCTURE.md)**: A breakdown of how the folders, dependencies, and Turborepo caching work.
- 🗄️ **[Class Diagram & Models](docs/CLASS_DIAGRAM.md)**: The database schema and entity-relationship models for the Supabase backend.
- 📐 **[Application Wireframes](docs/WIREFRAMES.md)**: UI layout blueprints and visual hierarchy for the three core applications.

---

## 🚀 Quick Start (Development)

This project uses `pnpm` workspaces to manage all applications from the root folder.

### 1. Install Dependencies
```bash
# From the root directory, this will install dependencies for ALL apps
pnpm install
```

### 2. Run the CYBSOC Admin Portal
The internal dashboard used to generate and manage SaaS license keys.
```bash
pnpm --filter admin run dev
```

### 3. Run the Desktop POS (Tauri)
The primary Windows application used by retail cashiers.
```bash
pnpm --filter web run tauri dev
```

### 4. Run the Retailer Mobile App
The mobile companion app built with React Native.
```bash
pnpm --filter mobile run start
```

---

## ☁️ Deployment Pipelines

We have fully automated our deployment processes using GitHub Actions. You never need to build binaries locally!

- **Admin Portal**: Automatically deploys to **GitHub Pages** whenever code in `apps/admin` is pushed to `main`.
- **Desktop POS**: Automatically compiles an `.exe`, signs it cryptographically, and publishes a **GitHub Release** whenever you push a `v*` tag (e.g., `git tag v1.0.0 && git push origin v1.0.0`). The desktop app has an Auto-Updater that will seamlessly download these releases.
- **Retailer Mobile App**: Automatically spins up an Expo Application Services (EAS) cloud server and outputs a Universal `.apk` whenever you push a `mobile-v*` tag (e.g., `git tag mobile-v1.0.0 && git push origin mobile-v1.0.0`).

---

## 🔐 Security

This project relies on **Row Level Security (RLS)** via Supabase. 
- The master Service Role Key has been strictly ripped out of the frontend code.
- Ensure your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provided in your GitHub Secrets for the CI/CD pipelines to build successfully.
