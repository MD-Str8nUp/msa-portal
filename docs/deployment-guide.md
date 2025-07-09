# MSA Portal Vercel Deployment Guide

> **Complete deployment instructions for Mi'raj Scouts Academy Portal on Vercel**

## Overview

This guide provides step-by-step instructions for deploying the MSA Portal to Vercel, including environment configuration, database setup, and post-deployment verification. The portal is optimised for Vercel's serverless architecture and includes Islamic community-specific considerations.

**Live Deployment**: https://msa-portal11.vercel.app  
**Technology Stack**: Next.js 14, TypeScript, Prisma, SQLite/PostgreSQL  
**Deployment Platform**: Vercel with optimised configuration  

---

## Prerequisites

### 🔧 Required Tools
- **Node.js**: Version 18.17.0 or higher (specified in vercel.json)
- **npm**: Package manager (v8 or higher recommended)
- **Git**: Version control for deployment triggers
- **Vercel CLI**: For local testing and deployment management

### 📋 Required Accounts
- **Vercel Account**: Free tier supports the MSA Portal
- **GitHub Account**: For repository connection and CI/CD
- **Database Provider**: Supabase, PlanetScale, or similar for production

### 🔑 Environment Variables
Prepare the following environment variables before deployment:

```bash
# Database Configuration
DATABASE_URL="your_production_database_url"

# Authentication (if using NextAuth.js)
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Email Configuration (for notifications)
SMTP_HOST="your_smtp_host"
SMTP_PORT="587"
SMTP_USER="your_smtp_username"
SMTP_PASS="your_smtp_password"

# API Keys (if applicable)
UPLOADCARE_PUBLIC_KEY="your_file_upload_key"
ENCRYPTION_KEY="your_data_encryption_key"

# Islamic Features
PRAYER_TIMES_API_KEY="your_prayer_times_api_key"
HIJRI_CALENDAR_API_KEY="your_hijri_calendar_api_key"
```

---

## Vercel Configuration

### 📄 vercel.json Configuration

The MSA Portal includes a pre-configured `vercel.json` file optimised for the application:

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "installCommand": "npm install --force --legacy-peer-deps",
  "buildCommand": "npm run vercel-build",
  "env": {
    "NODE_VERSION": "18.17.0"
  }
}
```

#### Configuration Breakdown

**Functions Configuration**
- **maxDuration**: 30 seconds for API routes (sufficient for data imports and complex operations)
- **Scope**: All TypeScript API routes in `/app/api/` directory

**Build Configuration**
- **installCommand**: Uses `--force --legacy-peer-deps` to handle dependency conflicts
- **buildCommand**: Custom build command for production optimisation
- **NODE_VERSION**: Locked to 18.17.0 for consistency

### 🏗️ Build Scripts

Ensure your `package.json` includes the following scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "vercel-build": "npx prisma generate && npx prisma db push && next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "npx prisma db push",
    "db:studio": "npx prisma studio"
  }
}
```

**Key Scripts Explained**:
- **vercel-build**: Generates Prisma client, pushes schema, then builds Next.js
- **db:push**: Updates database schema without migrations
- **db:studio**: Opens Prisma Studio for database management

---

## Deployment Process

### 🚀 Initial Deployment

#### Method 1: Vercel Dashboard (Recommended for First Deployment)

1. **Connect Repository**
   ```bash
   # Ensure your code is pushed to GitHub
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository: `your-username/msa-portal`

3. **Configure Build Settings**
   - **Framework Preset**: Next.js
   - **Root Directory**: `.` (default)
   - **Build Command**: `npm run vercel-build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install --force --legacy-peer-deps`

4. **Environment Variables**
   - Add all required environment variables
   - Ensure `DATABASE_URL` points to production database
   - Set `NEXTAUTH_URL` to your Vercel domain

5. **Deploy**
   - Click "Deploy"
   - Wait for build completion (5-10 minutes)
   - Verify deployment at provided URL

#### Method 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to project directory
cd msa-portal

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

### 🔄 Continuous Deployment

Once connected, Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and feature branches
- **Development**: Manual deployments via CLI

#### Branch Strategy
```bash
# Production deployment
git checkout main
git pull origin main
git push origin main  # Triggers production deployment

# Preview deployment
git checkout -b feature/new-feature
# Make changes
git push origin feature/new-feature  # Triggers preview deployment
```

---

## Database Configuration

### 🗄️ Production Database Setup

#### Option 1: Supabase (Recommended)

1. **Create Supabase Project**
   - Visit [supabase.com](https://supabase.com)
   - Create new project: "MSA Portal Production"
   - Note connection string and credentials

2. **Configure Database URL**
   ```bash
   # Format for Supabase
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

3. **Push Prisma Schema**
   ```bash
   # Local schema push to production
   npx prisma db push
   
   # Verify schema in Supabase dashboard
   npx prisma studio
   ```

#### Option 2: PlanetScale

1. **Create PlanetScale Database**
   - Visit [planetscale.com](https://planetscale.com)
   - Create database: "msa-portal-prod"
   - Create production branch

2. **Configure Connection**
   ```bash
   # PlanetScale connection string
   DATABASE_URL="mysql://[username]:[password]@[host]/[database]?sslaccept=strict"
   ```

#### Option 3: Railway

1. **Create Railway Project**
   - Visit [railway.app](https://railway.app)
   - Create new project
   - Add PostgreSQL service

2. **Environment Setup**
   ```bash
   # Railway automatically provides
   DATABASE_URL="postgresql://postgres:[password]@[host]:[port]/railway"
   ```

### 📊 Data Migration

#### Import MSA Community Data

```bash
# After database setup, import real MSA data
curl -X POST https://your-domain.vercel.app/api/import-msa-data \
  -H "Content-Type: application/json" \
  -d '{"confirm": true}'

# Verify import success
curl https://your-domain.vercel.app/api/scouts | jq '.count'
# Should return 75+ scouts

curl https://your-domain.vercel.app/api/users | jq '.count'  
# Should return 110+ users (parents + staff)
```

#### Data Verification Checklist
- [ ] 79 real families imported from CSV
- [ ] 35+ MSA staff members created
- [ ] Groups properly configured (Joeys, Cubs, Scouts A/B/C)
- [ ] Sample events and achievements loaded
- [ ] User roles correctly assigned

---

## Environment Configuration

### 🔐 Environment Variables Setup

#### Via Vercel Dashboard
1. Go to Project Settings → Environment Variables
2. Add each variable for Production, Preview, and Development
3. Ensure sensitive values are encrypted

#### Via Vercel CLI
```bash
# Add environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add SMTP_HOST production

# List environment variables
vercel env ls

# Pull environment variables to local
vercel env pull .env.local
```

#### Environment Variable Categories

**Database Variables**
```bash
DATABASE_URL="your_production_database_connection_string"
SHADOW_DATABASE_URL="your_shadow_database_for_migrations"  # Optional
```

**Authentication Variables**
```bash
NEXTAUTH_SECRET="randomly_generated_32_character_string"
NEXTAUTH_URL="https://msa-portal11.vercel.app"
```

**Email and Notifications**
```bash
SMTP_HOST="smtp.gmail.com"  # Or your email provider
SMTP_PORT="587"
SMTP_USER="notifications@msascouts.org"
SMTP_PASS="your_app_specific_password"
FROM_EMAIL="MSA Portal <noreply@msascouts.org>"
```

**Islamic Services**
```bash
PRAYER_TIMES_API_KEY="your_prayer_times_api_key"
PRAYER_TIMES_METHOD="4"  # Islamic Society of North America
HIJRI_CALENDAR_API_KEY="your_islamic_calendar_api_key"
LOCATION_COORDINATES="lat=-33.8688,lng=151.2093"  # Sydney, NSW
```

**File Upload and Storage**
```bash
UPLOADCARE_PUBLIC_KEY="your_uploadcare_public_key"
UPLOADCARE_SECRET_KEY="your_uploadcare_secret_key"
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"  # Alternative
```

**Security and Encryption**
```bash
ENCRYPTION_KEY="32_character_encryption_key_for_sensitive_data"
JWT_SECRET="jwt_signing_secret_for_api_authentication"
RATE_LIMIT_SECRET="secret_for_rate_limiting_implementation"
```

---

## Domain Configuration

### 🌐 Custom Domain Setup

#### Add Custom Domain
1. **Purchase Domain**: `msascouts.org` or similar
2. **Add to Vercel**:
   - Project Settings → Domains
   - Add `msascouts.org` and `www.msascouts.org`
3. **Configure DNS**:
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → `76.76.19.61` (Vercel IP)

#### SSL Certificate
- Automatically provisioned by Vercel
- Let's Encrypt certificates
- Auto-renewal every 60 days

#### Redirect Configuration
```bash
# In vercel.json, add redirects
{
  "redirects": [
    {
      "source": "/admin",
      "destination": "/executive/dashboard",
      "permanent": true
    },
    {
      "source": "/login",
      "destination": "/auth/signin",
      "permanent": false
    }
  ]
}
```

### 📧 Email Domain Setup

For professional MSA communications:

1. **Email Provider**: Google Workspace or Microsoft 365
2. **Domain Email**: `admin@msascouts.org`, `leaders@msascouts.org`
3. **SMTP Configuration**: Update environment variables
4. **SPF/DKIM Setup**: Ensure email deliverability

---

## Performance Optimisation

### ⚡ Vercel-Specific Optimisations

#### Edge Functions
```typescript
// For prayer times and Islamic calendar
export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request) {
  // Fast prayer time calculations
  const prayerTimes = await calculatePrayerTimes()
  return new Response(JSON.stringify(prayerTimes))
}
```

#### Image Optimisation
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['ucarecdn.com', 'avatars.githubusercontent.com'],
    formats: ['image/webp', 'image/avif'],
  },
}
```

#### Caching Strategy
```typescript
// API routes with caching
export async function GET() {
  const data = await getStaticData()
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
```

### 🚀 Performance Monitoring

#### Analytics Setup
```bash
# Add Vercel Analytics
npm install @vercel/analytics

# Add to _app.tsx
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
```

#### Speed Insights
```bash
# Add Vercel Speed Insights
npm install @vercel/speed-insights

# Add to _app.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'
```

---

## Security Configuration

### 🔒 Security Headers

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

### 🛡️ Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
})

export default ratelimit
```

### 🔐 Environment Security

```bash
# Rotate secrets regularly
vercel env rm NEXTAUTH_SECRET production
vercel env add NEXTAUTH_SECRET production  # Add new secret

# Use different secrets for different environments
vercel env add DATABASE_URL development  # Development database
vercel env add DATABASE_URL preview      # Preview database  
vercel env add DATABASE_URL production   # Production database
```

---

## Monitoring and Maintenance

### 📊 Vercel Dashboard Monitoring

#### Function Metrics
- Monitor API response times
- Track error rates
- Review function execution logs
- Analyse bandwidth usage

#### Performance Insights
- Core Web Vitals tracking
- Page load performance
- Real User Monitoring (RUM)
- Performance score trends

### 🚨 Error Monitoring

#### Sentry Integration
```bash
# Install Sentry
npm install @sentry/nextjs

# Configure sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV || 'development',
})
```

#### Health Checks
```typescript
// pages/api/health.ts
export default async function handler(req, res) {
  try {
    // Test database connection
    const dbStatus = await testDatabaseConnection()
    
    // Test external services
    const servicesStatus = await testExternalServices()
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      services: servicesStatus
    })
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    })
  }
}
```

### 📈 Analytics and Insights

#### User Analytics
```typescript
// Track Islamic community engagement
analytics.track('Prayer Time Viewed', {
  user_role: 'parent',
  prayer: 'fajr',
  location: 'Sydney'
})

analytics.track('Achievement Earned', {
  scout_age: 10,
  achievement: 'Salah Excellence',
  group: 'Cubs A'
})
```

---

## Troubleshooting

### 🔧 Common Deployment Issues

#### Build Failures

**Issue**: Prisma client generation fails
```bash
# Solution: Ensure DATABASE_URL is set
vercel env add DATABASE_URL production
vercel --prod
```

**Issue**: Type errors in build
```bash
# Solution: Fix TypeScript issues locally first
npm run build
npm run lint
```

**Issue**: Memory issues during build
```bash
# Solution: Optimize build process
# In package.json
"vercel-build": "NODE_OPTIONS='--max-old-space-size=4096' npx prisma generate && next build"
```

#### Runtime Errors

**Issue**: Database connection failures
```bash
# Check environment variables
vercel env ls
# Verify DATABASE_URL format
# Test connection locally
```

**Issue**: API timeout errors
```bash
# Increase function timeout in vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### 🔍 Debugging Tools

#### Vercel Logs
```bash
# View function logs
vercel logs [deployment-url]

# Stream logs in real-time
vercel logs --follow

# Filter logs by function
vercel logs --since=1h | grep "api/scouts"
```

#### Local Development
```bash
# Test locally with production environment
vercel env pull .env.local
npm run dev

# Test build locally
vercel build
vercel dev
```

---

## Islamic Community Considerations

### 🕌 Prayer Time Integration

```typescript
// Ensure prayer time APIs work in production
const prayerTimes = await fetch(`https://api.aladhan.com/v1/timings/${date}`, {
  params: {
    latitude: process.env.LOCATION_LAT,
    longitude: process.env.LOCATION_LNG,
    method: process.env.PRAYER_TIMES_METHOD || '4'
  }
})
```

### 🌙 Islamic Calendar

```typescript
// Hijri date integration
const hijriDate = await fetch(`https://api.aladhan.com/v1/gToH/${gregorianDate}`)
```

### 🍽️ Halal Compliance

- Ensure food preference tracking works
- Test permission slip generation
- Verify email notifications

### 👥 Community Privacy

- Test role-based access controls
- Verify family data protection
- Ensure incident report privacy

---

## Backup and Recovery

### 💾 Database Backups

```bash
# Automated backups (if using Supabase)
# Manual backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup-20240121.sql
```

### 🔄 Deployment Rollback

```bash
# View deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]

# Promote preview to production
vercel promote [preview-url]
```

---

## Post-Deployment Checklist

### ✅ Verification Steps

**Functionality Testing**
- [ ] All three portals (Parent, Leader, Executive) load correctly
- [ ] User authentication works
- [ ] Database connections established
- [ ] API endpoints respond correctly
- [ ] File uploads function (if applicable)
- [ ] Email notifications send properly

**Islamic Features Testing**
- [ ] Prayer times display correctly for Sydney location
- [ ] Islamic calendar integration works
- [ ] Achievement system functions with Islamic badges
- [ ] Event scheduling respects prayer times
- [ ] Halal compliance features operational

**Performance Testing**
- [ ] Page load times under 3 seconds
- [ ] API responses under 1 second
- [ ] Image optimisation working
- [ ] Mobile responsiveness confirmed

**Security Testing**
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] Rate limiting functional
- [ ] Role-based access controls working
- [ ] Environment variables secure

**Community Data Testing**
- [ ] 79 MSA families imported correctly
- [ ] 35+ staff members configured
- [ ] Groups properly structured
- [ ] Parent-child relationships established
- [ ] Leader group assignments correct

### 📞 Go-Live Communication

**Internal Communication**
```
Subject: MSA Portal Now Live - Production Deployment Complete

Assalamu Alaikum MSA Community,

The Mi'raj Scouts Academy Portal is now live at https://msascouts.org

Available portals:
- Parent Portal: Family management and scout progress
- Leader Portal: Group management and activities  
- Executive Portal: Academy-wide administration

Initial login credentials have been sent separately.

For technical support: support@msascouts.org
For portal questions: help@msascouts.org

Barakallahu feekum,
MSA Technical Team
```

**Community Announcement**
```
Subject: Welcome to the New MSA Digital Portal

Assalamu Alaikum dear MSA families,

We're excited to announce the launch of our new digital portal at https://msascouts.org

This platform will help us better serve our Islamic scouting community with:
- Real-time updates on your scouts' achievements
- Easy event registration and communication
- Islamic calendar integration
- Mobile-friendly family access

Training sessions will be held after Jummah prayers for the next two weeks.

May Allah bless this technology that serves our ummah.

With Islamic greetings,
MSA Executive Team
```

---

*May Allah bless this deployment and grant success to the Mi'raj Scouts Academy Portal in serving the Islamic community. This technical infrastructure is an amanah (trust) that supports the spiritual and character development of our young Muslims.*

**For deployment support: contact the technical team or Vercel support**

---

*بارك الله فيكم - May Allah bless your technical efforts*