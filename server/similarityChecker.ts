import { SimilarityResult } from '../src/types';

/**
 * Past submissions store (in-memory per session) to compare against other students
 */
interface PastSubmissionRecord {
  id: string;
  taskId: string;
  studentName: string;
  normalizedTokens: string;
  rawCode: string;
  submittedAt: string;
}

const pastSubmissionsStore: PastSubmissionRecord[] = [
  {
    id: 'seed_sub_1',
    taskId: 'task_sql_indexing',
    studentName: 'Student_Demo_Reference',
    normalizedTokens: 'KEYWORD(SELECT) ID(VAR) KEYWORD(FROM) ID(VAR) KEYWORD(WHERE) ID(VAR) > NUMBER KEYWORD(GROUP) KEYWORD(BY) ID(VAR) KEYWORD(HAVING) KEYWORD(COUNT) ( * ) > NUMBER',
    rawCode: `SELECT customer_id, COUNT(order_id) as total_orders
FROM orders
WHERE order_date >= '2024-01-01'
GROUP BY customer_id
HAVING COUNT(order_id) > 5
ORDER BY total_orders DESC;`,
    submittedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'seed_sub_2',
    taskId: 'task_rest_api_rate_limiter',
    studentName: 'StackOverflow_Canonical',
    normalizedTokens: 'KEYWORD(const) ID(VAR) = { } ; KEYWORD(function) ID(VAR) ( ID(VAR) , ID(VAR) , ID(VAR) ) { KEYWORD(const) ID(VAR) = ID(VAR) . ID(VAR) ; KEYWORD(const) ID(VAR) = ID(VAR) . ID(VAR) ( ) ; KEYWORD(if) ( ! ID(VAR) [ ID(VAR) ] ) { ID(VAR) [ ID(VAR) ] = [ ] ; } ID(VAR) [ ID(VAR) ] = ID(VAR) [ ID(VAR) ] . ID(VAR) ( ID(VAR) => ID(VAR) > ID(VAR) - ID(VAR) ) ; KEYWORD(if) ( ID(VAR) [ ID(VAR) ] . ID(VAR) >= ID(VAR) ) { KEYWORD(return) ID(VAR) . ID(VAR) ( NUMBER ) . ID(VAR) ( { ID(VAR) : STRING } ) ; } ID(VAR) [ ID(VAR) ] . ID(VAR) ( ID(VAR) ) ; ID(VAR) ( ) ; }',
    rawCode: `const rateLimitMap = {};
function slidingWindowRateLimiter(req, res, next) {
  const clientIp = req.ip;
  const now = Date.now();
  const windowMs = 60000;
  const limit = 100;

  if (!rateLimitMap[clientIp]) {
    rateLimitMap[clientIp] = [];
  }
  rateLimitMap[clientIp] = rateLimitMap[clientIp].filter(ts => ts > now - windowMs);
  if (rateLimitMap[clientIp].length >= limit) {
    return res.status(429).json({ error: "Too many requests" });
  }
  rateLimitMap[clientIp].push(now);
  next();
}`,
    submittedAt: new Date(Date.now() - 172800000).toISOString()
  }
];

/**
 * Tokenize and normalize code for structural comparison:
 * Strips comments, string literals, and maps identifiers to ID(VAR)
 * to detect variable renaming obfuscation.
 */
export function normalizeCodeStructure(code: string): string {
  if (!code) return '';

  // 1. Remove comments
  let stripped = code
    .replace(/\/\*[\s\S]*?\*\//g, ' ') // multi-line comments /* */
    .replace(/\/\/.*/g, ' ')           // single-line //
    .replace(/#.*/g, ' ')              // python single-line #
    .replace(/"""[\s\S]*?"""/g, ' ')   // python docstrings
    .replace(/'''[\s\S]*?'''/g, ' ');

  // 2. Normalize string literals
  stripped = stripped
    .replace(/"(?:[^"\\]|\\.)*"/g, ' STRING ')
    .replace(/'(?:[^'\\]|\\.)*'/g, ' STRING ')
    .replace(/`[\s\S]*?`/g, ' STRING ');

  // 3. Normalize numbers
  stripped = stripped.replace(/\b\d+(\.\d+)?\b/g, ' NUMBER ');

  // 4. Tokenize
  const keywords = new Set([
    'function', 'def', 'class', 'return', 'if', 'else', 'elif', 'for', 'while',
    'const', 'let', 'var', 'import', 'from', 'export', 'switch', 'case', 'break',
    'continue', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'yield',
    'new', 'this', 'typeof', 'instanceof', 'void', 'delete', 'in', 'of',
    'select', 'from', 'where', 'group', 'by', 'having', 'order', 'join', 'inner',
    'left', 'right', 'outer', 'on', 'insert', 'into', 'update', 'delete', 'create',
    'table', 'index', 'primary', 'key', 'foreign', 'references', 'null', 'not', 'and', 'or'
  ]);

  const rawTokens = stripped.match(/[a-zA-Z_$][a-zA-Z0-9_$]*|[^\s\w]/g) || [];
  const normalized: string[] = [];

  for (const token of rawTokens) {
    const lower = token.toLowerCase();
    if (keywords.has(lower)) {
      normalized.push(`KEYWORD(${lower})`);
    } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(token)) {
      // Identifier (variable, function name, parameter)
      normalized.push('ID(VAR)');
    } else {
      // Operator or punctuation
      normalized.push(token);
    }
  }

  return normalized.join(' ');
}

/**
 * Creates n-gram shingles from a token string
 */
function createShingles(tokensStr: string, n = 4): Set<string> {
  const tokens = tokensStr.split(' ').filter(Boolean);
  const shingles = new Set<string>();
  if (tokens.length < n) {
    shingles.add(tokens.join('_'));
    return shingles;
  }
  for (let i = 0; i <= tokens.length - n; i++) {
    shingles.add(tokens.slice(i, i + n).join('_'));
  }
  return shingles;
}

/**
 * Calculates Jaccard similarity between two shingle sets
 */
function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 1.0;
  if (setA.size === 0 || setB.size === 0) return 0.0;

  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) intersectionCount++;
  }

  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Approximate Levenshtein similarity on sample strings
 */
function calculateStringSimilarity(a: string, b: string): number {
  if (a === b) return 1.0;
  if (!a || !b) return 0.0;

  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;

  // For long tokens, compare sub-chunks to keep O(N) fast
  const sampleA = a.slice(0, 400);
  const sampleB = b.slice(0, 400);
  
  const d: number[][] = [];
  for (let i = 0; i <= sampleA.length; i++) {
    d[i] = [i];
  }
  for (let j = 0; j <= sampleB.length; j++) {
    d[0][j] = j;
  }
  for (let i = 1; i <= sampleA.length; i++) {
    for (let j = 1; j <= sampleB.length; j++) {
      const cost = sampleA[i - 1] === sampleB[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }

  const distance = d[sampleA.length][sampleB.length];
  const sampleMax = Math.max(sampleA.length, sampleB.length);
  return 1 - (distance / sampleMax);
}

/**
 * Checks a submitted code against reference solutions & past student submissions
 */
export function checkPlagiarism(
  taskId: string,
  submittedCode: string,
  referenceSolutions: string[] = [],
  studentName = 'Current Student'
): SimilarityResult {
  const normCurrent = normalizeCodeStructure(submittedCode);
  const currentShingles = createShingles(normCurrent, 4);

  let highestScore = 0;
  let matchedTarget = 'None (Unique logic pattern)';
  let highestStructuralScore = 0;

  // 1. Compare against reference solutions for this task
  referenceSolutions.forEach((refCode, idx) => {
    const normRef = normalizeCodeStructure(refCode);
    const refShingles = createShingles(normRef, 4);
    const jaccard = calculateJaccardSimilarity(currentShingles, refShingles);
    const lev = calculateStringSimilarity(normCurrent, normRef);
    const compositeScore = Math.round((jaccard * 0.7 + lev * 0.3) * 100);

    if (compositeScore > highestScore) {
      highestScore = compositeScore;
      highestStructuralScore = Math.round(jaccard * 100);
      matchedTarget = `Reference Benchmark Solution #${idx + 1}`;
    }
  });

  // 2. Compare against past student submissions store
  pastSubmissionsStore.forEach(pastSub => {
    if (pastSub.taskId === taskId) {
      const pastShingles = createShingles(pastSub.normalizedTokens, 4);
      const jaccard = calculateJaccardSimilarity(currentShingles, pastShingles);
      const lev = calculateStringSimilarity(normCurrent, pastSub.normalizedTokens);
      const compositeScore = Math.round((jaccard * 0.7 + lev * 0.3) * 100);

      if (compositeScore > highestScore) {
        highestScore = compositeScore;
        highestStructuralScore = Math.round(jaccard * 100);
        matchedTarget = `Submission by ${pastSub.studentName} (${new Date(pastSub.submittedAt).toLocaleDateString()})`;
      }
    }
  });

  // Determine verdict
  let verdict: SimilarityResult['verdict'] = 'clean';
  let flagged = false;
  let explanation = 'Code logic appears original with unique identifier patterns and distinct structural flow.';
  let isAiTemplate = false;

  if (highestScore >= 80) {
    verdict = 'plagiarized_flagged';
    flagged = true;
    explanation = `High AST/token structural match (${highestScore}%) against ${matchedTarget}. The control flow and token sequence closely mirror existing code despite possible variable renames or spacing changes.`;
  } else if (highestScore >= 55) {
    verdict = 'high_similarity';
    flagged = true;
    explanation = `Noticeable structural similarity (${highestScore}%) found with ${matchedTarget}. Common boilerplate or similar algorithm structure detected.`;
  } else if (highestScore >= 30) {
    verdict = 'moderate_similarity';
    explanation = `Standard idiomatic patterns detected (${highestScore}%). Common language conventions matched, but overall implementation shows personal structure.`;
  }

  // Detect ChatGPT / cookie-cutter template comments or structure
  if (
    submittedCode.includes('// Step 1:') ||
    submittedCode.includes('# Time Complexity: O(') ||
    submittedCode.includes('// Helper function to') ||
    submittedCode.includes('// TODO: implement')
  ) {
    isAiTemplate = true;
  }

  // Save this submission to store for subsequent checks
  pastSubmissionsStore.push({
    id: `sub_${Date.now()}`,
    taskId,
    studentName,
    normalizedTokens: normCurrent,
    rawCode: submittedCode,
    submittedAt: new Date().toISOString()
  });

  return {
    similarityScore: highestScore,
    flaggedAsPlagiarized: flagged,
    verdict,
    matchedAgainst: matchedTarget,
    structuralSimilarity: highestStructuralScore,
    tokenSimilarity: highestScore,
    aiExplanation: explanation,
    isLikelyAiGeneratedTemplate: isAiTemplate
  };
}

/**
 * Compare two arbitrary code snippets directly (used in the Modular Demo Lab)
 */
export function compareTwoCodeSnippets(codeA: string, codeB: string): {
  similarityScore: number;
  jaccardScore: number;
  normalizedA: string;
  normalizedB: string;
  verdict: string;
  details: string;
} {
  const normA = normalizeCodeStructure(codeA);
  const normB = normalizeCodeStructure(codeB);
  const shinglesA = createShingles(normA, 4);
  const shinglesB = createShingles(normB, 4);

  const jaccard = calculateJaccardSimilarity(shinglesA, shinglesB);
  const lev = calculateStringSimilarity(normA, normB);
  const composite = Math.round((jaccard * 0.7 + lev * 0.3) * 100);

  let verdict = 'Distinct Code';
  if (composite >= 80) verdict = 'Near-Identical Logic / Heavy Copy';
  else if (composite >= 50) verdict = 'High Structural Overlap';
  else if (composite >= 25) verdict = 'Moderate Standard Pattern';

  return {
    similarityScore: composite,
    jaccardScore: Math.round(jaccard * 100),
    normalizedA: normA.slice(0, 150) + (normA.length > 150 ? '...' : ''),
    normalizedB: normB.slice(0, 150) + (normB.length > 150 ? '...' : ''),
    verdict,
    details: `AST token comparison detected ${composite}% structural parity. Variables and formatting are normalized to eliminate simple renaming tricks.`
  };
}
