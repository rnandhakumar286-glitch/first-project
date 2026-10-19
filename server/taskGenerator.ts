import { ai } from './geminiClient';
import { SkillGap, PreparationTask } from '../src/types';

export async function generateTasksForGaps(
  gaps: SkillGap[],
  candidateBackground = 'Computer Science Student',
  roleTitle = 'Software Engineer'
): Promise<PreparationTask[]> {
  // Take top 3-5 gaps to keep student focused
  const targetedGaps = gaps.slice(0, 4);

  // Attempt AI task generation tailored to candidate's background
  try {
    const prompt = `You are a Technical Placement Interview Lead.
A student is preparing for the target role: "${roleTitle}".
Their background is: "${candidateBackground}".

We have identified the following priority skill gaps in their profile:
${JSON.stringify(targetedGaps, null, 2)}

For EACH of these skill gaps, generate ONE high-impact, actionable, practical coding or implementation task with explicit pass/fail criteria.
The student will solve this on an external online IDE (like OnlineGDB, LeetCode, or their local machine) and submit their code URL.

Requirements for each task:
1. "problemStatement": Detailed, unambiguous description of the requirement.
2. "constraints": 2-4 concrete technical constraints (e.g., O(N) time, handle empty inputs, use prepared statements).
3. "passFailCriteria": 3-4 clear rules to automatically evaluate success (e.g. "Returns 404 when user not found", "Handles duplicate keys without throwing unhandled exception").
4. "testCases": Array of 3 specific test cases (including 1 edge case) with "inputDescription" and "expectedOutput".
5. "starterCode": Provide starter code with language and boilerplate signature.
6. "sampleSolutionSnippet": A canonical reference solution (used for similarity and grading comparison).
7. "hints": 2 actionable hints.

Return a valid JSON array of tasks matching this TypeScript interface:
[
  {
    "id": string,
    "title": string,
    "targetSkill": string,
    "difficulty": "easy" | "medium" | "hard",
    "category": "coding_challenge" | "mini_project" | "concept_practice" | "system_design",
    "estimatedMinutes": number,
    "priorityOrder": number,
    "description": string,
    "problemStatement": string,
    "constraints": string[],
    "passFailCriteria": string[],
    "testCases": [
      {
        "id": string,
        "inputDescription": string,
        "expectedOutput": string,
        "isEdgeCase": boolean
      }
    ],
    "starterCode": {
      "language": string,
      "code": string
    },
    "sampleSolutionSnippet": string,
    "hints": string[]
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed: PreparationTask[] = JSON.parse(response.text || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((task, idx) => ({
        ...task,
        id: task.id || `task_${Date.now()}_${idx}`,
        priorityOrder: idx + 1,
        referenceSolutions: task.sampleSolutionSnippet ? [task.sampleSolutionSnippet] : []
      }));
    }
  } catch (err) {
    console.error('AI task generation failed, falling back to curated library:', err);
  }

  // Curated Fallback Tasks for standard gaps
  return getCuratedTasksForGaps(targetedGaps);
}

export function getCuratedTasksForGaps(gaps: SkillGap[]): PreparationTask[] {
  return gaps.map((gap, index) => {
    const skillLower = gap.skillName.toLowerCase();

    if (skillLower.includes('sql') || skillLower.includes('database')) {
      return {
        id: `task_sql_${Date.now()}_${index}`,
        title: 'High-Volume Customer Cohort & Order Aggregation Query',
        targetSkill: gap.skillName,
        difficulty: 'medium',
        category: 'coding_challenge',
        estimatedMinutes: 35,
        priorityOrder: index + 1,
        description: 'Master analytical SQL aggregations, window functions, and indexing considerations for placement rounds.',
        problemStatement: 'Given a relational schema with `customers(id, name, created_at)` and `orders(id, customer_id, amount, status, order_date)`, write an optimized SQL query to find all active customers who placed more than 3 successful orders in the past 90 days, returning their total spend and average order value sorted by total spend descending.',
        constraints: [
          'Filter out orders where status != "COMPLETED"',
          'Use proper GROUP BY and HAVING clauses',
          'Ensure query is index-friendly (avoid functions on indexed date column)'
        ],
        passFailCriteria: [
          'Correctly aggregates orders with status = "COMPLETED"',
          'Includes only customers having strictly > 3 orders',
          'Computes total_spend and avg_order_value correctly rounded to 2 decimal places',
          'Outputs result sorted by total_spend DESC'
        ],
        testCases: [
          {
            id: 'tc_1',
            inputDescription: 'Customer with 4 completed orders of $50 each in past 30 days',
            expectedOutput: 'total_spend: 200.00, avg_order_value: 50.00'
          },
          {
            id: 'tc_2',
            inputDescription: 'Customer with 5 orders but 3 are "CANCELLED"',
            expectedOutput: 'Excluded from results (only 2 completed orders, below threshold 3)',
            isEdgeCase: true
          },
          {
            id: 'tc_3',
            inputDescription: 'Two customers with equal total spend',
            expectedOutput: 'Preserves secondary ordering by customer_id ASC'
          }
        ],
        starterCode: {
          language: 'sql',
          code: `-- Placement Preparation Task: Optimized Customer Aggregation
-- Target: SQL & Relational Databases

SELECT 
    c.id AS customer_id,
    c.name,
    COUNT(o.id) AS total_completed_orders,
    ROUND(SUM(o.amount), 2) AS total_spend,
    ROUND(AVG(o.amount), 2) AS avg_order_value
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.status = 'COMPLETED'
  -- ADD DATE FILTER AND GROUPING HERE
GROUP BY c.id, c.name
-- ADD HAVING AND ORDER BY HERE
;`
        },
        sampleSolutionSnippet: `SELECT 
    c.id AS customer_id,
    c.name,
    COUNT(o.id) AS total_completed_orders,
    ROUND(SUM(o.amount), 2) AS total_spend,
    ROUND(AVG(o.amount), 2) AS avg_order_value
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id
WHERE o.status = 'COMPLETED'
  AND o.order_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY c.id, c.name
HAVING COUNT(o.id) > 3
ORDER BY total_spend DESC, c.id ASC;`,
        hints: [
          'Use HAVING COUNT(o.id) > 3 after the GROUP BY clause.',
          'Double check that cancelled orders are filtered in the WHERE clause, not after grouping.'
        ]
      };
    }

    if (skillLower.includes('api') || skillLower.includes('rest') || skillLower.includes('server')) {
      return {
        id: `task_api_${Date.now()}_${index}`,
        title: 'In-Memory Sliding Window Rate Limiter Middleware',
        targetSkill: gap.skillName,
        difficulty: 'medium',
        category: 'coding_challenge',
        estimatedMinutes: 45,
        priorityOrder: index + 1,
        description: 'Implement a classic backend interview problem: protecting REST API endpoints against abuse.',
        problemStatement: 'Implement a sliding-window rate limiter function or middleware in Python or Node.js. For any given client key (e.g. IP address or user ID), allow at most `MAX_REQUESTS` (e.g. 5) within a sliding `WINDOW_SECONDS` (e.g. 10s). Return HTTP 429 Too Many Requests if the limit is exceeded with a `Retry-After` header value.',
        constraints: [
          'Sliding window must be time-accurate (not fixed bucket reset)',
          'Memory efficiency: clean up expired timestamps to prevent memory leaks',
          'Handle concurrent requests safely'
        ],
        passFailCriteria: [
          'Allows exactly up to MAX_REQUESTS within the time window',
          'Rejects the (MAX_REQUESTS + 1)th request with 429 status',
          'Automatically allows new requests once earlier timestamps expire',
          'Calculates Retry-After correctly in seconds'
        ],
        testCases: [
          {
            id: 'tc_1',
            inputDescription: '5 requests fired within 2 seconds for client "user_1" (limit 5)',
            expectedOutput: 'All 5 requests return 200 OK / allowed'
          },
          {
            id: 'tc_2',
            inputDescription: '6th request fired at second 3 for client "user_1"',
            expectedOutput: 'Returns 429 Too Many Requests with Retry-After: 7',
            isEdgeCase: true
          },
          {
            id: 'tc_3',
            inputDescription: 'Request fired at second 11 after first request expires',
            expectedOutput: 'Allowed (window moved, count resets to 4)'
          }
        ],
        starterCode: {
          language: 'python',
          code: `import time
from collections import defaultdict, deque

class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int = 5, window_seconds: int = 10):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        # client_id -> deque of request timestamps
        self.requests = defaultdict(deque)

    def allow_request(self, client_id: str) -> dict:
        """
        Returns {'allowed': True} or {'allowed': False, 'retry_after': int}
        """
        current_time = time.time()
        # TODO: Evict timestamps older than (current_time - window_seconds)
        # TODO: Check if len(timestamps) < max_requests
        pass
`
        },
        sampleSolutionSnippet: `import time
from collections import defaultdict, deque

class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int = 5, window_seconds: int = 10):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(deque)

    def allow_request(self, client_id: str) -> dict:
        now = time.time()
        queue = self.requests[client_id]
        
        while queue and queue[0] <= now - self.window_seconds:
            queue.popleft()
            
        if len(queue) < self.max_requests:
            queue.append(now)
            return {'allowed': True, 'remaining': self.max_requests - len(queue)}
        else:
            oldest_in_window = queue[0]
            retry_after = int((oldest_in_window + self.window_seconds) - now) + 1
            return {'allowed': False, 'retry_after': max(1, retry_after)}`,
        hints: [
          'Use a deque for each client_id to store timestamps and popleft() old ones in O(1).',
          'Calculate Retry-After as the difference between the oldest timestamp plus window size and current time.'
        ]
      };
    }

    // Default Generic / DSA task for the skill
    return {
      id: `task_dsa_${Date.now()}_${index}`,
      title: `${gap.skillName} Practical Implementation & Edge-Case Benchmark`,
      targetSkill: gap.skillName,
      difficulty: 'medium',
      category: 'coding_challenge',
      estimatedMinutes: 40,
      priorityOrder: index + 1,
      description: `Solidify technical competence in ${gap.skillName} with robust input handling and optimal time complexity.`,
      problemStatement: `Implement an end-to-end component or algorithm demonstrating mastery of ${gap.skillName}. The solution must handle edge cases such as empty input structures, duplicate keys, boundary values, and achieve optimal asymptotic time complexity.`,
      constraints: [
        'Time complexity must not exceed O(N log N)',
        'Zero external heavy libraries; use core language primitives',
        'Handle null or empty collections gracefully'
      ],
      passFailCriteria: [
        'Produces correct output across all standard inputs',
        'Handles empty array/null inputs without unhandled exceptions',
        'Passes benchmark runtime within 100ms'
      ],
      testCases: [
        {
          id: 'tc_1',
          inputDescription: 'Standard valid input set with 10 elements',
          expectedOutput: 'Correctly processed result matching specification'
        },
        {
          id: 'tc_2',
          inputDescription: 'Empty input collection []',
          expectedOutput: 'Empty result [] or 0 without throwing error',
          isEdgeCase: true
        },
        {
          id: 'tc_3',
          inputDescription: 'Collection containing boundary values (negative numbers or large IDs)',
          expectedOutput: 'Appropriately sanitized and computed output'
        }
      ],
      starterCode: {
        language: 'python',
        code: `def solution(data):
    """
    Placement Preparation: ${gap.skillName}
    Write your implementation below.
    """
    if not data:
        return []
        
    # Implement core logic here
    return data
`
      },
      sampleSolutionSnippet: `def solution(data):
    if not data:
        return []
    seen = set()
    result = []
    for item in data:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result`,
      hints: [
        'Pay special attention to boundary conditions and type coercion.',
        'Consider using a hash set for O(1) lookups.'
      ]
    };
  });
}
