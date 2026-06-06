# CI/CD and Auth Workflows

The CYBSOC POS system heavily relies on automation and secure workflows. This document illustrates the critical paths for Deployment and License Authentication.

## Automated Deployment Pipelines (CI/CD)

All deployments are fully automated using GitHub Actions. Developers never need to manually compile or upload binaries.

```mermaid
graph TD
    Developer[Developer] -->|git push| GitHubRepo(GitHub Repository)

    subgraph CI [GitHub Actions Automation]
        
        %% Admin Pipeline
        direction TB
        subgraph AdminCI [Deploy Admin Panel]
            Trigger1{Push to main}
            BuildAdmin[pnpm build admin]
            PublishPages[Publish to GitHub Pages]
            
            Trigger1 --> BuildAdmin
            BuildAdmin --> PublishPages
        end

        %% Desktop Pipeline
        subgraph DesktopCI [Deploy Tauri Desktop]
            Trigger2{Push tag v*}
            BuildTauri[Compile Rust / Tauri]
            SignExe[Cryptographic Signature]
            ReleaseHub[Create GitHub Release]
            
            Trigger2 --> BuildTauri
            BuildTauri --> SignExe
            SignExe --> ReleaseHub
        end

        %% Mobile Pipeline
        subgraph MobileCI [Deploy Mobile APK]
            Trigger3{Push tag mobile-v*}
            EASCLI[eas build --android]
            ExpoCloud[Expo Cloud Servers]
            OutputAPK[Generate Universal APK]
            
            Trigger3 --> EASCLI
            EASCLI --> ExpoCloud
            ExpoCloud --> OutputAPK
        end
    end
    
    GitHubRepo --> Trigger1
    GitHubRepo --> Trigger2
    GitHubRepo --> Trigger3
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
