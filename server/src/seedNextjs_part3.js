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

    // ── TOPIC 5: App Router & React Server Components ──
    const t5 = await Topic.create({
      title: 'App Router & Server Components',
      description: 'React Server Components, use client/server, Server Actions, streaming, layouts.',
      content: `# App Router & React Server Components

Introduced in **Next.js 13**, the App Router is a paradigm shift built on React's Server Components architecture.

## Default: Server Components
Every component in \`/app\` is a **React Server Component (RSC)** by default — they render on the server, have zero client-side JS, and can directly access databases, file systems, and secrets.

## Client Components
Add \`'use client'\` at the top of a file to opt into client-side rendering — required for interactivity (useState, useEffect, event handlers, browser APIs).

## Mental Model
\`\`\`
Server Components        Client Components
────────────────────     ────────────────────
Render on server         Render in browser
Zero JS to client        Sends JS bundle
Can await async data     useState, useEffect
Access backend directly  Access DOM/browser APIs
\`\`\`
`,
      subject: subject._id,
      order: 4,
      createdBy: admin._id,
    });

    const st5 = await Subtopic.create({
      title: 'RSC, Server Actions & Layouts',
      content: '# RSC, Server Actions & Layouts\n\nCovers the core App Router primitives.',
      topic: t5._id, order: 0, createdBy: admin._id,
    });

    const appRouterQnAs = [
      {
        question: 'What are React Server Components (RSC) and how do they fit into Next.js?',
        answer: `**React Server Components** render exclusively on the server. Their output (HTML) is streamed to the client with **zero JavaScript sent for the component itself**.\n\nIn Next.js App Router, **all components are RSC by default**.\n\n\`\`\`jsx\n// app/page.tsx — Server Component (default)\nexport default async function Page() {\n  // Can directly query DB, read files, call internal APIs\n  const data = await db.query('SELECT * FROM posts');\n  return <ul>{data.map(p => <li key={p.id}>{p.title}</li>)}</ul>;\n}\n\`\`\`\n\n**Benefits:** Smaller JS bundles, faster page loads, secrets stay on server, direct backend access.`,
        tags: ['rsc', 'server-components', 'app-router'],
      },
      {
        question: 'What is the `use client` directive in Next.js?',
        answer: `\`'use client'\` is placed at the **top of a file** to mark it (and all its imports) as a **Client Component**. Required whenever you use:\n- \`useState\`, \`useEffect\`, \`useContext\`\n- Event handlers (\`onClick\`, \`onChange\`)\n- Browser APIs (\`window\`, \`localStorage\`)\n- Third-party libraries that need the DOM\n\n\`\`\`jsx\n'use client';\nimport { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;\n}\n\`\`\`\n\n⚠️ Push \`'use client'\` as **deep** in the tree as possible to keep more components as RSC.`,
        tags: ['use-client', 'client-components'],
      },
      {
        question: 'What is the `use server` directive in Next.js?',
        answer: `\`'use server'\` marks a function as a **Server Action** — an async function that runs on the server but can be called from client components (e.g. form submissions).\n\n\`\`\`js\n// actions.ts\n'use server';\nexport async function createPost(formData: FormData) {\n  const title = formData.get('title');\n  await db.insert({ title });\n  revalidatePath('/blog');\n}\n\`\`\`\n\n\`\`\`jsx\n// Client component\nimport { createPost } from './actions';\n<form action={createPost}>\n  <input name="title" />\n  <button type="submit">Create</button>\n</form>\n\`\`\``,
        tags: ['use-server', 'server-actions'],
      },
      {
        question: 'What are server actions in Next.js?',
        answer: `**Server Actions** are async functions marked with \`'use server'\` that execute on the server. They allow form submissions and data mutations without building a separate API endpoint.\n\n**Key features:**\n- Called from Client Components via form \`action\` or event handlers\n- Automatically handle POST requests\n- Can call \`revalidatePath()\` / \`revalidateTag()\` to update cache\n- Can \`redirect()\` after mutation\n\n\`\`\`js\n'use server';\nimport { revalidatePath } from 'next/cache';\nimport { redirect } from 'next/navigation';\n\nexport async function deletePost(id: string) {\n  await db.posts.delete(id);\n  revalidatePath('/blog');\n  redirect('/blog');\n}\n\`\`\``,
        tags: ['server-actions', 'mutations'],
      },
      {
        question: 'What is the `loading.js` file in App Router?',
        answer: `\`loading.tsx\` is a **special file** that Next.js automatically wraps in a React \`<Suspense>\` boundary. It shows **instantly** while the page's async data loads, enabling streaming.\n\n\`\`\`\napp/blog/\n├── loading.tsx    ← shown immediately\n└── page.tsx       ← streams in when ready\n\`\`\`\n\n\`\`\`jsx\n// app/blog/loading.tsx\nexport default function Loading() {\n  return <div className="skeleton-loader">Loading posts...</div>;\n}\n\`\`\`\n\nThe layout and navigation remain interactive while the page loads.`,
        tags: ['loading', 'streaming', 'suspense'],
      },
      {
        question: 'What is the `error.js` file in App Router?',
        answer: `\`error.tsx\` is an **error boundary** for a route segment. It catches runtime errors in the segment and its children, showing a fallback UI instead of crashing the whole page.\n\n\`\`\`jsx\n// app/blog/error.tsx\n'use client'; // Error boundaries must be Client Components\n\nexport default function Error({ error, reset }) {\n  return (\n    <div>\n      <h2>Something went wrong: {error.message}</h2>\n      <button onClick={reset}>Try again</button>\n    </div>\n  );\n}\n\`\`\`\n\n\`reset()\` retries rendering the segment.`,
        tags: ['error-handling', 'error-boundary'],
      },
      {
        question: 'What is the difference between layouts and templates in App Router?',
        answer: `| | Layout (\`layout.tsx\`) | Template (\`template.tsx\`) |\n|---|---|---|\n| State preserved | ✅ Yes (re-used across routes) | ❌ No (re-mounted each navigation) |\n| DOM re-created | ❌ No | ✅ Yes |\n| Use case | Persistent UI (nav, sidebar) | Page transition animations, per-page effects |\n\n\`\`\`jsx\n// layout.tsx — shared wrapper, NOT re-mounted\nexport default function Layout({ children }) {\n  return <div><Sidebar />{children}</div>;\n}\n\`\`\`\n\n\`\`\`jsx\n// template.tsx — re-mounted on every navigation\nexport default function Template({ children }) {\n  return <div className="fade-in">{children}</div>;\n}\n\`\`\``,
        tags: ['layout', 'template', 'app-router'],
      },
      {
        question: 'What are parallel routes in Next.js App Router?',
        answer: `**Parallel Routes** allow rendering **multiple pages simultaneously** in the same layout using named slots (folders prefixed with \`@\`).\n\n\`\`\`\napp/dashboard/\n├── layout.tsx\n├── @analytics/page.tsx   ← slot 1\n├── @team/page.tsx        ← slot 2\n└── page.tsx\n\`\`\`\n\n\`\`\`jsx\n// layout.tsx\nexport default function Layout({ children, analytics, team }) {\n  return (\n    <>\n      {children}\n      <aside>{analytics}</aside>\n      <section>{team}</section>\n    </>\n  );\n}\n\`\`\`\n\n**Use case:** Split-view dashboards, conditional modals, tab groups.`,
        tags: ['parallel-routes', 'app-router'],
      },
      {
        question: 'How do you handle streaming and suspense in App Router?',
        answer: `Next.js App Router **streams HTML progressively** to the browser using React Suspense.\n\n\`\`\`jsx\nimport { Suspense } from 'react';\n\nexport default function Page() {\n  return (\n    <>\n      <h1>Dashboard</h1>                    {/* sent immediately */}\n      <Suspense fallback={<Skeleton />}>\n        <SlowDataComponent />               {/* streamed when ready */}\n      </Suspense>\n    </>\n  );\n}\n\`\`\`\n\n- \`loading.tsx\` = automatic top-level Suspense boundary\n- Nested \`<Suspense>\` = fine-grained streaming\n- Users see content progressively — no full-page wait.`,
        tags: ['streaming', 'suspense', 'performance'],
      },
    ];

    for (let i = 0; i < appRouterQnAs.length; i++) {
      await QuestionAnswer.create({ ...appRouterQnAs[i], subtopic: st5._id, topic: t5._id, order: i, createdBy: admin._id });
    }
    console.log('Topic 5 (App Router) done.');

    // ── TOPIC 6: API Routes ──
    const t6 = await Topic.create({
      title: 'API Routes',
      description: 'Creating backend endpoints inside Next.js with API routes and Route Handlers.',
      content: `# API Routes in Next.js

Next.js lets you build **full-stack applications** by creating backend API endpoints inside the same project.

## Pages Router: \`/pages/api/\`
Each file exports a **default handler function**.

## App Router: Route Handlers (\`route.ts\`)
Uses named HTTP method exports instead of a single handler.
`,
      subject: subject._id,
      order: 5,
      createdBy: admin._id,
    });

    const st6 = await Subtopic.create({
      title: 'API Route Handlers',
      content: '# API Route Handlers\n\nBuilding backend endpoints inside Next.js.',
      topic: t6._id, order: 0, createdBy: admin._id,
    });

    const apiQnAs = [
      {
        question: 'What are API Routes in Next.js?',
        answer: `**API Routes** are server-side endpoints built inside a Next.js project. They run only on the server and are never bundled into client JS.\n\n**Pages Router** (\`pages/api/hello.js\`):\n\`\`\`js\nexport default function handler(req, res) {\n  res.status(200).json({ message: 'Hello World' });\n}\n// Accessible at: GET /api/hello\n\`\`\`\n\n**App Router Route Handler** (\`app/api/hello/route.ts\`):\n\`\`\`ts\nexport async function GET() {\n  return Response.json({ message: 'Hello World' });\n}\n\`\`\``,
        tags: ['api-routes', 'backend'],
      },
      {
        question: 'What are route handlers vs API routes in App Router?',
        answer: `**Route Handlers** are the App Router replacement for Pages Router API Routes.\n\n| | API Routes (Pages) | Route Handlers (App) |\n|---|---|---|\n| File | \`pages/api/*.js\` | \`app/**/route.ts\` |\n| Export | Default function | Named HTTP methods |\n| Request | \`req\`, \`res\` (Node.js) | \`Request\` (Web API) |\n| Response | \`res.json()\` | \`Response.json()\` |\n\n\`\`\`ts\n// app/api/users/route.ts\nexport async function GET(request: Request) {\n  const users = await db.getUsers();\n  return Response.json(users);\n}\n\nexport async function POST(request: Request) {\n  const body = await request.json();\n  const user = await db.createUser(body);\n  return Response.json(user, { status: 201 });\n}\n\`\`\``,
        tags: ['route-handlers', 'api-routes', 'app-router'],
      },
      {
        question: 'How do you handle CORS in Next.js API routes?',
        answer: `Add CORS headers manually in API Routes / Route Handlers:\n\n\`\`\`ts\n// app/api/data/route.ts\nexport async function GET() {\n  return new Response(JSON.stringify({ data: 'ok' }), {\n    headers: {\n      'Content-Type': 'application/json',\n      'Access-Control-Allow-Origin': '*',\n      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',\n      'Access-Control-Allow-Headers': 'Content-Type',\n    },\n  });\n}\n\nexport async function OPTIONS() {\n  return new Response(null, {\n    headers: {\n      'Access-Control-Allow-Origin': '*',\n      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',\n    },\n  });\n}\n\`\`\`\n\nOr use the \`cors\` npm package in Pages Router handlers.`,
        tags: ['cors', 'api-routes', 'security'],
      },
    ];

    for (let i = 0; i < apiQnAs.length; i++) {
      await QuestionAnswer.create({ ...apiQnAs[i], subtopic: st6._id, topic: t6._id, order: i, createdBy: admin._id });
    }
    console.log('Topic 6 (API Routes) done.');

    console.log('\n✅ Part 3 seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

seed();
