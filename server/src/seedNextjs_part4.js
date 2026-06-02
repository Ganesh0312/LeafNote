const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const Subtopic = require('./models/Subtopic');
const QuestionAnswer = require('./models/QuestionAnswer');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    const admin = await User.findOne({ role: 'masterAdmin' });
    const subject = await Subject.findOne({ name: 'Next.js' });
    if (!admin || !subject) { console.error('Run Part 1 first.'); process.exit(1); }

    // ── TOPIC 7: Middleware & Security ──
    const t7 = await Topic.create({
      title: 'Middleware & Security',
      description: 'Middleware, authentication strategies, route protection, cookies and security.',
      content: `# Middleware & Security in Next.js

## What is Middleware?
Next.js **Middleware** runs before a request is completed — at the **Edge**, before the page or API route is reached. It can read/modify requests, redirect, rewrite, or set headers.

\`\`\`
Request → Middleware → Route Handler / Page
\`\`\`

## File Location
Create a single \`middleware.ts\` at the **root** of your project (next to \`app/\`).

## Common Uses
- Authentication / route protection
- Redirecting logged-out users
- A/B testing
- Rate limiting
- Geo-based redirects
`,
      subject: subject._id,
      order: 6,
      createdBy: admin._id,
    });

    const st7 = await Subtopic.create({
      title: 'Auth, Middleware & Cookies',
      content: '# Auth, Middleware & Cookies\n\nProtecting routes and managing authentication in Next.js.',
      topic: t7._id, order: 0, createdBy: admin._id,
    });

    const middlewareQnAs = [
      {
        question: 'What is middleware in Next.js?',
        answer: `**Middleware** is a function that runs on the **Edge Runtime** before every request. Defined in \`middleware.ts\` at the project root.\n\n\`\`\`ts\n// middleware.ts\nimport { NextResponse } from 'next/server';\nimport type { NextRequest } from 'next/server';\n\nexport function middleware(request: NextRequest) {\n  const token = request.cookies.get('token')?.value;\n  if (!token) {\n    return NextResponse.redirect(new URL('/login', request.url));\n  }\n  return NextResponse.next();\n}\n\nexport const config = {\n  matcher: ['/dashboard/:path*', '/profile/:path*'],\n};\n\`\`\`\n\nThe \`matcher\` config limits which routes trigger the middleware.`,
        tags: ['middleware', 'edge'],
      },
      {
        question: 'How do you handle authentication in Next.js?',
        answer: `**Three common approaches:**\n\n**1. JWT + Middleware (custom):**\n\`\`\`ts\n// middleware.ts\nconst token = request.cookies.get('token')?.value;\nif (!verifyJWT(token)) return NextResponse.redirect('/login');\n\`\`\`\n\n**2. NextAuth.js (Auth.js):**\n\`\`\`ts\n// app/api/auth/[...nextauth]/route.ts\nimport NextAuth from 'next-auth';\nimport GitHub from 'next-auth/providers/github';\n\nexport const { handlers } = NextAuth({ providers: [GitHub] });\nexport const { GET, POST } = handlers;\n\`\`\`\n\n**3. Clerk / Supabase Auth** — third-party hosted auth with Next.js SDK.\n\n**App Router pattern:** Store session in HTTP-only cookies, validate in middleware + Server Components.`,
        tags: ['authentication', 'jwt', 'nextauth'],
      },
      {
        question: 'How do you protect routes in Next.js?',
        answer: `**Method 1 — Middleware (recommended):**\n\`\`\`ts\n// middleware.ts\nexport function middleware(req: NextRequest) {\n  const token = req.cookies.get('session');\n  if (!token) return NextResponse.redirect(new URL('/login', req.url));\n}\nexport const config = { matcher: ['/dashboard/:path*'] };\n\`\`\`\n\n**Method 2 — Server Component check:**\n\`\`\`ts\n// app/dashboard/page.tsx\nimport { getSession } from '@/lib/auth';\nimport { redirect } from 'next/navigation';\n\nexport default async function Dashboard() {\n  const session = await getSession();\n  if (!session) redirect('/login');\n  return <h1>Welcome {session.user.name}</h1>;\n}\n\`\`\`\n\nMiddleware is preferred as it prevents even loading the page.`,
        tags: ['protected-routes', 'auth', 'middleware'],
      },
      {
        question: 'How do you manage cookies in Next.js?',
        answer: `**In Server Components / Route Handlers / Server Actions:**\n\`\`\`ts\nimport { cookies } from 'next/headers';\n\nexport async function GET() {\n  const cookieStore = cookies();\n  const token = cookieStore.get('token')?.value;\n  return Response.json({ token });\n}\n\n// Set a cookie\ncookieStore.set('token', 'abc123', { httpOnly: true, secure: true });\n\`\`\`\n\n**In Middleware:**\n\`\`\`ts\nconst token = request.cookies.get('token')?.value;\nconst response = NextResponse.next();\nresponse.cookies.set('theme', 'dark');\nreturn response;\n\`\`\`\n\nAlways use \`httpOnly: true\` for auth tokens to prevent XSS.`,
        tags: ['cookies', 'security'],
      },
    ];

    for (let i = 0; i < middlewareQnAs.length; i++) {
      await QuestionAnswer.create({ ...middlewareQnAs[i], subtopic: st7._id, topic: t7._id, order: i, createdBy: admin._id });
    }
    console.log('Topic 7 (Middleware) done.');

    // ── TOPIC 8: Performance Optimization ──
    const t8 = await Topic.create({
      title: 'Performance Optimization',
      description: 'Code splitting, dynamic imports, image optimization, prefetching and lazy loading.',
      content: `# Performance Optimization in Next.js

Next.js includes many performance optimizations out of the box, but understanding them helps you squeeze maximum speed.

## Core Web Vitals Targets
- **LCP** (Largest Contentful Paint) < 2.5s
- **FID** (First Input Delay) < 100ms
- **CLS** (Cumulative Layout Shift) < 0.1

## Built-in Optimizations
- Automatic code splitting per page
- Image optimization via \`next/image\`
- Font optimization via \`next/font\`
- Script loading strategies via \`next/script\`
- Automatic prefetching of Link-ed pages
`,
      subject: subject._id,
      order: 7,
      createdBy: admin._id,
    });

    const st8 = await Subtopic.create({
      title: 'Code Splitting, Images & Dynamic Imports',
      content: '# Code Splitting, Images & Dynamic Imports\n\nKey techniques to optimize Next.js app performance.',
      topic: t8._id, order: 0, createdBy: admin._id,
    });

    const perfQnAs = [
      {
        question: 'What is code splitting in Next.js?',
        answer: `**Code splitting** means breaking the JavaScript bundle into smaller chunks so users only download the code needed for the current page.\n\nNext.js does this **automatically**:\n- Each page in \`/pages\` or \`/app\` gets its own JS chunk\n- Shared code is split into separate common chunks\n- Third-party libraries are split into vendor chunks\n\n**Result:** A user visiting \`/blog\` only downloads the blog page JS, not the checkout page JS.\n\nYou can further split with dynamic imports:\n\`\`\`js\nconst HeavyChart = dynamic(() => import('./HeavyChart'));\n\`\`\``,
        tags: ['code-splitting', 'performance'],
      },
      {
        question: 'What is dynamic import (`next/dynamic`) in Next.js?',
        answer: `\`next/dynamic\` is a wrapper around \`React.lazy\` + \`Suspense\` with extra Next.js features like SSR control and a loading placeholder.\n\n\`\`\`js\nimport dynamic from 'next/dynamic';\n\nconst HeavyComponent = dynamic(() => import('../components/HeavyComponent'), {\n  loading: () => <p>Loading...</p>,\n  ssr: false, // skip server rendering\n});\n\nexport default function Page() {\n  return <HeavyComponent />;\n}\n\`\`\`\n\n**Use cases:** Chart libraries, rich text editors, map components, anything large that's not needed on initial paint.`,
        tags: ['dynamic-import', 'code-splitting'],
      },
      {
        question: 'What is `ssr: false` in dynamic import?',
        answer: `\`ssr: false\` tells Next.js to **skip server-side rendering** for the dynamically imported component — it only renders in the browser.\n\n\`\`\`js\nconst MapComponent = dynamic(() => import('./Map'), { ssr: false });\n\`\`\`\n\n**Use when:**\n- Component uses browser-only APIs (\`window\`, \`document\`, \`navigator\`)\n- Library doesn't support SSR (e.g. some mapping/canvas libraries)\n- Component causes hydration mismatches\n\nThe component will render \`null\` on the server and load after hydration on the client.`,
        tags: ['dynamic-import', 'ssr'],
      },
      {
        question: 'What is the Image component (`next/image`) and its benefits?',
        answer: `\`next/image\` is a drop-in replacement for \`<img>\` with automatic optimizations:\n\n| Feature | Benefit |\n|---|---|\n| Automatic WebP/AVIF | Smaller file sizes |\n| Lazy loading | Images load only when in viewport |\n| Size optimization | Serves correct size per device |\n| CLS prevention | Reserves space to avoid layout shift |\n| Blur placeholder | Smooth loading UX |\n\n\`\`\`jsx\nimport Image from 'next/image';\n\n<Image\n  src="/hero.jpg"\n  alt="Hero"\n  width={1200}\n  height={630}\n  priority          // Load eagerly (above the fold)\n  placeholder="blur"\n  blurDataURL="data:image/..."\n/>\n\`\`\``,
        tags: ['image', 'performance', 'next-image'],
      },
      {
        question: 'How do you handle lazy loading in Next.js?',
        answer: `**Two mechanisms:**\n\n**1. Images** — \`next/image\` lazy loads by default:\n\`\`\`jsx\n<Image src="/photo.jpg" alt="..." width={800} height={600} />\n// Loads only when image enters viewport\n\`\`\`\n\n**2. Components** — \`next/dynamic\`:\n\`\`\`js\nconst Modal = dynamic(() => import('./Modal'));\n// Bundle for Modal not downloaded until component renders\n\`\`\`\n\n**3. Named exports:**\n\`\`\`js\nconst { Chart } = dynamic(() =>\n  import('./Charts').then(mod => ({ default: mod.Chart }))\n);\n\`\`\``,
        tags: ['lazy-loading', 'performance'],
      },
    ];

    for (let i = 0; i < perfQnAs.length; i++) {
      await QuestionAnswer.create({ ...perfQnAs[i], subtopic: st8._id, topic: t8._id, order: i, createdBy: admin._id });
    }
    console.log('Topic 8 (Performance) done.');

    // ── TOPIC 9: Deployment & Configuration ──
    const t9 = await Topic.create({
      title: 'Deployment & Configuration',
      description: 'Deploying to Vercel, Docker, environment variables, next.config.js options.',
      content: `# Deployment & Configuration

## Deployment Options
| Platform | Notes |
|---|---|
| **Vercel** | Native platform, zero-config, serverless functions |
| **Docker** | Self-hosted, full control |
| **AWS / GCP / Azure** | Cloud VMs or serverless (Lambda, Cloud Run) |
| **Static Export** | CDN hosting (Netlify, GitHub Pages) — no SSR/ISR |

## Environment Variables
- \`.env.local\` — local dev (git-ignored)
- \`NEXT_PUBLIC_*\` prefix — exposed to browser
- All other vars — server-only
`,
      subject: subject._id,
      order: 8,
      createdBy: admin._id,
    });

    const st9 = await Subtopic.create({
      title: 'Vercel, Docker & Env Vars',
      content: '# Deployment & Environment Config\n\nHow to deploy and configure Next.js applications.',
      topic: t9._id, order: 0, createdBy: admin._id,
    });

    const deployQnAs = [
      {
        question: 'How do you deploy a Next.js app to Vercel?',
        answer: `Vercel is the easiest deployment option — it was built for Next.js.\n\n**Steps:**\n\`\`\`bash\n# 1. Push code to GitHub/GitLab/Bitbucket\ngit push origin main\n\n# 2. Install Vercel CLI (optional)\nnpm i -g vercel\nvercel  # follow prompts\n\`\`\`\n\n**Or via dashboard:**\n1. Go to [vercel.com](https://vercel.com) → Import Project\n2. Connect your Git repo\n3. Add environment variables\n4. Click Deploy\n\n**Auto-features on Vercel:**\n- Automatic preview deployments per PR\n- Edge Functions for Middleware\n- ISR and On-Demand Revalidation\n- Analytics and Speed Insights`,
        tags: ['deployment', 'vercel'],
      },
      {
        question: 'How do you handle environment variables in Next.js?',
        answer: `\`\`\`bash\n# .env.local (never commit this)\nDATABASE_URL=mongodb://localhost/mydb   # server-only\nNEXT_PUBLIC_API_URL=https://api.example.com  # exposed to browser\n\`\`\`\n\n**Accessing in code:**\n\`\`\`ts\n// Server-side only\nconst dbUrl = process.env.DATABASE_URL;\n\n// Client-side (must have NEXT_PUBLIC_ prefix)\nconst apiUrl = process.env.NEXT_PUBLIC_API_URL;\n\`\`\`\n\n**Files loaded in order:**\n1. \`.env\` — defaults\n2. \`.env.local\` — local overrides (git-ignored)\n3. \`.env.production\` / \`.env.development\`\n\n⚠️ Never put secrets in \`NEXT_PUBLIC_\` variables — they ship to the browser.`,
        tags: ['env-vars', 'config', 'security'],
      },
      {
        question: 'What is the `next export` command and its limitations?',
        answer: `\`next export\` (deprecated in Next.js 13+, replaced by \`output: 'export'\` in config) generates a **fully static HTML export** of your app.\n\n\`\`\`js\n// next.config.js\nmodule.exports = { output: 'export' };\n\`\`\`\n\n**Limitations — these features are NOT supported:**\n- Server-Side Rendering (\`getServerSideProps\`)\n- Incremental Static Regeneration (ISR)\n- API Routes / Route Handlers\n- Middleware\n- Image Optimization (requires a server)\n- App Router dynamic routes with server data\n\n**Use when:** Hosting on CDN/GitHub Pages with purely static content.`,
        tags: ['export', 'static', 'deployment'],
      },
    ];

    for (let i = 0; i < deployQnAs.length; i++) {
      await QuestionAnswer.create({ ...deployQnAs[i], subtopic: st9._id, topic: t9._id, order: i, createdBy: admin._id });
    }
    console.log('Topic 9 (Deployment) done.');

    // ── TOPIC 10: Advanced Topics ──
    const t10 = await Topic.create({
      title: 'Advanced Topics',
      description: '_app.js, _document.js, i18n, HMR, global state, TypeScript, and more.',
      content: `# Advanced Next.js Topics

## _app.js vs _document.js (Pages Router)
These two special files control the shell of your application.

## Global State in App Router
With Server Components, state management shifts — much state can live on the server. For client state, use React Context, Zustand, or Jotai — but keep stores in Client Components.

## TypeScript
Next.js has first-class TypeScript support with automatic type inference for \`params\`, \`searchParams\`, and route segment configs.
`,
      subject: subject._id,
      order: 9,
      createdBy: admin._id,
    });

    const st10 = await Subtopic.create({
      title: 'App/Document Files, i18n & State',
      content: '# Advanced Next.js Concepts\n\nCovering _app.js, _document.js, i18n, HMR and global state.',
      topic: t10._id, order: 0, createdBy: admin._id,
    });

    const advancedQnAs = [
      {
        question: 'What is the `_app.js` file in Next.js?',
        answer: `**\`_app.js\`** (Pages Router) wraps every page component. Use it for:\n- Global CSS imports\n- Layout wrappers (header, footer)\n- Global state providers (Redux, Context)\n- Page transition animations\n\n\`\`\`jsx\n// pages/_app.js\nimport '../styles/globals.css';\nimport Layout from '../components/Layout';\n\nexport default function MyApp({ Component, pageProps }) {\n  return (\n    <Layout>\n      <Component {...pageProps} />\n    </Layout>\n  );\n}\n\`\`\`\n\nIn **App Router**, \`app/layout.tsx\` replaces \`_app.js\`.`,
        tags: ['_app', 'pages-router', 'layout'],
      },
      {
        question: 'What is the `_document.js` file in Next.js?',
        answer: `**\`_document.js\`** customises the **HTML document shell** — the \`<html>\`, \`<head>\`, and \`<body>\` tags. It only renders on the **server**.\n\n\`\`\`jsx\n// pages/_document.js\nimport { Html, Head, Main, NextScript } from 'next/document';\n\nexport default function Document() {\n  return (\n    <Html lang="en">\n      <Head>\n        <link rel="preconnect" href="https://fonts.googleapis.com" />\n      </Head>\n      <body className="bg-white">\n        <Main />\n        <NextScript />\n      </body>\n    </Html>\n  );\n}\n\`\`\`\n\nIn **App Router**, \`app/layout.tsx\` returns the \`<html>\` tag directly.`,
        tags: ['_document', 'pages-router', 'html'],
      },
      {
        question: 'How do you handle internationalization (i18n) in Next.js?',
        answer: `**Built-in i18n routing** (Pages Router):\n\`\`\`js\n// next.config.js\nmodule.exports = {\n  i18n: {\n    locales: ['en', 'fr', 'de'],\n    defaultLocale: 'en',\n  },\n};\n// Routes: /en/about, /fr/about, /de/about\n\`\`\`\n\n**App Router** — use a library like **next-intl** or **next-i18next**:\n\`\`\`\napp/\n└── [locale]/\n    ├── layout.tsx\n    └── page.tsx\n\`\`\`\n\n\`\`\`ts\n// middleware.ts — detect and redirect to locale\nimport createMiddleware from 'next-intl/middleware';\nexport default createMiddleware({ locales: ['en', 'fr'], defaultLocale: 'en' });\n\`\`\``,
        tags: ['i18n', 'internationalization'],
      },
      {
        question: 'How do you handle global state management in Next.js with App Router?',
        answer: `With App Router and Server Components, rethink state management:\n\n**1. URL State** — use \`useSearchParams\` for shareable UI state\n\n**2. Server State** — keep in Server Components, pass via props\n\n**3. Client State** — use Context or lightweight stores:\n\`\`\`tsx\n// Store must be in a Client Component provider\n'use client';\nimport { createContext, useContext, useState } from 'react';\n\nconst ThemeContext = createContext('light');\n\nexport function ThemeProvider({ children }) {\n  const [theme, setTheme] = useState('light');\n  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;\n}\n\`\`\`\n\n**4. Zustand / Jotai** — for complex client state without prop drilling.`,
        tags: ['state-management', 'app-router', 'context'],
      },
      {
        question: 'Is it possible to use both App Router and Pages Router in the same project?',
        answer: `**Yes.** Next.js supports running both routers **simultaneously** in the same project, which is designed for **incremental migration**.\n\n\`\`\`\nmy-app/\n├── app/          # App Router routes\n│   └── dashboard/page.tsx\n├── pages/        # Pages Router routes\n│   ├── blog.js\n│   └── api/hello.js\n\`\`\`\n\n**Rules:**\n- Routes in \`/app\` take precedence over \`/pages\` for the same path\n- \`_app.js\` and \`_document.js\` still apply to Pages Router routes only\n- Gradually move routes from \`/pages\` to \`/app\`\n\n**Recommended:** Migrate fully to App Router for new projects.`,
        tags: ['app-router', 'pages-router', 'migration'],
      },
    ];

    for (let i = 0; i < advancedQnAs.length; i++) {
      await QuestionAnswer.create({ ...advancedQnAs[i], subtopic: st10._id, topic: t10._id, order: i, createdBy: admin._id });
    }
    console.log('Topic 10 (Advanced) done.');

    console.log('\n✅ Part 4 seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

seed();
