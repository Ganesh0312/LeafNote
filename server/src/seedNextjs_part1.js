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
    if (!admin) { console.error('No masterAdmin found. Run seed.js first.'); process.exit(1); }

    // Clean existing Next.js subject
    const existing = await Subject.findOne({ name: 'Next.js' });
    if (existing) {
      await Topic.deleteMany({ subject: existing._id });
      await Subject.deleteOne({ _id: existing._id });
    }

    // Create Subject
    const subject = await Subject.create({
      name: 'Next.js',
      description: 'Comprehensive Next.js interview preparation covering basics, rendering, routing, App Router, performance, and deployment.',
      isPublic: true,
      createdBy: admin._id,
    });
    console.log('Subject created:', subject.name);

    // ── TOPIC 1: Basic Next.js ──
    const t1 = await Topic.create({
      title: 'Basic Next.js',
      description: 'Fundamental concepts, project setup, and core features of Next.js.',
      content: `# Basic Next.js

Next.js is a **React framework** built by Vercel that adds powerful features on top of React: server-side rendering, static generation, file-based routing, and API routes — all out of the box.

## Why Next.js?
- Zero-config setup for SSR, SSG, and ISR
- File-based routing (no react-router needed)
- Built-in image, font, and script optimisation
- Full-stack capability via API routes / Route Handlers
- First-class TypeScript support

## Project Structure
\`\`\`
my-app/
├── app/          # App Router (Next.js 13+)
├── pages/        # Pages Router (legacy)
├── public/       # Static assets
├── next.config.js
└── package.json
\`\`\`
`,
      subject: subject._id,
      order: 0,
      createdBy: admin._id,
    });

    const st1 = await Subtopic.create({
      title: 'Core Concepts',
      content: `# Core Concepts of Next.js\n\nCovers project creation, routing philosophy, and essential configuration files.`,
      topic: t1._id,
      order: 0,
      createdBy: admin._id,
    });

    const basicQnAs = [
      {
        question: 'What is Next.js and how is it different from React?',
        answer: `**Next.js** is a full-stack React framework by Vercel. React is a UI library — it only handles the view layer. Next.js builds on top of React and adds:\n\n- **Server-Side Rendering (SSR)** — HTML generated per request on the server\n- **Static Site Generation (SSG)** — HTML pre-built at compile time\n- **File-based Routing** — folders/files define routes automatically\n- **API Routes / Route Handlers** — build backend endpoints inside the same project\n- **Built-in optimisations** — images, fonts, scripts\n\n\`\`\`bash\n# React alone\nnpx create-react-app my-app   # client-side only\n\n# Next.js\nnpx create-next-app@latest my-app  # SSR + SSG + routing included\n\`\`\``,
        tags: ['basics', 'react', 'nextjs'],
      },
      {
        question: 'How do you create a new Next.js project?',
        answer: `Use the official CLI:\n\n\`\`\`bash\nnpx create-next-app@latest my-app\n# Options prompted:\n# TypeScript? Yes\n# ESLint?    Yes\n# Tailwind?  Yes\n# App Router? Yes\n\`\`\`\n\nOr with flags for non-interactive setup:\n\`\`\`bash\nnpx create-next-app@latest my-app --typescript --tailwind --app --eslint\n\`\`\``,
        tags: ['setup', 'cli'],
      },
      {
        question: 'What are the key features of Next.js?',
        answer: `| Feature | Description |\n|---|---|\n| File-based Routing | Pages/routes defined by folder structure |\n| SSR | HTML rendered per request on the server |\n| SSG | HTML pre-built at build time |\n| ISR | Static pages re-generated in the background |\n| API Routes | Backend endpoints inside \`/pages/api\` or Route Handlers |\n| Image Optimisation | Automatic WebP conversion and lazy loading |\n| Font Optimisation | Zero-layout-shift font loading |\n| Middleware | Edge functions that run before a request completes |\n| React Server Components | Server-rendered components with zero client JS |`,
        tags: ['features', 'overview'],
      },
      {
        question: 'What is file-based routing in Next.js?',
        answer: `In Next.js, the **file system IS the router**. Every file inside \`/app\` (or \`/pages\`) maps to a URL.\n\n\`\`\`\napp/\n├── page.tsx          →  /\n├── about/page.tsx    →  /about\n├── blog/\n│   ├── page.tsx      →  /blog\n│   └── [slug]/page.tsx → /blog/:slug\n\`\`\`\n\nNo external router configuration needed.`,
        tags: ['routing', 'basics'],
      },
      {
        question: 'What is the difference between Pages Router and App Router?',
        answer: `| Feature | Pages Router | App Router |\n|---|---|---|\n| Location | \`/pages\` | \`/app\` |\n| Introduced | Next.js 1 | Next.js 13 |\n| Default component | Client Component | **Server Component** |\n| Data fetching | \`getStaticProps\`, \`getServerSideProps\` | \`async\` component functions |\n| Layouts | \`_app.js\` | \`layout.tsx\` (nested) |\n| Loading UI | Manual | \`loading.tsx\` |\n| Error UI | \`_error.js\` | \`error.tsx\` |\n| Streaming | Not built-in | Built-in with Suspense |\n\n**App Router is the recommended approach for new projects.**`,
        tags: ['app-router', 'pages-router'],
      },
      {
        question: 'What is the purpose of the `pages` or `app` directory?',
        answer: `- **\`/pages\`** (Pages Router): Each \`.js/.tsx\` file is a route. Special files: \`_app.js\`, \`_document.js\`, \`404.js\`.\n- **\`/app\`** (App Router): Uses a folder + \`page.tsx\` convention. Supports layouts, loading, error, and not-found files per route segment.\n\nBoth can coexist in a single project during migration.`,
        tags: ['directory', 'routing'],
      },
      {
        question: 'What is the `public` folder in Next.js?',
        answer: `The \`/public\` directory serves **static assets** at the root URL path.\n\n\`\`\`\npublic/\n├── logo.png       →  accessible at  /logo.png\n└── robots.txt     →  accessible at  /robots.txt\n\`\`\`\n\n**Usage in code:**\n\`\`\`jsx\n<img src="/logo.png" alt="Logo" />\n// or with next/image:\n<Image src="/logo.png" width={100} height={50} alt="Logo" />\n\`\`\`\n\nFiles here are **never processed** by webpack.`,
        tags: ['static-files', 'public'],
      },
      {
        question: 'What is the default port for a Next.js app?',
        answer: `Next.js runs on **port 3000** by default.\n\n\`\`\`bash\nnpm run dev        # http://localhost:3000\nnpm run dev -- -p 4000  # custom port 4000\n\`\`\``,
        tags: ['basics', 'dev-server'],
      },
      {
        question: 'What is Fast Refresh in Next.js?',
        answer: `**Fast Refresh** is a development feature (powered by React Refresh) that provides **instant feedback** when you edit a file:\n\n- Edits inside React components → component state is **preserved**, UI updates instantly\n- Edits to non-component files → full page reload\n- Syntax errors → shown as an overlay, state restored after fix\n\nIt replaces the older Hot Module Replacement (HMR) with a smarter, React-aware version.`,
        tags: ['dev-experience', 'hmr'],
      },
      {
        question: 'What is `next.config.js`?',
        answer: `\`next.config.js\` is the **main configuration file** for a Next.js project.\n\n\`\`\`js\n// next.config.js\n/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  reactStrictMode: true,\n  images: {\n    domains: ['example.com'],\n  },\n  redirects: async () => [{ source: '/old', destination: '/new', permanent: true }],\n  headers: async () => [...],\n  env: { MY_VAR: 'value' },\n  experimental: { serverActions: true },\n};\n\nmodule.exports = nextConfig;\n\`\`\`\n\nCommon options: \`images\`, \`redirects\`, \`rewrites\`, \`headers\`, \`env\`, \`experimental\`.`,
        tags: ['config', 'setup'],
      },
    ];

    for (let i = 0; i < basicQnAs.length; i++) {
      await QuestionAnswer.create({ ...basicQnAs[i], subtopic: st1._id, topic: t1._id, order: i, createdBy: admin._id });
    }
    console.log('Topic 1 (Basic) done.');

    // ── TOPIC 2: Rendering Strategies ──
    const t2 = await Topic.create({
      title: 'Rendering Strategies',
      description: 'SSR, SSG, ISR, CSR and when to use each.',
      content: `# Rendering Strategies in Next.js

Next.js offers multiple rendering strategies so you can pick the best approach per page.

## The Four Strategies

| Strategy | Abbreviation | When HTML is generated |
|---|---|---|
| Static Site Generation | SSG | At **build time** |
| Server-Side Rendering | SSR | On **every request** |
| Incremental Static Regeneration | ISR | At build time + **re-generated in background** |
| Client-Side Rendering | CSR | In the **browser** after load |

## Pre-rendering
Both SSG and SSR are forms of **pre-rendering** — Next.js generates HTML before it reaches the client, improving SEO and initial load performance.
`,
      subject: subject._id,
      order: 1,
      createdBy: admin._id,
    });

    const st2 = await Subtopic.create({
      title: 'SSR, SSG, ISR & CSR',
      content: `# Rendering Modes\n\nUnderstanding when each rendering mode is appropriate is key to Next.js mastery.`,
      topic: t2._id,
      order: 0,
      createdBy: admin._id,
    });

    const renderingQnAs = [
      {
        question: 'What is Server-Side Rendering (SSR) in Next.js?',
        answer: `**SSR** generates the HTML on the server **for every incoming request**.\n\n**Pages Router:**\n\`\`\`js\nexport async function getServerSideProps(context) {\n  const data = await fetch('https://api.example.com/data');\n  return { props: { data: await data.json() } };\n}\n\`\`\`\n\n**App Router:**\n\`\`\`js\n// Default: Server Component with no caching = SSR\nexport default async function Page() {\n  const res = await fetch('https://api.example.com/data', { cache: 'no-store' });\n  const data = await res.json();\n  return <div>{data.title}</div>;\n}\n\`\`\`\n\n**Use when:** Content changes per-request (user-specific data, real-time data).`,
        tags: ['ssr', 'rendering'],
      },
      {
        question: 'What is Static Site Generation (SSG) in Next.js?',
        answer: `**SSG** pre-renders HTML at **build time**. The same HTML is served to every user.\n\n**Pages Router:**\n\`\`\`js\nexport async function getStaticProps() {\n  const data = await fetch('https://api.example.com/posts');\n  return { props: { posts: await data.json() } };\n}\n\`\`\`\n\n**App Router:**\n\`\`\`js\n// Default fetch behaviour = SSG (cached)\nexport default async function Page() {\n  const res = await fetch('https://api.example.com/posts'); // cached at build\n  const posts = await res.json();\n  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;\n}\n\`\`\`\n\n**Use when:** Content is the same for all users and doesn't change often (blogs, docs, marketing).`,
        tags: ['ssg', 'rendering'],
      },
      {
        question: 'What is the difference between SSR and SSG?',
        answer: `| | SSG | SSR |\n|---|---|---|\n| When generated | Build time | Every request |\n| Speed | ⚡ Fastest (CDN cached) | Slower (server work per request) |\n| Freshness | Stale until rebuild | Always fresh |\n| Use case | Blogs, docs, landing pages | Dashboards, user-specific pages |\n| Pages Router | \`getStaticProps\` | \`getServerSideProps\` |\n| App Router | default \`fetch\` (cached) | \`fetch\` with \`cache: 'no-store'\` |`,
        tags: ['ssr', 'ssg', 'comparison'],
      },
      {
        question: 'What is Incremental Static Regeneration (ISR)?',
        answer: `**ISR** lets you update static pages **after build time** without a full rebuild.\n\n**Pages Router:**\n\`\`\`js\nexport async function getStaticProps() {\n  const data = await fetch('...');\n  return {\n    props: { data: await data.json() },\n    revalidate: 60, // Regenerate at most once every 60 seconds\n  };\n}\n\`\`\`\n\n**App Router:**\n\`\`\`js\nexport default async function Page() {\n  const res = await fetch('https://api.example.com/data', {\n    next: { revalidate: 60 }, // revalidate every 60s\n  });\n  const data = await res.json();\n  return <div>{data.title}</div>;\n}\n\`\`\`\n\nFirst request after 60s triggers a background regeneration. The stale page is served until the new one is ready (**stale-while-revalidate**).`,
        tags: ['isr', 'rendering'],
      },
      {
        question: 'What is client-side rendering (CSR) and how does it differ from SSR?',
        answer: `**CSR**: HTML is minimal (empty shell), JavaScript runs in the browser and fetches/renders data.\n\n| | CSR | SSR |\n|---|---|---|\n| HTML on load | Empty shell | Full HTML |\n| SEO | Poor | Excellent |\n| Initial load | Slow (JS download) | Fast (HTML ready) |\n| Interactivity | Immediate after hydration | After hydration |\n\n**CSR in Next.js (App Router):**\n\`\`\`js\n'use client';\nimport { useState, useEffect } from 'react';\n\nexport default function Page() {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    fetch('/api/data').then(r => r.json()).then(setData);\n  }, []);\n  return <div>{data?.title}</div>;\n}\n\`\`\``,
        tags: ['csr', 'rendering'],
      },
      {
        question: 'When would you choose SSR vs SSG vs ISR?',
        answer: `| Scenario | Best Strategy |\n|---|---|\n| Blog / documentation | **SSG** — content rarely changes |\n| Product landing page | **SSG** — same for all users |\n| E-commerce product page | **ISR** — updates periodically |\n| News site | **ISR** with short revalidation |\n| User dashboard | **SSR** — user-specific |\n| Real-time data (stock ticker) | **CSR** — continuous updates |\n| Auth-protected pages | **SSR** or CSR with guards |\n\n**Rule of thumb:** Prefer SSG → ISR → SSR → CSR in that order for best performance.`,
        tags: ['rendering', 'strategy'],
      },
      {
        question: 'What is pre-rendering in Next.js?',
        answer: `**Pre-rendering** means Next.js generates HTML **before** it reaches the client's browser (either at build time or on the server). This contrasts with a plain React app where all rendering happens in the browser.\n\nTwo forms:\n1. **SSG** — pre-render at build time\n2. **SSR** — pre-render at request time\n\nBenefits:\n- Better SEO (crawlers see full HTML)\n- Faster First Contentful Paint (FCP)\n- Works without JavaScript enabled\n\nAfter the HTML loads, React "hydrates" it and makes it interactive.`,
        tags: ['pre-rendering', 'rendering'],
      },
    ];

    for (let i = 0; i < renderingQnAs.length; i++) {
      await QuestionAnswer.create({ ...renderingQnAs[i], subtopic: st2._id, topic: t2._id, order: i, createdBy: admin._id });
    }
    console.log('Topic 2 (Rendering) done.');

    console.log('\n✅ Part 1 seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

seed();
