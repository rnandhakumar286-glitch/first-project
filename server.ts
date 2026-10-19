import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { JOB_ROLES, SAMPLE_RESUMES } from './src/data/rolesData';
import { parseResume } from './server/resumeParser';
import { analyzeSkillGaps } from './server/gapAnalyzer';
import { generateTasksForGaps } from './server/taskGenerator';
import { fetchCodeFromUrl } from './server/codeFetcher';
import { evaluateCodeSubmission } from './server/evaluator';
import { compareTwoCodeSnippets } from './server/similarityChecker';
import { StudentProgress, PreparationTask } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON parser with high limit for PDF base64 payloads
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // API Endpoints

  // 1. Roles & Benchmark Requirements
  app.get('/api/roles', (_req, res) => {
    res.json({
      success: true,
      roles: JOB_ROLES,
      sampleResumes: SAMPLE_RESUMES,
    });
  });

  // 2. Parse Resume (PDF base64 or Text)
  app.post('/api/parse-resume', async (req, res) => {
    try {
      const { resumeText, pdfBase64 } = req.body;
      if (!resumeText && !pdfBase64) {
        return res.status(400).json({ error: 'Please provide either resumeText or pdfBase64' });
      }
      const extracted = await parseResume({ resumeText, pdfBase64 });
      res.json({ success: true, extracted });
    } catch (err: any) {
      console.error('Error in /api/parse-resume:', err);
      res.status(500).json({ error: err.message || 'Failed to parse resume' });
    }
  });

  // 3. Gap Analysis
  app.post('/api/gap-analysis', (req, res) => {
    try {
      const { extractedData, roleId, extraSkills, roles: clientRoles } = req.body;
      if (!extractedData || !roleId) {
        return res.status(400).json({ error: 'extractedData and roleId are required' });
      }
      const analysis = analyzeSkillGaps(extractedData, roleId, extraSkills || [], clientRoles);
      res.json({ success: true, analysis });
    } catch (err: any) {
      console.error('Error in /api/gap-analysis:', err);
      res.status(500).json({ error: err.message || 'Failed to analyze skill gaps' });
    }
  });

  // 4. Task Generation
  app.post('/api/generate-tasks', async (req, res) => {
    try {
      const { gaps, candidateBackground, roleTitle } = req.body;
      if (!gaps || !Array.isArray(gaps)) {
        return res.status(400).json({ error: 'gaps array is required' });
      }
      const tasks = await generateTasksForGaps(gaps, candidateBackground, roleTitle);
      res.json({ success: true, tasks });
    } catch (err: any) {
      console.error('Error in /api/generate-tasks:', err);
      res.status(500).json({ error: err.message || 'Failed to generate tasks' });
    }
  });

  // 5. Code Fetcher from URL
  app.post('/api/fetch-code', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'url is required' });
      }
      const result = await fetchCodeFromUrl(url);
      res.json(result);
    } catch (err: any) {
      console.error('Error in /api/fetch-code:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch code from URL' });
    }
  });

  // 6. Verification Pipeline (Fetch + Correctness Check + Similarity Check + Progress Update)
  app.post('/api/verify-submission', async (req, res) => {
    try {
      const { task, submissionUrl, submittedCode, studentName, currentProgress } = req.body;
      
      if (!task || !task.id) {
        return res.status(400).json({ error: 'task details are required' });
      }

      let codeToEvaluate = (submittedCode || '').trim();
      let sourceUrl = submissionUrl;

      // If URL was provided, attempt to fetch code from external site
      if (submissionUrl && !codeToEvaluate) {
        const fetchResult = await fetchCodeFromUrl(submissionUrl);
        if (!fetchResult.success || !fetchResult.code) {
          return res.status(400).json({
            error: `Could not fetch code from URL: ${fetchResult.error || 'Empty response'}. You can also paste the solution code directly.`
          });
        }
        codeToEvaluate = fetchResult.code;
      }

      if (!codeToEvaluate) {
        return res.status(400).json({ error: 'No code found to evaluate. Please provide a valid URL or paste your code.' });
      }

      // Run evaluation
      const verification = await evaluateCodeSubmission(task, codeToEvaluate, sourceUrl, studentName);

      // Update progress state
      const updatedProgress = calculateUpdatedProgress(currentProgress, task, verification);

      res.json({
        success: true,
        verification,
        updatedProgress,
      });
    } catch (err: any) {
      console.error('Error in /api/verify-submission:', err);
      res.status(500).json({ error: err.message || 'Verification failed' });
    }
  });

  // 7. Standalone Code Similarity Comparison (for Modular Demo Lab)
  app.post('/api/similarity-compare', (req, res) => {
    try {
      const { codeA, codeB } = req.body;
      if (!codeA || !codeB) {
        return res.status(400).json({ error: 'Both codeA and codeB are required' });
      }
      const comparison = compareTwoCodeSnippets(codeA, codeB);
      res.json({ success: true, comparison });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Comparison failed' });
    }
  });

  // Helper function for progress and recommendation recalculation
  function calculateUpdatedProgress(
    progress: StudentProgress | undefined,
    task: PreparationTask,
    verification: any
  ): StudentProgress {
    const prev: StudentProgress = progress || {
      studentName: 'Student',
      targetRoleId: 'backend_developer',
      targetRoleTitle: 'Backend Developer',
      readinessScore: 40,
      totalTasksAssigned: 1,
      completedTasks: 0,
      failedTasks: 0,
      skillsMastery: {},
      history: [],
    };

    const targetSkill = task.targetSkill;
    const currentSkillScore = prev.skillsMastery[targetSkill] || 25;
    
    // Skill mastery update: +25% on pass, +5% on fail (attempt credit)
    const newSkillScore = verification.passed
      ? Math.min(100, currentSkillScore + 35)
      : Math.max(10, currentSkillScore + 5);

    const skillsMastery = {
      ...prev.skillsMastery,
      [targetSkill]: newSkillScore,
    };

    const completed = prev.completedTasks + (verification.passed ? 1 : 0);
    const failed = prev.failedTasks + (verification.passed ? 0 : 1);

    // Compute composite readiness score
    const skillScores = Object.values(skillsMastery);
    const avgSkillMastery = skillScores.length > 0 
      ? Math.round(skillScores.reduce((a, b) => a + b, 0) / skillScores.length)
      : prev.readinessScore;

    const updatedReadiness = Math.min(
      98,
      Math.max(15, Math.round(prev.readinessScore * 0.4 + avgSkillMastery * 0.6))
    );

    const newHistory = [
      {
        taskId: task.id,
        taskTitle: task.title,
        verifiedAt: new Date().toISOString(),
        passed: verification.passed,
        score: verification.correctnessScore,
        similarityFlag: verification.similarity?.flaggedAsPlagiarized || false,
      },
      ...prev.history,
    ];

    return {
      ...prev,
      readinessScore: updatedReadiness,
      completedTasks: completed,
      failedTasks: failed,
      skillsMastery,
      history: newHistory,
    };
  }

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Placement Platform Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
