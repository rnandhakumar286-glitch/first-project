export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced';

export interface ExtractedSkill {
  name: string;
  category: 'language' | 'framework' | 'database' | 'tool' | 'concept';
  proficiency?: SkillProficiency;
  context?: string; // where found in resume
}

export interface ExtractedProject {
  title: string;
  technologies: string[];
  description: string;
}

export interface ExtractedResumeData {
  candidateName?: string;
  email?: string;
  phone?: string;
  summary?: string;
  education?: string[];
  skills: ExtractedSkill[];
  toolsAndPlatforms: string[];
  projects: ExtractedProject[];
  experienceSummary?: string;
  rawSkillCount: number;
}

export interface RoleSkillRequirement {
  id: string;
  name: string;
  category: 'core_language' | 'database' | 'system_design' | 'framework' | 'tools' | 'algorithms';
  importance: 'critical' | 'important' | 'nice_to_have';
  requiredLevel: SkillProficiency;
  description: string;
  interviewWeight: number; // 1-100
}

export interface JobRole {
  id: string;
  title: string;
  category: string;
  experienceLevel: string;
  description: string;
  commonInterviewTopics: string[];
  requiredSkills: RoleSkillRequirement[];
}

export type GapStatus = 'missing' | 'partial' | 'sufficient' | 'exceeds';
export type GapPriority = 'high' | 'medium' | 'low';

export interface SkillGap {
  skillId: string;
  skillName: string;
  category: string;
  importance: 'critical' | 'important' | 'nice_to_have';
  requiredLevel: SkillProficiency;
  currentLevel: SkillProficiency | 'none';
  status: GapStatus;
  priority: GapPriority;
  priorityRank: number;
  gapReason: string;
  recommendedFocus: string;
}

export interface GapAnalysisResult {
  roleId: string;
  roleTitle: string;
  overallReadinessScore: number; // 0 to 100
  totalRequirements: number;
  matchedCount: number;
  gapsCount: number;
  rankedGaps: SkillGap[];
  strengths: string[];
  analysisSummary: string;
}

export interface TestCase {
  id: string;
  inputDescription: string;
  expectedOutput: string;
  isEdgeCase?: boolean;
}

export interface PreparationTask {
  id: string;
  title: string;
  targetSkill: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'coding_challenge' | 'mini_project' | 'concept_practice' | 'system_design';
  estimatedMinutes: number;
  priorityOrder: number;
  description: string;
  problemStatement: string;
  constraints: string[];
  passFailCriteria: string[];
  testCases: TestCase[];
  starterCode: {
    language: string;
    code: string;
  };
  sampleSolutionSnippet?: string;
  referenceSolutions?: string[]; // for similarity checks
  hints: string[];
}

export interface ExternalSubmission {
  taskId: string;
  submissionUrl?: string;
  submittedCode?: string;
  codeLanguage?: string;
  studentNotes?: string;
}

export interface TestCaseResult {
  testCaseId: string;
  inputDescription: string;
  expectedOutput: string;
  actualOutputOrStatus: string;
  passed: boolean;
  notes?: string;
}

export interface SimilarityResult {
  similarityScore: number; // 0 to 100%
  flaggedAsPlagiarized: boolean;
  verdict: 'clean' | 'moderate_similarity' | 'high_similarity' | 'plagiarized_flagged';
  matchedAgainst: string; // e.g. "Reference Solution #1" or "Past Student Submission #402"
  structuralSimilarity: number; // AST/Token shingle overlap
  tokenSimilarity: number;
  aiExplanation: string;
  isLikelyAiGeneratedTemplate: boolean;
}

export interface VerificationResult {
  submissionId: string;
  taskId: string;
  taskTitle: string;
  timestamp: string;
  sourceUrl?: string;
  fetchedCodeLength: number;
  codePreview: string;
  detectedLanguage: string;
  passed: boolean;
  correctnessScore: number; // 0 to 100
  testCaseResults: TestCaseResult[];
  passFailEvaluation: string;
  codeQualityRating: 'excellent' | 'good' | 'needs_work' | 'failing';
  complexityAnalysis: {
    timeComplexity?: string;
    spaceComplexity?: string;
    isOptimal: boolean;
  };
  feedback: {
    strengths: string[];
    improvements: string[];
    specificIssues: string[];
  };
  similarity: SimilarityResult;
}

export interface StudentProgress {
  studentName: string;
  targetRoleId: string;
  targetRoleTitle: string;
  readinessScore: number; // updated dynamically
  totalTasksAssigned: number;
  completedTasks: number;
  failedTasks: number;
  skillsMastery: Record<string, number>; // skillName -> percentage 0-100
  history: {
    taskId: string;
    taskTitle: string;
    verifiedAt: string;
    passed: boolean;
    score: number;
    similarityFlag: boolean;
  }[];
  currentRecommendedTaskId?: string;
}
