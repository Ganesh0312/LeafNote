# Full-Stack Note-Taking Application

This project is a comprehensive, full-stack note-taking web application designed to help users organize their knowledge hierarchically. It features a robust backend built with Node.js, Express, and MongoDB, providing role-based access control (RBAC), secure authentication, and RESTful APIs for managing Subjects, Topics, Subtopics, and Question & Answers (Q&A). The frontend is a modern, responsive React/Next.js application utilizing Tailwind CSS, featuring a best-in-class Markdown editor with live preview, syntax highlighting, and an interactive user interface. 

---

## Backend Requirements

### Database Schema (Mongoose)

Create Mongoose models for the note-taking application with the following schema:

**User Model:**
```javascript
{
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}
```

**Subject Model:**
```javascript
{
  name: { type: String, required: true },
  description: String,
  slug: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
}
```

**Topic Model:**
```javascript
{
  title: { type: String, required: true },
  slug: { type: String, required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  content: { type: String }, // Markdown content
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
}
```

**Subtopic Model:**
```javascript
{
  title: { type: String, required: true },
  slug: { type: String, required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  content: { type: String }, // Markdown content
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
}
```

**QuestionAnswer Model:**
```javascript
{
  question: { type: String, required: true },
  answer: { type: String, required: true }, // Markdown supported
  subtopic: { type: mongoose.Schema.Types.ObjectId, ref: 'Subtopic' },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  tags: [String],
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
}
```

**Requirements:**
- Add proper indexes for performance
- Add validation rules
- Add timestamps automatically
- Create TypeScript types for all models




Create Express API routes and controllers for the note-taking app:

**Authentication Routes (/api/auth):**
- POST /register - Create new user
- POST /login - User login, return JWT token
- GET /me - Get current user (protected route)

**Subject Routes (/api/subjects):**
- GET / - Get all public subjects
- GET /:slug - Get subject with all topics
- POST / - Create subject (protected)
- PUT /:id - Update subject (protected, owner only)
- DELETE /:id - Delete subject (protected, owner only)

**Topic Routes (/api/topics):**
- GET /subject/:subjectId - Get all topics for a subject
- GET /:id - Get single topic with subtopics
- POST / - Create topic (protected)
- PUT /:id - Update topic (protected)
- DELETE /:id - Delete topic (protected)

**Subtopic Routes (/api/subtopics):**
- GET /topic/:topicId - Get all subtopics for a topic
- GET /:id - Get single subtopic with Q&A
- POST / - Create subtopic (protected)
- PUT /:id - Update subtopic (protected)
- DELETE /:id - Delete subtopic (protected)

**QuestionAnswer Routes (/api/qna):**
- GET /subtopic/:subtopicId - Get all Q&A for subtopic
- GET /:id - Get single Q&A
- POST / - Create Q&A (protected)
- PUT /:id - Update Q&A (protected)
- DELETE /:id - Delete Q&A (protected)

**Requirements:**
- Implement JWT authentication middleware
- Add error handling
- Add input validation
- Return proper status codes
- Use async/await
- Add TypeScript types



Create authentication and security middleware for the Express backend:

**Requirements:**

1. **JWT Authentication Middleware:**
   - Create `verifyToken` middleware to protect routes
   - Extract token from Authorization header (Bearer token)
   - Verify token and attach user to request object
   - Return 401 if token is invalid or missing

2. **Password Hashing:**
   - Use bcrypt to hash passwords before saving
   - Compare passwords during login

3. **Token Generation:**
   - Create utility function to generate JWT token
   - Set appropriate expiration (7 days)
   - Include user ID and username in token payload

4. **Error Handling Middleware:**
   - Create global error handler
   - Handle common errors (404, 500, authentication errors)
   - Return consistent error format

5. **Input Validation:**
   - Validate email format
   - Validate password strength (min 8 chars)
   - Validate required fields

6. **Security:**
   - Add CORS configuration
   - Add helmet for security headers
   - Rate limiting on auth routes
   - Sanitize user input

Create all necessary middleware files and utilities.



Create authentication pages in Next.js with the following requirements:

**Pages to create:**

1. **Login Page (/login):**
   - Email and password input fields
   - "Remember me" checkbox
   - Submit button
   - Link to register page
   - Show error messages
   - Form validation (email format, required fields)

2. **Register Page (/register):**
   - Username, email, password input fields
   - Password confirmation field
   - Terms acceptance checkbox
   - Submit button
   - Link to login page
   - Client-side validation

**Requirements:**
- Use React Hook Form for form management
- Use Zod for schema validation
- Use Tailwind CSS for styling
- Show loading state during API call
- Show success/error toast notifications
- Store JWT token in HTTP-only cookie or localStorage
- Redirect to dashboard after successful login
- Create reusable FormInput component
- Create protected route wrapper component (for pages requiring auth)
- Create auth context to manage user state globally

**Components needed:**
- LoginForm
- RegisterForm
- AuthLayout
- ProtectedRoute
- AuthContext




Create topic and subtopic management pages:

**Pages:**

1. **Topic Detail Page (/subject/[subjectSlug]/topic/[topicSlug]):**
   - Show topic title and content (markdown rendered)
   - Show all subtopics in collapsible sections
   - "Add Subtopic" button (authenticated owner only)
   - Edit/Delete buttons (authenticated owner only)
   - Back to subject link
   - Table of contents sidebar (auto-generated from headings)

2. **Subtopic Detail Page (/subject/[subjectSlug]/topic/[topicSlug]/subtopic/[subtopicSlug]):**
   - Show subtopic title and content (markdown rendered)
   - Show all Q&A in accordion format
   - "Add Q&A" button (authenticated owner only)
   - Edit/Delete buttons (authenticated owner only)
   - Navigation between subtopics (next/previous)

3. **Create/Edit Topic Modal/Page:**
   - Title input
   - Content textarea (markdown editor)
   - Order number input
   - Submit button

4. **Create/Edit Subtopic Modal/Page:**
   - Title input
   - Content textarea (markdown editor)
   - Order number input
   - Submit button

**Components:**
- TopicView
- SubtopicView
- TopicEditor
- SubtopicEditor
- QnAList
- QnACard
- CreateTopicModal
- CreateSubtopicModal
- TableOfContents
- NavigationArrows

**Requirements:**
- Markdown rendering with syntax highlighting
- Auto-generate table of contents from headings
- Smooth scrolling to sections
- Responsive sidebar
- Loading states



Create a best-in-class Markdown Editor component with full formatting toolbar:

**Features Required:**

1. **Toolbar with buttons:**
   - Bold (Ctrl+B)
   - Italic (Ctrl+I)
   - Heading 1, 2, 3, 4, 5, 6
   - Bullet list
   - Numbered list
   - Code block
   - Inline code
   - Link
   - Image
   - Blockquote
   - Horizontal rule
   - Preview mode toggle

2. **Editor Requirements:**
   - Real-time preview (split view: editor | preview)
   - Syntax highlighting for code blocks (use Prism.js or Highlight.js)
   - Auto-indentation for code blocks
   - Keyboard shortcuts
   - Auto-save functionality
   - Character count
   - Word count

3. **Markdown Support:**
   - Headers (# H1, ## H2, etc.)
   - Bold (**text**)
   - Italic (*text*)
   - Lists (- item, 1. item)
   - Code blocks (```code```)
   - Inline code (`code`)
   - Links ([text](url))
   - Images (![alt](url))
   - Blockquotes (> quote)
   - Tables
   - Task lists
   - Strikethrough

4. **Libraries to use:**
   - react-markdown for rendering
   - remark-gfm for GitHub-flavored markdown
   - prismjs for syntax highlighting
   - react-textarea-autosize for auto-resizing

**Component Structure:**
```typescript
interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  showPreview?: boolean;
}
```

**Requirements:**
- Responsive design
- Mobile-friendly toolbar
- Dark/light mode support
- Accessible (ARIA labels)
- Custom styling with Tailwind CSS
- Show live preview in real-time



Create Question & Answer management features:

**Components:**

1. **QnACard Component:**
   - Display question in bold/heading
   - Display answer as rendered markdown
   - Expand/collapse answer (accordion)
   - Edit button (authenticated owner only)
   - Delete button (authenticated owner only)
   - Copy answer button
   - Tags display
   - Timestamp

2. **Create/Edit QnA Modal:**
   - Question textarea
   - Answer markdown editor (full-featured)
   - Tags input (comma-separated)
   - Order number input
   - Submit button
   - Form validation

3. **QnAList Component:**
   - List all Q&As for a subtopic
   - Search/filter Q&As
   - Sort by: newest, oldest, order
   - Infinite scroll for large lists
   - Loading skeleton

**Pages:**
- Add Q&A button on subtopic page
- Bulk import Q&A from CSV (optional feature)

**Requirements:**
- Markdown rendering in answers
- Syntax highlighting for code in answers
- Smooth animations for expand/collapse
- Confirmation dialog before delete
- Optimistic updates
- Error handling


Create public read-only view for notes (no authentication required):

**Pages:**

1. **Public Home (/):**
   - Hero section explaining the app
   - Browse all public subjects
   - Search functionality
   - Featured subjects
   - Call-to-action to login/register

2. **Public Subject View (/public/subject/[slug]):**
   - Same as subject detail but read-only
   - No edit/delete buttons
   - No "add topic" buttons
   - Show all topics and subtopics
   - Render all markdown content
   - Table of contents sidebar
   - Navigation between topics

3. **Public Topic/Subtopic View:**
   - Same as authenticated view but read-only
   - All content visible
   - No editing capabilities
   - Copy content button
   - Print button

**Requirements:**
- Clean, readable typography
- Mobile-responsive design
- Fast loading (optimize images)
- SEO-friendly (meta tags, Open Graph)
- Breadcrumb navigation
- Back to home button
- Loading states
- Error boundaries
- Cache public data with React Query



Create internal navigation and linking system for notes:

**Features:**

1. **Auto-generated Table of Contents:**
   - Parse markdown content for headings
   - Generate clickable TOC sidebar
   - Highlight current section in view
   - Smooth scroll to section
   - Collapsible TOC on mobile

2. **Internal Linking:**
   - Allow users to create links to other topics/subtopics
   - Auto-suggest topics when typing "[["
   - Render_internal links as clickable navigation
   - Breadcrumb navigation showing hierarchy
   - Example: Subject > Topic > Subtopic > Q&A

3. **Navigation Components:**
   - Sidebar navigation (subject → topics → subtopics)
   - Breadcrumb component
   - Next/Previous navigation arrows
   - Quick jump dropdown
   - Mobile hamburger menu

4. **URL Structure:**
   - /subject/:slug
   - /subject/:slug/topic/:topicSlug
   - /subject/:slug/topic/:topicSlug/subtopic/:subtopicSlug
   - Clean, readable URLs
   - Auto-generate slugs from titles

**Components:**
- TableOfContents
- Breadcrumb
- SidebarNavigation
- NavigationArrows
- QuickJumpDropdown
- InternalLink component

**Requirements:**
- Auto-scroll to active section
- Intersection Observer for highlighting
- Deep linking support
- Browser history navigation
- 404 handling for broken links



Add final UI polish, styling, and theme support:

**Requirements:**

1. **Theme System:**
   - Light and dark mode toggle
   - Persist theme preference in localStorage
   - System preference detection
   - Smooth theme transitions

2. **Tailwind Configuration:**
   - Custom color palette
   - Custom fonts (Inter for UI, Fira Code for code)
   - Custom animations
   - Responsive breakpoints
   - Custom utility classes

3. **Components Styling:**
   - Consistent button styles
   - Card designs with hover effects
   - Input field styles
   - Modal styling
   - Toast notifications
   - Loading skeletons
   - Error states

4. **Animations:**
   - Page transitions
   - Button hover effects
   - Modal open/close animations
   - Loading spinners
   - Accordion animations
   - Smooth scrolling

5. **Typography:**
   - Readable heading styles
   - Body text line height
   - Code block styling
   - List styling
   - Blockquote styling

**Files to create:**
- globals.css
- tailwind.config.js
- themes/light.ts
- themes/dark.ts
- components/ThemeProvider.tsx
- components/LoadingSkeleton.tsx
- components/Toast.tsx