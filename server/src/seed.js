const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('./models/User');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');
const Subtopic = require('./models/Subtopic');
const QuestionAnswer = require('./models/QuestionAnswer');

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected successfully!');

    // 1. Clear existing seed data to prevent duplicates
    console.log('Cleaning existing seed data...');
    await User.deleteMany({ email: { $in: ['ganeshbobadeda@gmail.com', 'ganeshmaster@gmail.com'] } });
    await Subject.deleteMany({ name: { $in: ['JavaScript', 'Node'] } });

    // 2. Create Master Admin
    console.log('Creating master admin...');
    const masterAdmin = new User({
      username: 'ganeshmaster',
      email: 'ganeshmaster@gmail.com',
      password: 'Ganesh@tech',
      role: 'masterAdmin',
      permissions: ['read', 'create', 'update', 'delete'],
    });
    await masterAdmin.save();
    console.log(`Master Admin created: ${masterAdmin.email}`);

    // 3. Create Regular Seed User (read-only by default)
    console.log('Creating seed user...');
    const user = new User({
      username: 'ganeshbobadeda',
      email: 'ganeshbobadeda@gmail.com',
      password: 'ganesh@tech',
      role: 'user',
      permissions: ['read'],
    });
    await user.save();
    console.log(`User created: ${user.email}`);

    // 4. Create Subjects (owned by masterAdmin)
    console.log('Creating subjects...');
    const jsSubject = new Subject({
      name: 'JavaScript',
      description: 'Core concepts, syntax, scope, asynchronous patterns, and advanced ES6+ features.',
      isPublic: true,
      createdBy: masterAdmin._id,
    });
    await jsSubject.save();

    const nodeSubject = new Subject({
      name: 'Node',
      description: 'Server-side javascript runtime environments, event loop mechanics, file systems, and API frameworks.',
      isPublic: true,
      createdBy: masterAdmin._id,
    });
    await nodeSubject.save();

    console.log('Subjects seeded successfully!');

    // 4. Create Topics for JavaScript
    console.log('Creating JavaScript topics...');
    const jsTopic1 = new Topic({
      title: 'Scope and Closures',
      description: 'Lexical scopes, block scopes, dynamic binding, and functional closures.',
      content: `# Scope & Closures in JavaScript

Scope determines the visibility and accessibility of variables in different parts of your code.

## 1. Lexical Scope
JavaScript uses **Lexical Scope**, meaning that variable scope is determined by the position of the variables and blocks of code during compile time.

\`\`\`javascript
function outer() {
  const outerVar = 'I am outer';
  function inner() {
    console.log(outerVar); // Has access to outerVar due to lexical scope chain
  }
  inner();
}
outer();
\`\`\`

## 2. Closures
A closure is the combination of a function bundled together (enclosed) with references to its surrounding state (the **lexical environment**). 
In other words, a closure gives an inner function access to the outer function's scope even after the outer function has returned.

\`\`\`javascript
function createCounter() {
  let count = 0;
  return function() {
    count++;
    return count;
  };
}
const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
\`\`\`
`,
      subject: jsSubject._id,
      order: 0,
      createdBy: masterAdmin._id,
    });
    await jsTopic1.save();

    const jsTopic2 = new Topic({
      title: 'Asynchronous JS',
      description: 'Event Loop, Promises, Callback Queue, and Async/Await rules.',
      content: `# Asynchronous JavaScript

JavaScript is single-threaded, but it achieves concurrency using non-blocking event-driven mechanics.

## The Event Loop
The **Event Loop** constantly monitors the Call Stack and the Callback Queue. If the Call Stack is empty, it pushes the first task from the queue onto the stack.

## Promises and Async/Await
Promises represent the eventual completion (or failure) of an asynchronous operation.

\`\`\`javascript
const fetchData = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve('Data fetched!'), 1000);
  });
};

async function run() {
  const result = await fetchData();
  console.log(result);
}
run();
\`\`\`
`,
      subject: jsSubject._id,
      order: 1,
      createdBy: masterAdmin._id,
    });
    await jsTopic2.save();

    // 5. Create Subtopics for JavaScript (Scope & Closures)
    console.log('Creating JavaScript subtopics...');
    const jsSubtopic1 = new Subtopic({
      title: 'Lexical Scope Mechanics',
      content: `# Lexical Scope Mechanics

Lexical scoping means that the nested inner functions have access to variables declared in their outer scope.

### Key Rules
- Scope lookup starts at the innermost scope and bubbles up.
- Lookup stops at the first matching identifier found.
- Global scope is the final fallback.
`,
      topic: jsTopic1._id,
      order: 0,
      createdBy: masterAdmin._id,
    });
    await jsSubtopic1.save();

    const jsSubtopic2 = new Subtopic({
      title: 'Practical Closures',
      content: `# Practical Closures

Closures are extremely useful in real-world JavaScript engineering.

### Common Use Cases
1. **Data Privacy / Encapsulation**: Restricting direct access to module variables.
2. **State Preservation**: Maintaining state in event callbacks or timer loops.
3. **Currying & Partial Application**: Pre-configuring functions.
`,
      topic: jsTopic1._id,
      order: 1,
      createdBy: masterAdmin._id,
    });
    await jsSubtopic2.save();

    // 6. Create Q&As for JavaScript Subtopic
    console.log('Creating JavaScript Q&As...');
    const jsQa1 = new QuestionAnswer({
      question: 'What is a closure in JavaScript?',
      answer: `A **closure** is a function that retains access to its outer lexical scope (variables) even after the outer function has finished executing. 

### Code Example:
\`\`\`javascript
function outer() {
  const message = 'Hello';
  return () => console.log(message);
}
const inner = outer();
inner(); // Prints 'Hello'
\`\`\`
`,
      subtopic: jsSubtopic1._id,
      topic: jsTopic1._id,
      tags: ['closure', 'scope', 'interview'],
      order: 0,
      createdBy: masterAdmin._id,
    });
    await jsQa1.save();

    const jsQa2 = new QuestionAnswer({
      question: 'Explain Lexical Scope vs Dynamic Scope.',
      answer: `- **Lexical Scope**: The scope is set at compile-time (based on physical nesting in code). JavaScript uses lexical scope.
- **Dynamic Scope**: The scope is set at runtime (based on the call stack chain). JavaScript does **NOT** use dynamic scope.
`,
      subtopic: jsSubtopic1._id,
      topic: jsTopic1._id,
      tags: ['scope', 'basics'],
      order: 1,
      createdBy: masterAdmin._id,
    });
    await jsQa2.save();

    // 7. Create Topics for Node
    console.log('Creating Node topics...');
    const nodeTopic1 = new Topic({
      title: 'Node.js Architecture',
      description: 'Understanding Libuv, threads, V8, and non-blocking I/O.',
      content: `# Node.js System Architecture

Node.js is built on the Google V8 engine and uses the Libuv library to orchestrate async behaviors.

## Libuv Threadpool
While JS is single-threaded, **Libuv** manages a thread pool (4 threads by default) for handling heavy OS-level operations like cryptography, hashing, and file I/O operations.
`,
      subject: nodeSubject._id,
      order: 0,
      createdBy: masterAdmin._id,
    });
    await nodeTopic1.save();

    // 8. Create Subtopics for Node
    console.log('Creating Node subtopics...');
    const nodeSubtopic1 = new Subtopic({
      title: 'The Libuv Library',
      content: `# Libuv in Node.js

Libuv is a multi-platform C library that provides support for asynchronous I/O based on event loops.

### Capabilities:
- Full event loop backed by epoll, kqueue, event ports, and IOCP.
- File system read/write operations.
- Threadpool manager.
`,
      topic: nodeTopic1._id,
      order: 0,
      createdBy: masterAdmin._id,
    });
    await nodeSubtopic1.save();

    // 9. Create Q&As for Node
    console.log('Creating Node Q&As...');
    const nodeQa1 = new QuestionAnswer({
      question: 'Is Node.js completely single-threaded?',
      answer: `**No.** While the JavaScript execution thread (the main thread) is single-threaded, underlying C++ operations handled by Libuv run inside a multi-threaded pool (default size: 4).
`,
      subtopic: nodeSubtopic1._id,
      topic: nodeTopic1._id,
      tags: ['libuv', 'threading', 'architecture'],
      order: 0,
      createdBy: masterAdmin._id,
    });
    await nodeQa1.save();

    console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
