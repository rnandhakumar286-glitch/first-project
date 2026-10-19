/**
 * SkillBridge AI - Placement Preparation & Verification Platform
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ResumeIntake } from './components/ResumeIntake';
import { ResumeProfileView } from './components/ResumeProfileView';
import { GapAnalysisView } from './components/GapAnalysisView';
import { TaskSolveView } from './components/TaskSolveView';
import { ProgressDashboard } from './components/ProgressDashboard';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { Login } from './components/Login';
import { motion, AnimatePresence } from 'motion/react';
import { JobRole, ExtractedResumeData, GapAnalysisResult, PreparationTask, VerificationResult, StudentProgress } from './types';
import { JOB_ROLES, SAMPLE_RESUMES } from './data/rolesData';
import { Check, ChevronRight } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'journey' | 'progress' | 'guide'>('journey');
  const [journeyStep, setJourneyStep] = useState<'intake' | 'profile' | 'gaps' | 'tasks'>('intake');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const [roles, setRoles] = useState<JobRole[]>(JOB_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('backend_developer');
  const [extractedData, setExtractedData] = useState<ExtractedResumeData | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysisResult | null>(null);
  const [tasks, setTasks] = useState<PreparationTask[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string>('');
  const [latestVerification, setLatestVerification] = useState<VerificationResult | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Student overall progress state
  const [progress, setProgress] = useState<StudentProgress>({
    studentName: 'Alex Chen',
    targetRoleId: 'backend_developer',
    targetRoleTitle: 'Backend Developer',
    readinessScore: 35,
    totalTasksAssigned: 0,
    completedTasks: 0,
    failedTasks: 0,
    skillsMastery: {},
    history: [],
  });

  // Fetch roles on mount
  useEffect(() => {
    fetch('/api/roles')
      .then((res) => res.json())
      .then((data) => {
        if (data.roles && data.roles.length > 0) {
          setRoles(data.roles);
        }
      })
      .catch((err) => console.log('Using local roles benchmark data:', err));
  }, []);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  const showNotification = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 4000);
  };

  // Step 1: Parse Resume
  const handleParseResume = async (payload: {
    resumeText?: string;
    pdfBase64?: string;
    extraSkills: string[];
  }) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse resume');
      }

      // Merge user-added extra skills into the extracted skills list (deduplicated)
      const mergedSkills = [...(data.extracted.skills || [])];
      for (const extra of payload.extraSkills) {
        const trimmed = extra.trim();
        if (trimmed && !mergedSkills.some((s: any) => s.name.toLowerCase() === trimmed.toLowerCase())) {
          mergedSkills.push({
            name: trimmed,
            category: 'concept',
            proficiency: 'intermediate',
            context: 'Added by user',
          });
        }
      }
      const enrichedData = {
        ...data.extracted,
        skills: mergedSkills,
        rawSkillCount: mergedSkills.length,
      };

      setExtractedData(enrichedData);
      setProgress((prev) => ({
        ...prev,
        studentName: data.extracted.candidateName || prev.studentName,
        targetRoleId: selectedRoleId,
        targetRoleTitle: selectedRole?.title || 'Backend Developer',
      }));

      // Automatically run gap analysis
      const gapRes = await fetch('/api/gap-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          extractedData: enrichedData,
          roleId: selectedRoleId,
          extraSkills: payload.extraSkills,
          roles,
        }),
      });
      const gapData = await gapRes.json();
      if (gapData.analysis) {
        setGapAnalysis(gapData.analysis);
        setProgress((prev) => ({
          ...prev,
          readinessScore: gapData.analysis.overallReadinessScore,
        }));
      }

      setJourneyStep('profile');
      showNotification('Resume parsed successfully! Extracted skills and projects.');
    } catch (err: any) {
      alert(`Error: ${err.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2 -> 3: Proceed to Gap Analysis
  const handleProceedToGapAnalysis = () => {
    setJourneyStep('gaps');
  };

  // Step 3 -> 4: Generate Targeted Tasks
  const handleGenerateTasks = async () => {
    if (!gapAnalysis) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gaps: gapAnalysis.rankedGaps,
          candidateBackground: extractedData?.summary || 'Computer Science Student',
          roleTitle: selectedRole?.title || 'Software Engineer',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate tasks');
      }

      if (data.tasks && data.tasks.length > 0) {
        setTasks(data.tasks);
        setActiveTaskId(data.tasks[0].id);
        setProgress((prev) => ({
          ...prev,
          totalTasksAssigned: data.tasks.length,
          currentRecommendedTaskId: data.tasks[0].id,
        }));
        setJourneyStep('tasks');
        showNotification(`Generated ${data.tasks.length} targeted preparation tasks targeting your skill gaps!`);
      }
    } catch (err: any) {
      alert(`Task generation error: ${err.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 5 & 6: Submit Solution & Run Verification Pipeline
  const handleSubmitAndVerify = async (payload: {
    taskId: string;
    submissionUrl?: string;
    submittedCode?: string;
  }) => {
    const task = tasks.find((t) => t.id === payload.taskId);
    if (!task) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/verify-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task,
          submissionUrl: payload.submissionUrl,
          submittedCode: payload.submittedCode,
          studentName: progress.studentName,
          currentProgress: progress,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setLatestVerification(data.verification);
      if (data.updatedProgress) {
        setProgress(data.updatedProgress);
      }
      setShowVerificationModal(true);

      if (data.verification.passed) {
        showNotification('Task verified successfully! Readiness score increased.');
      } else {
        showNotification('Task needs revision. Check the evaluator feedback.');
      }
    } catch (err: any) {
      alert(`Verification error: ${err.message || String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Recommendation Loop: Proceed to next task
  const handleProceedToNextTask = () => {
    setShowVerificationModal(false);
    // Find next uncompleted task
    const currentIndex = tasks.findIndex((t) => t.id === activeTaskId);
    const nextTask = tasks[(currentIndex + 1) % tasks.length];
    if (nextTask) {
      setActiveTaskId(nextTask.id);
      showNotification(`Loaded next priority task: "${nextTask.title}"`);
    }
  };

  // Reset to start over
  const handleResetIntake = () => {
    setExtractedData(null);
    setGapAnalysis(null);
    setTasks([]);
    setJourneyStep('intake');
  };

  const nextTask = tasks.find((t) => t.id !== activeTaskId);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {statusNotification && (
        <div className="fixed top-18 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedRole={selectedRole}
        readinessScore={progress.readinessScore}
        completedCount={progress.completedTasks}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative">
        {/* Journey Step Indicator (when in Journey mode) */}
        {activeTab === 'journey' && (
          <div className="pt-6 pb-2 sticky top-16 z-20 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md">
            <div className="max-w-3xl mx-auto bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-2xl p-2 shadow-sm dark:shadow-none flex items-center justify-between text-xs transition-colors">
              <button
                type="button"
                onClick={() => setJourneyStep('intake')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl font-semibold transition-all ${
                  journeyStep === 'intake'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>1. Intake</span>
              </button>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />

              <button
                type="button"
                disabled={!extractedData}
                onClick={() => setJourneyStep('profile')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl font-semibold transition-all disabled:opacity-40 ${
                  journeyStep === 'profile'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>2. Resume Skills</span>
                {extractedData && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />

              <button
                type="button"
                disabled={!gapAnalysis}
                onClick={() => setJourneyStep('gaps')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl font-semibold transition-all disabled:opacity-40 ${
                  journeyStep === 'gaps'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>3. Gap Analysis</span>
                {gapAnalysis && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
              <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />

              <button
                type="button"
                disabled={tasks.length === 0}
                onClick={() => setJourneyStep('tasks')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl font-semibold transition-all disabled:opacity-40 ${
                  journeyStep === 'tasks'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>4. Solve & Verify</span>
                {tasks.length > 0 && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Tab 1: Full Placement Journey */}
          {activeTab === 'journey' && (
            <motion.div
              key="journey"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {journeyStep === 'intake' && (
                <ResumeIntake
                  roles={roles}
                  selectedRoleId={selectedRoleId}
                  setSelectedRoleId={setSelectedRoleId}
                  onParseResume={handleParseResume}
                  onAddCustomRole={(newRole) => setRoles((prev) => [...prev, newRole])}
                  isLoading={isLoading}
                />
              )}

              {journeyStep === 'profile' && extractedData && (
                <ResumeProfileView
                  extractedData={extractedData}
                  targetRole={selectedRole}
                  onProceedToGapAnalysis={handleProceedToGapAnalysis}
                  onReset={handleResetIntake}
                  isLoading={isLoading}
                />
              )}

              {journeyStep === 'gaps' && gapAnalysis && (
                <GapAnalysisView
                  analysis={gapAnalysis}
                  role={selectedRole}
                  onGenerateTasks={handleGenerateTasks}
                  isLoading={isLoading}
                />
              )}

              {journeyStep === 'tasks' && tasks.length > 0 && (
                <TaskSolveView
                  tasks={tasks}
                  activeTaskId={activeTaskId}
                  setActiveTaskId={setActiveTaskId}
                  onSubmitAndVerify={handleSubmitAndVerify}
                  isLoading={isLoading}
                  latestVerification={latestVerification || undefined}
                  progress={progress}
                />
              )}
            </motion.div>
          )}

          {/* Tab 3: Progress & Mastery Dashboard */}
          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ProgressDashboard
                progress={progress}
                tasks={tasks}
                onSelectTask={(id) => {
                  setActiveTaskId(id);
                  setActiveTab('journey');
                  setJourneyStep('tasks');
                }}
              />
            </motion.div>
          )}

          {/* Tab 4: Architecture Guide */}
          {activeTab === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ArchitectureGuide />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Verification Modal with Plagiarism and Test Results */}
      {showVerificationModal && latestVerification && (
        <VerificationReportModal
          result={latestVerification}
          updatedProgress={progress}
          onClose={() => setShowVerificationModal(false)}
          onProceedToNextTask={handleProceedToNextTask}
          nextTaskTitle={nextTask?.title}
        />
      )}
    </div>
  );
}
