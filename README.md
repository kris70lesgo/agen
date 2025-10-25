# 🏥 **MedHack - AI-Powered Health Analysis & Nutrition Planning**

Transform your medical data into actionable insights — from detecting conditions to creating personalized diet plans in one secure platform.

**Live Demo:** https://med-hack.vercel.app/

---

## 📋 **Table of Contents**

- [Overview](#overview)
- [Key Features](#-key-features)
- [Auth0 Integration](#-auth0-integration--enterprise-authentication)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Security & Authorization](#-security--authorization)
- [Environment Setup](#-environment-setup)
- [Deployment](#-deployment)
- [Development Guide](#-development-guide)

---

## 📊 **Overview**

MedHack is a full-stack AI health platform that combines:

- **🏥 Medical Image Analysis** - AI-powered vision analysis for X-rays, MRIs, CT scans
- **🍽️ AI Diet Planning** - Personalized nutrition plans based on health data
- **🔐 Enterprise Authentication** - Auth0 with role-based access control
- **💳 Subscription System** - Free/Pro tiers with instant upgrade demo
- **🔑 Secure Token Management** - Server-side API key vault
- **📊 Fine-Grained Authorization** - Permission-based feature access

**Built for**: Nutritionists, fitness coaches, healthcare practitioners, and their clients

---

## ✨ **Key Features**

### **1. Med Scan (Medical Image Analysis)** 🏥
- Upload medical images (X-rays, MRIs, CT scans, ultrasounds)
- AI-powered analysis using Google Gemini 2.0 Flash
- Automatic fallback to Claude 3.5 Sonnet or Llama if primary fails
- Markdown-formatted professional reports
- Requires `use:vision_api` permission (Pro users)

### **2. Weekly Diet Agent** 🍽️
- AI-generated personalized meal plans
- Nutritional breakdowns and shopping lists
- Based on health conditions, dietary restrictions, fitness goals
- PDF export for client sharing
- Requires `use:diet_agent` permission (Pro users)

### **3. Role-Based Access Control** 👥
Three-tier system with granular permissions:

| Feature | Free | Pro | Admin |
|---------|------|-----|-------|
| Med Scan | ✅ | ✅ | ✅ |
| Diet Agent | ❌ | ✅ | ✅ |
| Read Health Data | ✅ | ✅ | ✅ |
| Write Health Data | ❌ | ✅ | ✅ |
| Export PDFs | ❌ | ✅ | ✅ |
| Token Management | ❌ | ❌ | ✅ |

### **4. Settings Dashboard** ⚙️
- View current role and permissions
- One-click upgrade to Pro
- Permission list display
- Secure token management

### **5. Interactive UI** 🎨
- Dark theme with purple/cyan accents
- Animated particles background
- Responsive design (mobile/tablet/desktop)
- Smooth animations and transitions
- CardSwap component with SVG illustrations

---

## 🔐 **Auth0 Integration - Enterprise Authentication**

### **Architecture Overview**

MedHack uses Auth0 as the **centralized authentication & authorization hub**:

```
┌─────────────────┐
│  User Browser   │
└────────┬────────┘
         │ HTTPS + HTTPOnly Cookies
         ▼
┌──────────────────────┐
│  Auth0 (OAuth2/OIDC) │
│  - Email/Password    │
│  - Google OAuth      │
│  - Social Logins     │
└────────┬─────────────┘
         │ JWT Token + Custom Claims
         ▼
┌─────────────────────────────────────┐
│  Next.js Backend API Routes         │
│  - Validate JWT Signature           │
│  - Extract Custom Claims            │
│  - Check Permissions                │
│  - Execute with User Context        │
└────────┬────────────────────────────┘
         │ Only Authorized Requests
         ▼
┌─────────────────────────────────────┐
│  AI Agents & External APIs          │
│  - Vision API (Gemini, Claude)      │
│  - Nutrition API (Spoonacular)      │
│  - All calls traced to user         │
└─────────────────────────────────────┘
```

### **Auth0 Configuration**

#### **Environment Variables**
```env
# .env.local
AUTH0_SECRET='your-secret-key'
AUTH0_DOMAIN='dev-pjvszjrlnyxsp52y.us.auth0.com'
AUTH0_CLIENT_ID='hKZNz5qFDFNtjgpar7EmJXLXWsCuPSJZ'
AUTH0_CLIENT_SECRET='iK3TbzsX_mQPx_DL1HkWMQTwDAXzoRNd461r-FXm6pPsxhWF2skSjpgCY-XH6FiA'
APP_BASE_URL='http://localhost:3000'
```

#### **Custom Claims (Auth0 Action)**

Auth0 uses a custom **Action** to add roles and permissions to JWT tokens:

```javascript
// Auth0 Dashboard → Actions → Flows → Login → Custom

exports.onExecutePostLogin = async (event, api) => {
  const namespace = event.request.hostname; // e.g., localhost:3000
  
  if (event.authorization) {
    // Add roles and permissions as custom claims
    if (event.authorization.roles) {
      api.idToken.setCustomClaim(
        `${namespace}/roles`,
        event.authorization.roles
      );
    }
    
    if (event.authorization.permissions) {
      api.idToken.setCustomClaim(
        `${namespace}/permissions`,
        event.authorization.permissions
      );
    }
  }
};
```

**Result**: JWT tokens contain role and permission information:
```json
{
  "sub": "google-oauth2|115740250615114808651",
  "email": "user@example.com",
  "http://localhost:3000/roles": ["pro_user"],
  "http://localhost:3000/permissions": [
    "use:vision_agent",
    "use:diet_agent",
    "read:health_data",
    "write:health_data",
    "use:vision_api",
    "use:nutrition_api",
    "use:pdf_api"
  ]
}
```

### **Role & Permission Definitions**

```typescript
// src/lib/auth0-fga.ts

export const permissions = {
  USE_VISION_AGENT: 'use:vision_agent',
  USE_DIET_AGENT: 'use:diet_agent',
  READ_HEALTH_DATA: 'read:health_data',
  WRITE_HEALTH_DATA: 'write:health_data',
  USE_VISION_API: 'use:vision_api',
  USE_NUTRITION_API: 'use:nutrition_api',
  USE_PDF_API: 'use:pdf_api',
  MANAGE_TOKENS: 'manage:tokens',
  VIEW_TOKENS: 'view:tokens',
};

export const roles = {
  FREE_USER: {
    permissions: [
      permissions.USE_VISION_AGENT,
      permissions.READ_HEALTH_DATA,
      permissions.USE_VISION_API,
    ],
  },
  PRO_USER: {
    permissions: [
      permissions.USE_VISION_AGENT,
      permissions.USE_DIET_AGENT,
      permissions.READ_HEALTH_DATA,
      permissions.WRITE_HEALTH_DATA,
      permissions.USE_VISION_API,
      permissions.USE_NUTRITION_API,
      permissions.USE_PDF_API,
    ],
  },
  ADMIN: {
    permissions: Object.values(permissions), // All
  },
};
```

### **Permission Checking in Backend**

Every API endpoint verifies permissions before executing:

```typescript
// src/app/api/gemini-vision/route.ts

export async function POST(request: NextRequest) {
  try {
    // 1. Get Auth0 session
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check permission (reads JWT custom claims)
    const authError = await withAuthorization(permissions.USE_VISION_API);
    if (authError) return authError; // 403 Forbidden if denied

    // 3. Safe to proceed - user has permission
    const apiKey = await TokenVault.getToken(userId, 'openrouter');
    
    // 4. Execute AI agent securely
    const { text } = await generateText({
      model: openrouter("google/gemini-2.0-flash-exp:free"),
      messages: [/* ... */],
    });

    return NextResponse.json({ analysis: text });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### **Demo Mode for Testing**

For rapid demo/testing without Auth0 Management API:

```typescript
// src/app/api/user/upgrade/route.ts

// Set HttpOnly cookie to override Auth0 role
const cookie = serialize('demo_role', 'pro_user', {
  httpOnly: true,        // Can't be accessed via JavaScript
  secure: isProd,        // HTTPS only in production
  sameSite: 'lax',       // CSRF protection
  maxAge: 30 * 24 * 60 * 60, // 30 days
});

// Cookie is checked first in getUserRole() before Auth0
export async function getUserRole() {
  const demoRole = (await cookies()).get('demo_role')?.value;
  if (demoRole) return demoRole; // Override Auth0
  // Fall back to Auth0 role
}
```

---

## 🛠️ **Tech Stack**

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15.5.5, React 19, TypeScript |
| **Styling** | TailwindCSS, Framer Motion, Custom CSS |
| **Backend** | Next.js API Routes, Node.js |
| **Authentication** | Auth0 (@auth0/nextjs-auth0 v4) |
| **Authorization** | Fine-Grained Access Control (Custom) |
| **AI/ML** | OpenRouter, Google Gemini, Claude, Llama |
| **APIs** | Spoonacular (nutrition), PDFBolt (export) |
| **Deployment** | Vercel |
| **Database** | Auth0 User Metadata (demo) |
| **Monitoring** | Console logging, error tracking |

---

## 📁 **Project Structure**

```
src/
├── app/
│   ├── page.tsx                    # Landing page with hero + features
│   ├── layout.tsx                  # Root layout
│   ├── middleware.ts               # Auth0 middleware (routes)
│   ├── MainContentClient.tsx       # Interactive hero with Particles
│   ├── globals.css                 # Global styles
│   ├── api/
│   │   ├── gemini-vision/
│   │   │   └── route.ts            # 🏥 Medical image analysis
│   │   ├── user/
│   │   │   ├── upgrade/
│   │   │   │   └── route.ts        # 💳 Upgrade to Pro
│   │   │   ├── permissions/
│   │   │   │   └── route.ts        # 🔐 Get user permissions
│   │   │   └── clear-demo-role/
│   │   │       └── route.ts        # 🧪 Clear demo role
│   │   ├── debug/
│   │   │   └── env/
│   │   │       └── route.ts        # 🐛 Verify env vars
│   │   └── diet-chat/
│   │       └── route.ts            # 🍽️ Diet planning
│   ├── dashboard/
│   │   ├── page.tsx                # Dashboard hub
│   │   ├── settings/
│   │   │   └── SettingsClient.tsx  # 👤 User settings & permissions
│   │   ├── pricing/
│   │   │   └── page.tsx            # 💰 Pricing page
│   │   ├── upgrade-success/
│   │   │   └── page.tsx            # ✅ Upgrade confirmation
│   │   ├── vision/
│   │   │   └── page.tsx            # 📸 Med Scan UI
│   │   └── dietplan/
│   │       └── page.tsx            # 🥗 Diet planning UI
│   └── auth/
│       └── [auth0]/
│           └── route.ts            # Auth0 callback handler
├── components/
│   ├── MainNavbar.tsx              # Top navigation
│   ├── Particles.tsx               # 🎆 Interactive particle bg
│   ├── Bentogrid.tsx               # Feature showcase grid
│   ├── CardSwap.tsx                # Animated card carousel
│   ├── animated-list-demo.tsx      # Notification list
│   ├── chat.tsx                    # Chat interface
│   └── ui/
│       ├── calendar.tsx            # Date picker
│       ├── 3d-card.tsx             # 3D visual effect
│       ├── hover-border-gradient.tsx
│       ├── rainbow-button.tsx      # Gradient button
│       ├── input.tsx               # Form input
│       ├── radio.tsx               # Radio button
│       ├── resizable-navbar.tsx    # Mobile navbar
│       └── marquee.tsx             # Scrolling text
├── lib/
│   ├── auth0.ts                    # 🔐 Auth0 SDK wrapper
│   ├── auth0-fga.ts                # 🛡️ Fine-grained authorization
│   ├── token-vault.ts              # 🔑 Secure token management
│   └── utils.ts                    # Utilities
├── middleware/
│   └── authorization.ts            # 🚨 Permission middleware
└── types/
    └── diet.ts                     # Type definitions

public/
└── mockServiceWorker.js            # MSW for API mocking

.env.local                          # Environment variables
.env.example                        # Template
tsconfig.json                       # TypeScript config
tailwind.config.js                  # Tailwind config
next.config.ts                      # Next.js config
package.json                        # Dependencies
```

---

## 🚀 **Getting Started**

### **Prerequisites**

- Node.js 18+ 
- npm or yarn
- Auth0 account (https://auth0.com)
- API keys for:
  - OpenRouter (vision models)
  - Google Gemini (backup vision)
  - Spoonacular (nutrition data)
  - PDFBolt (PDF export)

### **1. Clone Repository**

```bash
git clone https://github.com/kris70lesgo/agen.git
cd agen
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Set Up Auth0**

#### **Create Auth0 Tenant**
- Go to https://auth0.com
- Sign up for free account
- Create new application (Regular Web App)
- Note your:
  - Domain
  - Client ID
  - Client Secret

#### **Configure Callback URLs**

In Auth0 Dashboard → Applications → Your App → Settings:

```
Allowed Callback URLs:
  http://localhost:3000/api/auth/callback
  https://your-domain.vercel.app/api/auth/callback

Allowed Logout URLs:
  http://localhost:3000
  https://your-domain.vercel.app

Allowed Web Origins:
  http://localhost:3000
  https://your-domain.vercel.app
```

#### **Create Auth0 Action (for custom claims)**

```
Auth0 Dashboard → Actions → Flows → Login → Custom

// Code:
exports.onExecutePostLogin = async (event, api) => {
  const namespace = event.request.hostname;
  
  if (event.authorization) {
    if (event.authorization.roles) {
      api.idToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
    }
    if (event.authorization.permissions) {
      api.idToken.setCustomClaim(`${namespace}/permissions`, event.authorization.permissions);
    }
  }
};
```

#### **Create Roles in Auth0**

```
Auth0 Dashboard → User Management → Roles

Create "pro_user" role with permissions:
- use:vision_agent
- use:diet_agent
- read:health_data
- write:health_data
- use:vision_api
- use:nutrition_api
- use:pdf_api
```

### **4. Set Environment Variables**

```bash
# Copy template
cp .env.example .env.local

# Edit with your values
nano .env.local
```

```env
# Auth0
AUTH0_SECRET='random-32-char-string'
AUTH0_DOMAIN='your-tenant.us.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'
APP_BASE_URL='http://localhost:3000'

# AI APIs
OPENROUTER_API_KEY='sk-or-v1-...'
GOOGLE_GENERATIVE_AI_API_KEY='AIzaSy...'

# Other APIs
SPOONACULAR_API_KEY='...'
PDFBOLT_API_KEY='...'
FROM_EMAIL='your-email@example.com'
FROM_NAME='MedHack'
```

### **5. Run Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in browser

### **6. Test Login**

1. Click "Sign Up" or "Get Started"
2. Create test account in Auth0
3. You'll be logged in as FREE_USER
4. Go to Settings → Click "Upgrade to Pro" (demo mode)
5. Role changes to PRO_USER
6. Access all premium features

---

## 🔌 **API Endpoints**

### **Public Routes**

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Landing page |
| `/api/auth/login` | GET | Auth0 login |
| `/api/auth/logout` | GET | Auth0 logout |
| `/api/auth/callback` | GET | Auth0 callback |

### **Protected Routes (Authenticated)**

| Route | Method | Permission | Description |
|-------|--------|-----------|-------------|
| `/dashboard` | GET | Authenticated | Dashboard hub |
| `/dashboard/settings` | GET | Authenticated | User settings |
| `/dashboard/pricing` | GET | Authenticated | Pricing page |
| `/dashboard/vision` | GET | `use:vision_agent` | Med Scan |
| `/dashboard/dietplan` | GET | `use:diet_agent` | Diet planning |

### **Protected APIs (Authorization)**

| Endpoint | Method | Permission | Description |
|----------|--------|-----------|-------------|
| `/api/gemini-vision` | POST | `use:vision_api` | Analyze medical image |
| `/api/diet-chat` | POST | `use:diet_agent` | Generate diet plan |
| `/api/user/permissions` | GET | Authenticated | Get user permissions |
| `/api/user/upgrade` | POST | Authenticated | Upgrade to Pro |
| `/api/user/clear-demo-role` | POST | Authenticated | Clear demo role (dev) |

### **Example: Vision API**

```bash
# Upload medical image for analysis

curl -X POST http://localhost:3000/api/gemini-vision \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "additionalDetails": "Patient age 54, history of diabetes"
  }'
```

**Response** (if authorized):
```json
{
  "analysis": "## Analysis of the Medical Image\n\n### Type of Medical Imaging\nX-ray (Chest)\n\n...",
  "model": "google/gemini-2.0-flash-exp:free"
}
```

**Response** (if unauthorized):
```json
{
  "error": "Forbidden: Insufficient permissions",
  "code": "INSUFFICIENT_PERMISSIONS",
  "required": "use:vision_api",
  "message": "Upgrade to Pro to access this feature",
  "status": 403
}
```

---

## 🔐 **Security & Authorization**

### **Security Layers**

1. **Layer 1: Authentication**
   - Auth0 handles user identity verification
   - JWT tokens with cryptographic signatures
   - HTTPOnly cookies (can't be stolen via JavaScript)

2. **Layer 2: Authorization**
   - Custom JWT claims contain roles & permissions
   - Server-side permission checks (client can't fake them)
   - Fine-grained access control (per-feature permissions)

3. **Layer 3: Token Management**
   - API keys stored server-side only
   - User isolation (each user has isolated tokens)
   - Usage tracking for auditing

4. **Layer 4: Audit Trail**
   - All API calls logged with user ID
   - Failed authorization attempts logged
   - Timestamp and action recorded

### **Permission Enforcement**

```typescript
// All API routes follow this pattern:

export async function POST(request: NextRequest) {
  // 1. Authenticate
  const session = await auth0.getSession();
  if (!session?.user) return 401;

  // 2. Authorize
  const authError = await withAuthorization(permissions.REQUIRED_PERM);
  if (authError) return authError; // 403 if denied

  // 3. Execute (only reached if authorized)
  // ... do protected action
}
```

### **Error Codes**

- **401 Unauthorized**: Not logged in
- **403 Forbidden**: Logged in but insufficient permissions
- **500 Internal Error**: Server error (always check logs)

---

## ⚙️ **Environment Setup**

### **Auth0 Setup Checklist**

- [ ] Create Auth0 account
- [ ] Create Auth0 application
- [ ] Set Auth0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET
- [ ] Configure callback URLs
- [ ] Create custom Action for JWT claims
- [ ] Create pro_user role
- [ ] Assign permissions to role
- [ ] Test login flow

### **API Keys Setup**

- [ ] OpenRouter account (free tier available)
- [ ] Google Gemini API key
- [ ] Spoonacular API key
- [ ] PDFBolt API key (optional)

### **Local Development**

```bash
# Generate AUTH0_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy to .env.local
AUTH0_SECRET='your-generated-secret'
```

---

## 🚀 **Deployment**

### **Deploy to Vercel**

```bash
# 1. Push to GitHub
git push origin master

# 2. Connect to Vercel
# Go to vercel.com → New Project → Select repo

# 3. Add environment variables
# Vercel → Settings → Environment Variables
# Add all variables from .env.local

# 4. Deploy
# Automatic on git push, or click Deploy

# 5. Update Auth0 callback URLs
# Add: https://your-domain.vercel.app/api/auth/callback
```

### **Production Checklist**

- [ ] Set AUTH0_SECRET in production env
- [ ] Update Auth0 callback URLs to production domain
- [ ] Use production Auth0 domain/credentials
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Test login flow in production
- [ ] Monitor error logs
- [ ] Set up error tracking (Sentry, etc.)

---

## 📖 **Development Guide**

### **Adding a New Protected API**

```typescript
// src/app/api/new-feature/route.ts

import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { withAuthorization } from '@/middleware/authorization';
import { permissions } from '@/lib/auth0-fga';

export async function POST(request: NextRequest) {
  // 1. Add authorization check
  const authError = await withAuthorization(permissions.YOUR_PERMISSION);
  if (authError) return authError;

  // 2. Get authenticated user
  const session = await auth0.getSession();
  const userId = session.user.sub;

  // 3. Your logic here
  
  return NextResponse.json({ success: true });
}
```

### **Adding a New Permission**

1. Add to `src/lib/auth0-fga.ts`:
```typescript
export const permissions = {
  // ... existing
  NEW_PERMISSION: 'new:permission',
};
```

2. Add to role in Auth0:
```
Auth0 → User Management → Roles → pro_user
Add Permission: new:permission
```

3. Use in API:
```typescript
const authError = await withAuthorization(permissions.NEW_PERMISSION);
```

### **Debugging Auth Issues**

```bash
# Check environment variables
node -e "console.log(process.env.AUTH0_DOMAIN)"

# Check JWT claims
# In browser console:
// Decode JWT from cookie
const token = document.cookie.split('auth0=')[1];
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log(decoded);

# Check permissions endpoint
curl http://localhost:3000/api/user/permissions \
  -H "Cookie: auth0=your-token"

# Clear demo role for testing
curl -X POST http://localhost:3000/api/user/clear-demo-role
```

---

## 📊 **Monitoring & Logging**

All important events are logged:

```typescript
// Authentication
[Auth0] Session retrieved for user@example.com

// Authorization
[AuthZ] Request allowed for user@example.com, Permission: use:vision_api
[AuthZ] Request blocked: Permission denied for user@example.com

// Token Vault
[TokenVault] Retrieved token for openrouter (user: google-oauth2|...)
[TokenVault] 🔐 Token masked: sk-or-v1-5d...c17

// API Execution
[Vision API] Analysis completed for user google-oauth2|...
[Upgrade] ✅ User user@example.com upgraded to pro_user
```

---

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 **License**

MIT License - see LICENSE file for details

---

## 🙋 **Support**

- **Issues**: GitHub Issues
- **Docs**: Check inline code comments
- **Auth0**: https://auth0.com/docs
- **Next.js**: https://nextjs.org/docs

---

## 🎯 **Project Highlights**

✅ **Enterprise Authentication** - Auth0 integration with custom claims  
✅ **Fine-Grained Authorization** - 10 permissions, 3 roles, server-side enforcement  
✅ **AI Integration** - Multiple vision models with automatic fallback  
✅ **Secure Token Management** - Server-side API key vault  
✅ **Demo-Ready** - HttpOnly cookie override for rapid testing  
✅ **Production-Ready** - Type-safe, error-handled, fully logged  
✅ **Responsive Design** - Works on all devices  
✅ **Dark Theme** - Beautiful UI with purple/cyan accents  

---

**Built with ❤️ for healthcare innovation**

**Live**: https://med-hack.vercel.app/
