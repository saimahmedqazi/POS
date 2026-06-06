# CI/CD and Auth Workflows

The CYBSOC POS system heavily relies on automation and secure workflows. This document illustrates the critical paths for Deployment and License Authentication.

## Automated Deployment Pipelines (CI/CD)

All deployments are fully automated using GitHub Actions. Developers never need to manually compile or upload binaries.

```mermaid
graph TD
    Developer([Developer]) -->|git push| Repo[(GitHub Repository)]

    subgraph CI [GitHub Actions Automation]
        subgraph AdminCI [Admin Portal]
            T1{Push main} --> BA[Build Admin] --> PP[Publish to Pages]
        end

        subgraph DesktopCI [Desktop POS]
            T2{Push v*} --> BT[Compile Tauri] --> SE[Sign Exe] --> RH[GitHub Release]
        end

        subgraph MobileCI [Mobile APK]
            T3{Push mobile-v*} --> EAS[eas build] --> EC[Expo Cloud] --> OA[Generate APK]
        end
    end

    Repo --> T1
    Repo --> T2
    Repo --> T3
```

## License Authentication Workflow

Because this is a SaaS product, clients must activate their machines using a valid CYBSOC license key before the POS system unlocks.

```mermaid
sequenceDiagram
    participant Admin as CYBSOC Admin
    participant DB as Supabase DB
    participant App as Desktop POS
    participant User as Retailer

    %% Generation
    Admin->>DB: Generates new License Key (Active)
    Admin->>User: Emails License Key securely

    %% Activation
    User->>App: Enters License Key on POS Startup
    App->>DB: Validates License Key
    
    alt Key Invalid or Expired
        DB-->>App: Return Error
        App-->>User: Display "License Invalid/Expired"
    else Key Valid
        DB->>DB: Bind Machine ID to License
        DB-->>App: Return Success Token
        App-->>User: Unlock POS Dashboard
    end
    
    %% Revocation
    Admin->>DB: Suspends License
    App->>DB: Periodic Heartbeat Check
    DB-->>App: Status: Suspended
    App-->>User: Lock POS, Force Exit
```
