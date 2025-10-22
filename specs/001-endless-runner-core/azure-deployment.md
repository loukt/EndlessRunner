# Azure Deployment Architecture

## Overview

The EndlessRunner game is deployed as a Progressive Web App (PWA) on Azure using Azure Static Web Apps with Azure Front Door CDN for global distribution and optimal performance.

## Architecture Diagrams

### 1. High-Level Azure Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Mobile["Mobile Browsers<br/>(iOS 14+, Android 8+)"]
        Desktop["Desktop Browsers<br/>(Chrome, Safari, Firefox)"]
    end
    
    subgraph "Azure Global Edge"
        AFD["Azure Front Door<br/>(CDN + WAF)"]
        AFD_POP1["Edge POP<br/>North America"]
        AFD_POP2["Edge POP<br/>Europe"]
        AFD_POP3["Edge POP<br/>Asia Pacific"]
    end
    
    subgraph "Azure Static Web Apps"
        SWA["Static Web App<br/>(Primary Region)"]
        Assets["Static Assets<br/>(HTML, CSS, JS, Images)"]
        ServiceWorker["Service Worker<br/>(PWA Offline Support)"]
    end
    
    subgraph "Client Storage"
        IDB["IndexedDB<br/>(50MB+ Quota)"]
        LS["localStorage<br/>(5-10MB Fallback)"]
    end
    
    subgraph "Optional: Payment Processing"
        PaymentAPI["Payment Provider API<br/>(Stripe/PayPal)"]
    end
    
    Mobile --> AFD
    Desktop --> AFD
    AFD --> AFD_POP1
    AFD --> AFD_POP2
    AFD --> AFD_POP3
    AFD_POP1 --> SWA
    AFD_POP2 --> SWA
    AFD_POP3 --> SWA
    SWA --> Assets
    SWA --> ServiceWorker
    ServiceWorker --> IDB
    ServiceWorker --> LS
    Mobile -.->|IAP| PaymentAPI
    Desktop -.->|IAP| PaymentAPI
    
    classDef azure fill:#0078D4,stroke:#fff,stroke-width:2px,color:#fff
    classDef client fill:#107C10,stroke:#fff,stroke-width:2px,color:#fff
    classDef storage fill:#FF8C00,stroke:#fff,stroke-width:2px,color:#fff
    classDef external fill:#5C2D91,stroke:#fff,stroke-width:2px,color:#fff
    
    class AFD,AFD_POP1,AFD_POP2,AFD_POP3,SWA,Assets,ServiceWorker azure
    class Mobile,Desktop client
    class IDB,LS storage
    class PaymentAPI external
```

### 2. Deployment Pipeline

```mermaid
graph LR
    subgraph "Development"
        Dev["Developer<br/>Push Code"]
        Git["GitHub Repository<br/>(main branch)"]
    end
    
    subgraph "Build Pipeline"
        Trigger["GitHub Actions<br/>Workflow Trigger"]
        Install["npm install<br/>(Dependencies)"]
        Test["npm test<br/>(Vitest + Playwright)"]
        Build["npm run build<br/>(Vite Bundle)"]
        Optimize["Asset Optimization<br/>(Gzip/Brotli)"]
    end
    
    subgraph "Quality Gates"
        PerfTest["Performance Tests<br/>60 FPS, <2s load"]
        BundleSize["Bundle Size Check<br/><325KB gzipped"]
        Coverage["Code Coverage<br/>(80% target)"]
    end
    
    subgraph "Azure Deployment"
        SWA_CLI["SWA CLI Deploy<br/>(--env production)"]
        SWA_Deploy["Static Web App<br/>Deployment"]
        AFD_Cache["Front Door<br/>Cache Purge"]
    end
    
    subgraph "Verification"
        HealthCheck["Health Check<br/>(Smoke Tests)"]
        Monitor["Azure Monitor<br/>(Application Insights)"]
    end
    
    Dev --> Git
    Git --> Trigger
    Trigger --> Install
    Install --> Test
    Test --> Build
    Build --> Optimize
    
    Optimize --> PerfTest
    Optimize --> BundleSize
    Optimize --> Coverage
    
    PerfTest -->|Pass| SWA_CLI
    BundleSize -->|Pass| SWA_CLI
    Coverage -->|Pass| SWA_CLI
    
    SWA_CLI --> SWA_Deploy
    SWA_Deploy --> AFD_Cache
    AFD_Cache --> HealthCheck
    HealthCheck --> Monitor
    
    PerfTest -.->|Fail| Dev
    BundleSize -.->|Fail| Dev
    Coverage -.->|Fail| Dev
    
    classDef dev fill:#24292e,stroke:#fff,stroke-width:2px,color:#fff
    classDef build fill:#2188ff,stroke:#fff,stroke-width:2px,color:#fff
    classDef test fill:#dbab09,stroke:#000,stroke-width:2px,color:#000
    classDef azure fill:#0078D4,stroke:#fff,stroke-width:2px,color:#fff
    classDef monitor fill:#107C10,stroke:#fff,stroke-width:2px,color:#fff
    
    class Dev,Git dev
    class Trigger,Install,Test,Build,Optimize build
    class PerfTest,BundleSize,Coverage test
    class SWA_CLI,SWA_Deploy,AFD_Cache azure
    class HealthCheck,Monitor monitor
```

### 3. Content Delivery Network (CDN) Flow

```mermaid
sequenceDiagram
    participant User as Player Browser
    participant DNS as Azure DNS
    participant AFD as Azure Front Door
    participant Cache as Edge Cache
    participant SWA as Static Web App
    participant Origin as Origin Storage
    
    User->>DNS: Request endlessrunner.com
    DNS->>User: Return AFD IP (nearest POP)
    
    User->>AFD: GET /index.html
    AFD->>Cache: Check cache
    
    alt Cache HIT (Static Assets)
        Cache->>AFD: Return cached content
        AFD->>User: 200 OK (cached, <50ms)
    else Cache MISS
        Cache->>SWA: Forward request
        SWA->>Origin: Fetch asset
        Origin->>SWA: Return asset
        SWA->>Cache: Store in cache
        Cache->>AFD: Return content
        AFD->>User: 200 OK (origin, ~200ms)
    end
    
    User->>AFD: GET /assets/player.png
    AFD->>Cache: Check cache
    Cache->>User: 200 OK (cached, <50ms)
    
    Note over User,Origin: Service Worker caches<br/>assets locally for offline play
    
    User->>User: Store game state in IndexedDB
    
    alt In-App Purchase Flow
        User->>AFD: POST /api/purchase (if Azure Functions)
        AFD->>SWA: Forward (no cache)
        SWA->>User: Return payment URL
        User->>External: Stripe/PayPal payment
        External->>User: Payment confirmation
    end
```

### 4. Asset Distribution Strategy

```mermaid
graph TB
    subgraph "Build Output (dist/)"
        HTML["index.html<br/>~15KB"]
        CSS["styles.css<br/>~25KB gzipped"]
        JS_Main["main.js<br/>~125KB gzipped"]
        JS_Pixi["pixi.min.js<br/>~150KB gzipped"]
        
        subgraph "Assets (~805KB total)"
            IMG_Critical["Critical Assets<br/>player, obstacles<br/>~125KB"]
            IMG_Cosmetic["Cosmetic Assets<br/>skins, effects<br/>~480KB"]
            Audio["Audio Files<br/>~216KB"]
        end
    end
    
    subgraph "Azure Front Door Caching"
        AFD_Cache_Static["Static Cache<br/>(1 year TTL)"]
        AFD_Cache_Dynamic["Dynamic Cache<br/>(1 hour TTL)"]
        AFD_No_Cache["No Cache<br/>(Auth routes)"]
    end
    
    subgraph "Client Strategy"
        ServiceWorker["Service Worker<br/>Cache API"]
        Browser_Cache["Browser Cache"]
        Preload["Preload Critical<br/>(~140KB)"]
        Lazy["Lazy Load<br/>(~680KB)"]
    end
    
    HTML --> AFD_Cache_Dynamic
    CSS --> AFD_Cache_Static
    JS_Main --> AFD_Cache_Static
    JS_Pixi --> AFD_Cache_Static
    IMG_Critical --> AFD_Cache_Static
    IMG_Cosmetic --> AFD_Cache_Static
    Audio --> AFD_Cache_Static
    
    AFD_Cache_Static --> ServiceWorker
    AFD_Cache_Dynamic --> Browser_Cache
    
    ServiceWorker --> Preload
    ServiceWorker --> Lazy
    
    Preload -.->|First Load| IMG_Critical
    Preload -.->|First Load| JS_Main
    Lazy -.->|On Demand| IMG_Cosmetic
    Lazy -.->|On Demand| Audio
    
    classDef build fill:#24292e,stroke:#fff,stroke-width:2px,color:#fff
    classDef azure fill:#0078D4,stroke:#fff,stroke-width:2px,color:#fff
    classDef client fill:#107C10,stroke:#fff,stroke-width:2px,color:#fff
    
    class HTML,CSS,JS_Main,JS_Pixi,IMG_Critical,IMG_Cosmetic,Audio build
    class AFD_Cache_Static,AFD_Cache_Dynamic,AFD_No_Cache azure
    class ServiceWorker,Browser_Cache,Preload,Lazy client
```

### 5. Security Architecture

```mermaid
graph TB
    subgraph "Threat Prevention"
        WAF["Azure WAF<br/>(Web Application Firewall)"]
        DDoS["Azure DDoS Protection<br/>(Standard)"]
        HTTPS["HTTPS Only<br/>(TLS 1.3)"]
    end
    
    subgraph "Azure Front Door"
        Rules["Security Rules"]
        RateLimit["Rate Limiting<br/>(API Protection)"]
        GeoFilter["Geo-Filtering<br/>(Optional)"]
        HeaderCheck["Custom Header Check<br/>(X-Azure-FDID)"]
    end
    
    subgraph "Static Web App"
        SWA_Auth["/.auth Routes<br/>(No Cache)"]
        CORS["CORS Policy"]
        CSP["Content Security Policy"]
    end
    
    subgraph "Client Security"
        SRI["Subresource Integrity<br/>(Script Validation)"]
        LocalStorage["Secure Local Storage<br/>(No Sensitive Data)"]
        InputVal["Input Validation<br/>(XSS Prevention)"]
    end
    
    Internet["Internet Traffic"] --> DDoS
    DDoS --> WAF
    WAF --> HTTPS
    HTTPS --> Rules
    Rules --> RateLimit
    Rules --> GeoFilter
    Rules --> HeaderCheck
    
    HeaderCheck --> SWA_Auth
    SWA_Auth --> CORS
    CORS --> CSP
    
    CSP --> SRI
    SRI --> LocalStorage
    LocalStorage --> InputVal
    
    classDef threat fill:#D13438,stroke:#fff,stroke-width:2px,color:#fff
    classDef azure fill:#0078D4,stroke:#fff,stroke-width:2px,color:#fff
    classDef app fill:#107C10,stroke:#fff,stroke-width:2px,color:#fff
    classDef client fill:#FF8C00,stroke:#fff,stroke-width:2px,color:#fff
    
    class WAF,DDoS,HTTPS threat
    class Rules,RateLimit,GeoFilter,HeaderCheck azure
    class SWA_Auth,CORS,CSP app
    class SRI,LocalStorage,InputVal client
```

### 6. Monitoring & Observability

```mermaid
graph TB
    subgraph "Application Telemetry"
        AppInsights["Application Insights"]
        CustomEvents["Custom Events<br/>(Game Actions)"]
        PerfMetrics["Performance Metrics<br/>(FPS, Load Time)"]
        Errors["Error Tracking<br/>(JS Exceptions)"]
    end
    
    subgraph "Infrastructure Metrics"
        AFD_Metrics["Front Door Metrics<br/>(Latency, Cache Hit)"]
        SWA_Metrics["Static Web App Metrics<br/>(Requests, Bandwidth)"]
        CDN_Analytics["CDN Analytics<br/>(Geographic Distribution)"]
    end
    
    subgraph "User Analytics"
        UserFlow["User Flow<br/>(Retention, Engagement)"]
        Conversion["Conversion Tracking<br/>(IAP Purchase Rate)"]
        SessionData["Session Analytics<br/>(Play Time, Score)"]
    end
    
    subgraph "Alerts & Actions"
        Alerts["Azure Alerts"]
        Dashboard["Azure Dashboard<br/>(Real-time)"]
        LogAnalytics["Log Analytics<br/>Workspace"]
    end
    
    CustomEvents --> AppInsights
    PerfMetrics --> AppInsights
    Errors --> AppInsights
    
    AFD_Metrics --> LogAnalytics
    SWA_Metrics --> LogAnalytics
    CDN_Analytics --> LogAnalytics
    
    UserFlow --> AppInsights
    Conversion --> AppInsights
    SessionData --> AppInsights
    
    AppInsights --> Alerts
    LogAnalytics --> Alerts
    Alerts --> Dashboard
    
    AppInsights --> Dashboard
    LogAnalytics --> Dashboard
    
    classDef app fill:#0078D4,stroke:#fff,stroke-width:2px,color:#fff
    classDef infra fill:#107C10,stroke:#fff,stroke-width:2px,color:#fff
    classDef user fill:#FF8C00,stroke:#fff,stroke-width:2px,color:#fff
    classDef monitor fill:#5C2D91,stroke:#fff,stroke-width:2px,color:#fff
    
    class AppInsights,CustomEvents,PerfMetrics,Errors app
    class AFD_Metrics,SWA_Metrics,CDN_Analytics infra
    class UserFlow,Conversion,SessionData user
    class Alerts,Dashboard,LogAnalytics monitor
```

### 7. Disaster Recovery & Scaling

```mermaid
graph TB
    subgraph "Global Distribution"
        Primary["Primary Region<br/>(e.g., East US)"]
        POP1["Edge POP<br/>North America"]
        POP2["Edge POP<br/>Europe"]
        POP3["Edge POP<br/>Asia Pacific"]
    end
    
    subgraph "Redundancy"
        Git["GitHub<br/>(Source of Truth)"]
        Backup["Git History<br/>(Version Control)"]
        Rollback["Deployment Slots<br/>(Blue-Green)"]
    end
    
    subgraph "Auto-Scaling"
        AFD_Scale["Front Door<br/>(Auto-Scale)"]
        SWA_Scale["Static Web App<br/>(Elastic Scale)"]
        Global_LB["Global Load Balancer"]
    end
    
    subgraph "Health Monitoring"
        HealthProbe["Health Probes<br/>(Every 30s)"]
        Failover["Auto-Failover<br/>(<5min RTO)"]
        Recovery["Self-Healing<br/>(Auto-Deploy)"]
    end
    
    Primary --> POP1
    Primary --> POP2
    Primary --> POP3
    
    Git --> Primary
    Git --> Backup
    Backup --> Rollback
    
    POP1 --> AFD_Scale
    POP2 --> AFD_Scale
    POP3 --> AFD_Scale
    AFD_Scale --> SWA_Scale
    SWA_Scale --> Global_LB
    
    HealthProbe --> Primary
    HealthProbe --> Failover
    Failover --> Recovery
    Recovery --> Git
    
    classDef global fill:#0078D4,stroke:#fff,stroke-width:2px,color:#fff
    classDef redundancy fill:#107C10,stroke:#fff,stroke-width:2px,color:#fff
    classDef scale fill:#FF8C00,stroke:#fff,stroke-width:2px,color:#fff
    classDef health fill:#5C2D91,stroke:#fff,stroke-width:2px,color:#fff
    
    class Primary,POP1,POP2,POP3 global
    class Git,Backup,Rollback redundancy
    class AFD_Scale,SWA_Scale,Global_LB scale
    class HealthProbe,Failover,Recovery health
```

## Azure Services Used

### Core Services

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Azure Static Web Apps** | Host PWA application | Standard tier, primary region selection |
| **Azure Front Door** | Global CDN and WAF | Standard tier, multiple POPs, compression enabled |
| **Azure DNS** | Domain management | Custom domain with apex and www records |
| **Application Insights** | Telemetry and monitoring | Standard workspace, custom events enabled |

### Optional Services

| Service | Purpose | When to Use |
|---------|---------|-------------|
| **Azure Functions** | Serverless API backend | If server-side validation needed for IAP |
| **Azure Key Vault** | Secret management | Store payment provider API keys securely |
| **Azure CDN** | Additional caching | If Front Door not sufficient |
| **Azure Monitor** | Advanced monitoring | Production environment alerting |

## Performance Targets

| Metric | Target | Azure Configuration |
|--------|--------|---------------------|
| **First Contentful Paint** | <1.0s | Front Door compression, edge caching |
| **Time to Interactive** | <2.0s | Asset optimization, preload critical resources |
| **Cache Hit Ratio** | >90% | 1-year TTL for static assets |
| **Global Latency** | <100ms | Multi-region POPs, geo-distribution |
| **Uptime** | 99.95% | SLA with Standard tier Static Web Apps |
| **Bandwidth Cost** | <$50/month | Aggressive caching, compression |

## Cost Estimation (Monthly)

| Service | Tier | Estimated Cost | Notes |
|---------|------|----------------|-------|
| Azure Static Web Apps | Standard | $9.00 | 100GB bandwidth included |
| Azure Front Door | Standard | $35.00 | CDN, WAF, compression |
| Application Insights | Pay-as-you-go | $5.00 | ~5GB data ingestion |
| Azure DNS | Standard | $1.50 | Custom domain |
| **Total Estimated** | | **~$50.50/month** | For ~10K monthly active users |

**Scaling**: 
- At 100K MAU: ~$150-200/month
- At 1M MAU: ~$500-750/month (primarily bandwidth costs)

## Deployment Steps

See [Azure Deployment Guide](./azure-deployment-guide.md) for detailed step-by-step instructions.

**Quick Start:**

```powershell
# Install SWA CLI
npm install -g @azure/static-web-apps-cli

# Initialize project
npx swa init --yes

# Build application
npm run build

# Deploy to production
npx swa deploy --env production
```

## Next Steps

1. ✅ Review architecture diagrams with stakeholders
2. ⏳ Create Azure resources (see [Azure Deployment Guide](./azure-deployment-guide.md))
3. ⏳ Configure GitHub Actions pipeline
4. ⏳ Set up Application Insights monitoring
5. ⏳ Configure custom domain and SSL
6. ⏳ Enable Azure Front Door WAF policies
7. ⏳ Configure performance alerts

## References

- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Azure Front Door Best Practices](https://learn.microsoft.com/en-us/azure/frontdoor/front-door-overview)
- [Application Insights for JavaScript](https://learn.microsoft.com/en-us/azure/azure-monitor/app/javascript)
- [Progressive Web Apps on Azure](https://learn.microsoft.com/en-us/azure/static-web-apps/deploy-nextjs-hybrid)
