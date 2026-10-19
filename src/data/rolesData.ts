import { JobRole } from '../types';

export const JOB_ROLES: JobRole[] = [
  {
    id: 'backend_developer',
    title: 'Backend Developer',
    category: 'Engineering',
    experienceLevel: 'Entry / SDE 1 (0-2 YOE)',
    description: 'Builds robust server-side APIs, microservices, database schemas, and background worker queues.',
    commonInterviewTopics: [
      'RESTful API Design & HTTP status codes',
      'Relational SQL (Joins, Indexing, Transactions)',
      'Asynchronous Programming & Concurrency',
      'Authentication (JWT, OAuth2) & Security',
      'System Design Basics (Caching with Redis, Load Balancing)'
    ],
    requiredSkills: [
      {
        id: 'rest_apis',
        name: 'RESTful API Architecture',
        category: 'framework',
        importance: 'critical',
        requiredLevel: 'intermediate',
        description: 'Building stateless HTTP APIs, payload validation, status codes, route design.',
        interviewWeight: 90
      },
      {
        id: 'sql_databases',
        name: 'SQL & Relational Databases',
        category: 'database',
        importance: 'critical',
        requiredLevel: 'intermediate',
        description: 'Writing complex queries, foreign keys, indexing strategies, handling N+1 queries.',
        interviewWeight: 95
      },
      {
        id: 'server_language',
        name: 'Core Server Language (Node/Python/Java/Go)',
        category: 'core_language',
        importance: 'critical',
        requiredLevel: 'intermediate',
        description: 'Idiomatic asynchronous code, data structures, error handling, package management.',
        interviewWeight: 90
      },
      {
        id: 'system_design_basics',
        name: 'System Design Basics & Caching',
        category: 'system_design',
        importance: 'important',
        requiredLevel: 'beginner',
        description: 'Redis caching strategies, connection pooling, rate limiting, horizontal scaling.',
        interviewWeight: 75
      },
      {
        id: 'authentication_security',
        name: 'Auth & API Security',
        category: 'tools',
        importance: 'important',
        requiredLevel: 'intermediate',
        description: 'JWT signing, password hashing (bcrypt), CORS, SQL injection prevention.',
        interviewWeight: 80
      },
      {
        id: 'dsa_problem_solving',
        name: 'Data Structures & Algorithms',
        category: 'algorithms',
        importance: 'important',
        requiredLevel: 'intermediate',
        description: 'Hash maps, trees, graph traversals, O(N log N) sorting, time/space trade-offs.',
        interviewWeight: 85
      },
      {
        id: 'docker_containers',
        name: 'Docker & Containerization',
        category: 'tools',
        importance: 'nice_to_have',
        requiredLevel: 'beginner',
        description: 'Writing multi-stage Dockerfiles, docker-compose for local services.',
        interviewWeight: 60
      }
    ]
  },
  {
    id: 'frontend_developer',
    title: 'Frontend Developer',
    category: 'Engineering',
    experienceLevel: 'Entry / Frontend Engineer 1',
    description: 'Designs reactive, accessible, high-performance web user interfaces with modern frameworks.',
    commonInterviewTopics: [
      'DOM Manipulation & Event Loop',
      'React Hooks, State & Context management',
      'TypeScript typing & interface patterns',
      'Web Performance (Core Web Vitals, Debounce/Throttle)',
      'Responsive CSS & Flexbox/Grid layouts'
    ],
    requiredSkills: [
      {
        id: 'react_ecosystem',
        name: 'React & Component Architecture',
        category: 'framework',
        importance: 'critical',
        requiredLevel: 'intermediate',
        description: 'Custom hooks, lifecycle, memoization, synthetic events, error boundaries.',
        interviewWeight: 95
      },
      {
        id: 'javascript_typescript',
        name: 'Modern JavaScript (ES6+) & TypeScript',
        category: 'core_language',
        importance: 'critical',
        requiredLevel: 'intermediate',
        description: 'Promises/async-await, closures, prototypes, strict typing, generics.',
        interviewWeight: 95
      },
      {
        id: 'state_management',
        name: 'Client State Management',
        category: 'framework',
        importance: 'important',
        requiredLevel: 'intermediate',
        description: 'Redux Toolkit, Zustand, or React Query / Server State caching.',
        interviewWeight: 80
      },
      {
        id: 'css_modern',
        name: 'Modern CSS, Tailwind & Responsive Design',
        category: 'tools',
        importance: 'critical',
        requiredLevel: 'intermediate',
        description: 'Grid, Flexbox, media queries, mobile-first design, animations.',
        interviewWeight: 85
      },
      {
        id: 'api_integration',
        name: 'HTTP / REST Client & Data Fetching',
        category: 'tools',
        importance: 'important',
        requiredLevel: 'intermediate',
        description: 'Fetch/Axios, error states, optimistic updates, request cancellation.',
        interviewWeight: 75
      },
      {
        id: 'web_performance',
        name: 'Web Performance & Accessibility (a11y)',
        category: 'system_design',
        importance: 'nice_to_have',
        requiredLevel: 'beginner',
        description: 'Lighthouse scoring, code splitting, lazy loading, ARIA labels.',
        interviewWeight: 65
      }
    ]
  },
  {
    id: 'fullstack_developer',
    title: 'Full Stack Developer',
    category: 'Engineering',
    experienceLevel: 'Entry / Full Stack Engineer',
    description: 'Connects modern frontend interfaces with resilient backend APIs and relational databases.',
    commonInterviewTopics: [
      'End-to-End Feature Delivery',
      'Client-Server Contract & Schema Validation',
      'Relational Database Modeling',
      'State Management & UI Hydration',
      'Git Workflow & Deployment pipelines'
    ],
    requiredSkills: [
      {
        id: 'core_frontend',
        name: 'Frontend Framework (React/Next.js)',
        category: 'framework',
        importance: 'critical',
        requiredLevel: 'intermediate',
        description: 'Building interactive SPAs with reactive state.',
        interviewWeight: 90
      },
      {
        id: 'core_backend',
        name: 'Server Framework (Express/Nest/FastAPI)',
        category: 'framework',
        importance: 'critical',
        requiredLevel: 'intermediate',
        description: 'Routing, middleware, request lifecycle, controller patterns.',
        interviewWeight: 90
      },
      {
        id: 'sql_orm',
        name: 'Database (SQL/PostgreSQL) & ORM',
        category: 'database',
        importance: 'critical',
        requiredLevel: 'intermediate',
        description: 'Schema migrations, associations, querying, indexing.',
        interviewWeight: 85
      },
      {
        id: 'auth_flow',
        name: 'Full Stack Authentication & Sessions',
        category: 'tools',
        importance: 'important',
        requiredLevel: 'intermediate',
        description: 'HTTP-only cookies, JWT verification middleware, role-based access.',
        interviewWeight: 80
      },
      {
        id: 'git_devops',
        name: 'Version Control & CI/CD Basics',
        category: 'tools',
        importance: 'nice_to_have',
        requiredLevel: 'beginner',
        description: 'Git branching, GitHub actions, deployment to cloud platforms.',
        interviewWeight: 65
      }
    ]
  },
  {
    id: 'data_scientist',
    title: 'Data Scientist / Machine Learning Engineer',
    category: 'Data & AI',
    experienceLevel: 'Junior / Associate Data Scientist',
    description: 'Analyzes structured/unstructured datasets, builds predictive models, and delivers data pipelines.',
    commonInterviewTopics: [
      'Data Wrangling with Pandas & NumPy',
      'Feature Engineering & Normalization',
      'Supervised vs Unsupervised ML algorithms',
      'Model Evaluation (ROC-AUC, F1, Overfitting)',
      'SQL for Data Analytics'
    ],
    requiredSkills: [
      {
        id: 'python_data_stack',
        name: 'Python Data Stack (Pandas, NumPy)',
        category: 'core_language',
        importance: 'critical',
        requiredLevel: 'intermediate',
        description: 'Vectorized operations, data aggregation, imputation, merging.',
        interviewWeight: 95
      },
      {
        id: 'ml_scikit_learn',
        name: 'Machine Learning (Scikit-Learn)',
        category: 'framework',
        importance: 'critical',
        requiredLevel: 'intermediate',
        description: 'Regression, Decision Trees, Random Forests, cross-validation, hyperparameter tuning.',
        interviewWeight: 90
      },
      {
        id: 'sql_analytics',
        name: 'SQL for Analytics & Window Functions',
        category: 'database',
        importance: 'critical',
        requiredLevel: 'intermediate',
        description: 'GROUP BY, window functions (ROW_NUMBER, RANK), CTEs, cohort analysis.',
        interviewWeight: 90
      },
      {
        id: 'stats_probability',
        name: 'Applied Statistics & Hypothesis Testing',
        category: 'algorithms',
        importance: 'important',
        requiredLevel: 'intermediate',
        description: 'Distributions, p-values, A/B testing, confidence intervals.',
        interviewWeight: 80
      },
      {
        id: 'model_deployment',
        name: 'Model Serving & FastAPI Basics',
        category: 'tools',
        importance: 'nice_to_have',
        requiredLevel: 'beginner',
        description: 'Pickling/saving models, exposing inference endpoints via API.',
        interviewWeight: 65
      }
    ]
  },
  {
    id: 'sde_general',
    title: 'Software Development Engineer 1 (DSA / Problem Solving)',
    category: 'Core Software',
    experienceLevel: 'Campus Placement / Fresher',
    description: 'Focuses on strong fundamental problem solving, clean code, data structures, and computer science basics.',
    commonInterviewTopics: [
      'Array manipulation & Two Pointers',
      'Binary Search & Sorting',
      'Dynamic Programming & Recursion',
      'Trees, Graphs, BFS/DFS',
      'Object Oriented Programming & SOLID'
    ],
    requiredSkills: [
      {
        id: 'dsa_core',
        name: 'Advanced Data Structures & Algorithms',
        category: 'algorithms',
        importance: 'critical',
        requiredLevel: 'intermediate',
        description: 'Trees, Graphs, Dynamic Programming, Heaps, Two Pointers, Sliding Window.',
        interviewWeight: 100
      },
      {
        id: 'oop_principles',
        name: 'OOP & Clean Code Principles',
        category: 'core_language',
        importance: 'critical',
        requiredLevel: 'intermediate',
        description: 'Encapsulation, Polymorphism, Inheritance, Interfaces, SOLID.',
        interviewWeight: 85
      },
      {
        id: 'dbms_os_fundamentals',
        name: 'DBMS & OS Fundamentals',
        category: 'system_design',
        importance: 'important',
        requiredLevel: 'intermediate',
        description: 'ACID properties, Deadlocks, Process vs Threads, Virtual Memory, Paging.',
        interviewWeight: 85
      },
      {
        id: 'problem_solving_fluency',
        name: 'Coding Speed & Edge Case Handling',
        category: 'algorithms',
        importance: 'critical',
        requiredLevel: 'intermediate',
        description: 'Handling null inputs, integer overflow, boundary constraints, optimal space.',
        interviewWeight: 90
      }
    ]
  }
];

export interface SampleResumeProfile {
  id: string;
  name: string;
  targetRoleId: string;
  label: string;
  summary: string;
  resumeText: string;
}

export const SAMPLE_RESUMES: SampleResumeProfile[] = [
  {
    id: 'sample_alex_backend',
    name: 'Alex Chen',
    targetRoleId: 'backend_developer',
    label: 'Alex Chen - 3rd Year CS Student (Needs SQL, Redis & API Security)',
    summary: 'Strong in Python and basic Flask, has built a basic Todo app and calculator. Lacks deep relational SQL, indexing, Redis caching, and JWT auth.',
    resumeText: `ALEX CHEN
San Francisco, CA • alex.chen.dev@example.com • github.com/alexchen
Bachelor of Science in Computer Science, State University (Expected Grad: 2026)

SUMMARY:
Passionate 3rd-year CS student focusing on software development. Good understanding of Python, C++, and basic web protocols. Looking for a Backend Developer internship or entry-level role.

TECHNICAL SKILLS:
- Languages: Python, C++, HTML, CSS, JavaScript (basic)
- Frameworks: Flask (beginner), Tkinter
- Tools: Git, VS Code, Linux bash basics
- Concepts: Object-Oriented Programming, Basic Algorithms, HTTP GET/POST

PROJECTS:
1. Student Grade Tracker (Python & SQLite)
   - Created a CLI tool for managing student records using basic SQLite queries.
   - Implemented simple CRUD operations with text-based menu.
2. Personal Portfolio Website
   - Built a responsive portfolio using HTML5 and CSS3.
   - Hosted on GitHub Pages.
3. Pathfinding Visualizer (C++)
   - Implemented Dijkstra's algorithm and BFS in C++ with SFML graphics.`
  },
  {
    id: 'sample_priya_fullstack',
    name: 'Priya Sharma',
    targetRoleId: 'fullstack_developer',
    label: 'Priya Sharma - Frontend Enthusiast (Needs Backend ORM & Auth)',
    summary: 'Great React and Tailwind CSS skills, built multiple UI projects. Has not worked with relational database schemas, complex SQL, or JWT token refresh workflows.',
    resumeText: `PRIYA SHARMA
Bengaluru, India • priya.sharma@example.com • linkedin.com/in/priyasharma
B.Tech in Information Technology, 2025

TECHNICAL SKILLS:
- Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3, basic Python
- Frontend: React.js, Tailwind CSS, Redux Toolkit, Next.js (starter)
- Backend: Node.js (basic HTTP), Express (basic routes)
- Databases: MongoDB (basic CRUD)
- Tools: Git, Postman, Vite, Figma

PROJECTS:
1. E-Commerce UI Marketplace
   - Built an interactive product catalog with React, Tailwind, and React Router.
   - Implemented client-side shopping cart with localStorage.
2. TaskBoard Kanban Application
   - Created drag-and-drop board using react-beautiful-dnd.
   - Connected to mock REST API with Axios and TanStack Query.
3. Weather Dashboard
   - Fetched OpenWeatherMap API with async/await, geolocation lookup, and temperature chart.`
  },
  {
    id: 'sample_marcus_data',
    name: 'Marcus Rivera',
    targetRoleId: 'data_scientist',
    label: 'Marcus Rivera - Math Graduate (Needs Scikit-Learn & Advanced SQL)',
    summary: 'Strong mathematical foundation, knows NumPy and basic Pandas. Needs practical Scikit-Learn pipelines, SQL window functions, and ML evaluation metrics.',
    resumeText: `MARCUS RIVERA
Austin, TX • marcus.rivera@example.com
B.S. in Applied Mathematics & Statistics, 2024

SUMMARY:
Mathematics graduate with strong statistical modeling skills and computational mathematics background. Seeking Junior Data Scientist role.

TECHNICAL SKILLS:
- Languages: Python, R, basic SQL
- Libraries: NumPy, Pandas, Matplotlib, SciPy
- Stats: Hypothesis testing, Regression analysis, Probability distributions, Monte Carlo simulations
- Tools: Jupyter Notebooks, Excel, Git

PROJECTS:
1. Stock Price Volatility Modeling (Python)
   - Analyzed 5 years of historical S&P 500 equity data using Pandas and NumPy.
   - Calculated moving averages and rolling standard deviations.
2. Survey Statistical Analysis (R)
   - Conducted ANOVA and Chi-squared tests on 1,500 survey responses.`
  }
];
