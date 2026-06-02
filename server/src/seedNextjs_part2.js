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

    // ── TOPIC 3: Data Fetching (Pages Router) ──
    const t3 = await Topic.create({
      title: 'Data Fetching (Pages Router)',
      description: 'getStaticProps, getServerSideProps, getStaticPaths and client-side fetching.',
      content: `# Data Fetching in Pages Router

The Pages Router has three special async functions for data fetching that run **only on the server** and never ship code to the browser.

| Function | When it runs | Use for |
|---|---|---|
| \`getStaticProps\` | Build time | SSG |
| \`getServerSideProps\` | Every request | SSR |
| \`getStaticPaths\` | Build time | Dynamic SSG routes |

## Key Rule
These functions must be **exported from page files** (\`/pages/*.js\`). They cannot be used in components.
`,
      subject: subject._id,
      order: 2,
      createdBy: admin._id,
    });

    const st3 = await Subtopic.create({
      title: 'Pages Router Data Functions',
      content: '# Pages Router Data Functions\n\nDeep dive into getStaticProps, getServerSideProps, and getStaticPaths.',
      topic: t3._id, order: 0, createdBy: admin._id,
    });

    const dataFetchQnAs = [
      {
        question: 'What is `getStaticProps` and when do you use it?',
        answer: `**\`getStaticProps\`** fetches data at **build time** and passes it as props to the page component. The page becomes a static HTML file.\n\n\`\`\`js\nexport async function getStaticProps() {\n  const res = await fetch('https://api.example.com/posts');\n  const posts = await res.json();\n\n  return {\n    props: { posts },      // passed to the component\n    revalidate: 60,        // optional: ISR every 60s\n  };\n}\n\nexport default function Blog({ posts }) {\n  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;\n}\n\`\`\`\n\n**Use when:** The page content is the same for all users and can be pre-built (blogs, docs, portfolios).`,
        tags: ['getStaticProps', 'ssg', 'data-fetching'],
      },
      {
        question: 'What is `getServerSideProps` and when do you use it?',
        answer: `**\`getServerSideProps\`** runs on the server **on every request**. It receives the request context (cookies, headers, query params).\n\n\`\`\`js\nexport async function getServerSideProps(context) {\n  const { params, req, res, query } = context;\n  const userId = req.cookies.userId;\n  const data = await fetch(\`https://api.example.com/user/\${userId}\`);\n\n  return { props: { user: await data.json() } };\n}\n\`\`\`\n\n**Use when:** The page depends on per-request data — authentication, user-specific content, or real-time data.`,
        tags: ['getServerSideProps', 'ssr', 'data-fetching'],
      },
      {
        question: 'What is the difference between `getStaticProps` and `getServerSideProps`?',
        answer: `| | \`getStaticProps\` | \`getServerSideProps\` |\n|---|---|---|\n| Runs at | Build time | Every request |\n| Rendering | SSG (static) | SSR (dynamic) |\n| Performance | ⚡ Faster (CDN) | Slower (server compute) |\n| Has access to \`req\`/\`res\` | ❌ No | ✅ Yes |\n| Use case | Blogs, docs | User dashboards, auth pages |\n| Can use ISR | ✅ Yes (\`revalidate\`) | ❌ No |`,
        tags: ['comparison', 'data-fetching'],
      },
      {
        question: 'What is `getStaticPaths` and its purpose?',
        answer: `**\`getStaticPaths\`** tells Next.js **which dynamic routes to pre-build** at build time. Required for dynamic SSG pages.\n\n\`\`\`js\n// pages/blog/[slug].js\nexport async function getStaticPaths() {\n  const res = await fetch('https://api.example.com/posts');\n  const posts = await res.json();\n\n  const paths = posts.map(post => ({ params: { slug: post.slug } }));\n\n  return { paths, fallback: false };\n}\n\nexport async function getStaticProps({ params }) {\n  const res = await fetch(\`https://api.example.com/posts/\${params.slug}\`);\n  return { props: { post: await res.json() } };\n}\n\`\`\``,
        tags: ['getStaticPaths', 'dynamic-routes', 'ssg'],
      },
      {
        question: 'What is `fallback` in `getStaticPaths`?',
        answer: `The \`fallback\` option controls what happens when a user visits a route **not pre-built**:\n\n| Value | Behaviour |\n|---|---|\n| \`false\` | Unknown paths → 404 page |\n| \`true\` | Serve a fallback page, generate in background, cache for future |\n| \`'blocking'\` | Wait for the page to be generated server-side (no fallback UI) |\n\n\`\`\`js\nreturn { paths, fallback: 'blocking' }; // best for ISR\n\`\`\`\n\nUse \`fallback: true\` with \`router.isFallback\` to show a loading state.`,
        tags: ['getStaticPaths', 'fallback'],
      },
      {
        question: 'How do you perform client-side data fetching in Next.js?',
        answer: `Use standard React patterns — \`useEffect\` + \`fetch\`, or libraries like **SWR** or **React Query**.\n\n\`\`\`js\nimport useSWR from 'swr';\n\nconst fetcher = (url) => fetch(url).then(r => r.json());\n\nexport default function Profile() {\n  const { data, error, isLoading } = useSWR('/api/user', fetcher);\n\n  if (isLoading) return <p>Loading...</p>;\n  if (error) return <p>Error</p>;\n  return <p>Hello {data.name}</p>;\n}\n\`\`\`\n\n**SWR** (by Vercel) provides caching, revalidation, deduplication and focus-tracking out of the box.`,
        tags: ['csr', 'swr', 'data-fetching'],
      },
    ];

    for (let i = 0; i < dataFetchQnAs.length; i++) {
      await QuestionAnswer.create({ ...dataFetchQnAs[i], subtopic: st3._id, topic: t3._id, order: i, createdBy: admin._id });
    }
    console.log('Topic 3 (Data Fetching) done.');

    // ── TOPIC 4: Routing ──
    const t4 = await Topic.create({
      title: 'Routing',
      description: 'File-based routing, dynamic routes, Link, useRouter, redirects and rewrites.',
      content: `# Routing in Next.js

Next.js uses a **file-system based router**. No manual route configuration is required.

## App Router Route Conventions
\`\`\`
app/
├── page.tsx              →  /
├── about/page.tsx        →  /about
├── blog/
│   ├── page.tsx          →  /blog
│   └── [slug]/page.tsx   →  /blog/:slug
├── shop/
│   └── [...categories]/page.tsx  →  /shop/a/b/c (catch-all)
└── (auth)/
    └── login/page.tsx    →  /login (route group, no URL segment)
\`\`\`
`,
      subject: subject._id,
      order: 3,
      createdBy: admin._id,
    });

    const st4 = await Subtopic.create({
      title: 'Navigation & Dynamic Routes',
      content: '# Navigation & Dynamic Routes\n\nCovers Link, useRouter, dynamic segments, catch-all routes, redirects and rewrites.',
      topic: t4._id, order: 0, createdBy: admin._id,
    });

    const routingQnAs = [
      {
        question: 'What is the `Link` component in Next.js?',
        answer: `\`<Link>\` from \`next/link\` enables **client-side navigation** between pages without a full page reload. It also **prefetches** the linked page in the background.\n\n\`\`\`jsx\nimport Link from 'next/link';\n\nexport default function Nav() {\n  return (\n    <nav>\n      <Link href="/">Home</Link>\n      <Link href="/blog">Blog</Link>\n      <Link href={\`/blog/\${slug}\`}>Post</Link>\n    </nav>\n  );\n}\n\`\`\`\n\nPrefetching is **automatic** in production for links in the viewport. Disable with \`prefetch={false}\`.`,
        tags: ['link', 'navigation'],
      },
      {
        question: 'What is the `useRouter` hook?',
        answer: `**\`useRouter\`** (from \`next/navigation\` in App Router, \`next/router\` in Pages Router) gives access to the router object for programmatic navigation and reading route info.\n\n\`\`\`js\n// App Router\n'use client';\nimport { useRouter, usePathname, useSearchParams } from 'next/navigation';\n\nexport default function Page() {\n  const router = useRouter();\n  const pathname = usePathname();   // e.g. '/blog'\n  const searchParams = useSearchParams(); // e.g. ?page=2\n\n  return <button onClick={() => router.push('/home')}>Go Home</button>;\n}\n\`\`\``,
        tags: ['useRouter', 'navigation'],
      },
      {
        question: 'What is the difference between `push` and `replace` in `useRouter`?',
        answer: `| Method | Behaviour |\n|---|---|\n| \`router.push('/page')\` | Navigates and **adds** a new entry to browser history |\n| \`router.replace('/page')\` | Navigates and **replaces** the current history entry |\n\n\`\`\`js\nrouter.push('/dashboard');  // back button goes to previous page\nrouter.replace('/login');   // back button skips this page\n\`\`\`\n\nUse \`replace\` for login redirects so users can't go "back" to a protected page.`,
        tags: ['useRouter', 'navigation', 'history'],
      },
      {
        question: 'How do you create dynamic routes in Next.js?',
        answer: `Wrap a folder/file name in **square brackets**:\n\n\`\`\`\n# Single dynamic segment\napp/blog/[slug]/page.tsx   →  /blog/hello-world\n\n# Multiple segments (catch-all)\napp/docs/[...path]/page.tsx  →  /docs/a/b/c\n\n# Optional catch-all\napp/docs/[[...path]]/page.tsx  →  /docs  AND  /docs/a/b\n\`\`\`\n\n\`\`\`js\nexport default function BlogPost({ params }) {\n  return <h1>{params.slug}</h1>;\n}\n\`\`\``,
        tags: ['dynamic-routes', 'routing'],
      },
      {
        question: 'What is a catch-all segment in Next.js?',
        answer: `A **catch-all segment** (\`[...slug]\`) matches **one or more path segments** and collects them as an array.\n\n\`\`\`\napp/docs/[...path]/page.tsx\n→ /docs/a          params.path = ['a']\n→ /docs/a/b        params.path = ['a', 'b']\n→ /docs/a/b/c      params.path = ['a', 'b', 'c']\n\`\`\`\n\n**Optional catch-all** (\`[[...path]]\`) also matches the root:\n\`\`\`\n→ /docs            params.path = undefined\n\`\`\``,
        tags: ['catch-all', 'dynamic-routes'],
      },
      {
        question: 'What are the differences between redirects and rewrites?',
        answer: `| | Redirects | Rewrites |\n|---|---|---|\n| URL in browser | **Changes** to destination | **Stays** at source |\n| HTTP status | 301 / 302 | No redirect response |\n| Use case | Old URL → new URL | Proxy, URL aliasing |\n\n\`\`\`js\n// next.config.js\nmodule.exports = {\n  async redirects() {\n    return [{ source: '/old', destination: '/new', permanent: true }];\n  },\n  async rewrites() {\n    return [{ source: '/api/:path*', destination: 'https://backend.com/:path*' }];\n  },\n};\n\`\`\``,
        tags: ['redirects', 'rewrites', 'config'],
      },
    ];

    for (let i = 0; i < routingQnAs.length; i++) {
      await QuestionAnswer.create({ ...routingQnAs[i], subtopic: st4._id, topic: t4._id, order: i, createdBy: admin._id });
    }
    console.log('Topic 4 (Routing) done.');

    console.log('\n✅ Part 2 seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

seed();
