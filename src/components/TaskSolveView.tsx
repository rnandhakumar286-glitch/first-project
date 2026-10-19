import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  AlertTriangle, 
  Code, 
  Clock, 
  ChevronRight, 
  Lightbulb, 
  FileCode,
  ShieldCheck,
  Terminal,
  Zap
} from 'lucide-react';
import { PreparationTask, VerificationResult, StudentProgress } from '../types';

interface TaskSolveViewProps {
  tasks: PreparationTask[];
  activeTaskId: string;
  setActiveTaskId: (id: string) => void;
  onSubmitAndVerify: (payload: {
    taskId: string;
    submissionUrl?: string;
    submittedCode?: string;
  }) => Promise<void>;
  isLoading: boolean;
  latestVerification?: VerificationResult;
  progress?: StudentProgress;
}

export const TaskSolveView: React.FC<TaskSolveViewProps> = ({
  tasks,
  activeTaskId,
  setActiveTaskId,
  onSubmitAndVerify,
  isLoading,
  latestVerification,
  progress,
}) => {
  const activeTask = tasks.find((t) => t.id === activeTaskId) || tasks[0];
  const [submissionUrl, setSubmissionUrl] = useState<string>('');
  const [submittedCode, setSubmittedCode] = useState<string>('');
  const [showCodeEditor, setShowCodeEditor] = useState<boolean>(false);
  const [copiedStarter, setCopiedStarter] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);

  if (!activeTask) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">No tasks generated yet.</div>;
  }

  const handleCopyStarterCode = () => {
    navigator.clipboard.writeText(activeTask.starterCode.code);
    setCopiedStarter(true);
    setTimeout(() => setCopiedStarter(false), 2000);
  };

  // Demo Helpers: quickly load solutions to test verification and plagiarism
  const handleLoadDemoCorrect = () => {
    setSubmissionUrl('https://onlinegdb.com/demo_valid_submission');
    setSubmittedCode(activeTask.sampleSolutionSnippet || activeTask.starterCode.code);
    setShowCodeEditor(true);
  };

  const handleLoadDemoBuggy = () => {
    setSubmissionUrl('https://onlinegdb.com/demo_buggy_submission');
    setSubmittedCode(`// Implementation with edge-case bugs
def solution(data):
    # Missing empty list check, will crash or fail boundary
    return data[0] if data else None
`);
    setShowCodeEditor(true);
  };

  const handleLoadDemoPlagiarized = () => {
    setSubmissionUrl('https://onlinegdb.com/demo_copied_code');
    // Load verbatim canonical reference code with renamed variables to test AST structural similarity detector!
    const canonical = activeTask.sampleSolutionSnippet || `const rateLimitMap = {};
function slidingWindowRateLimiter(req, res, next) {
  const clientIp = req.ip;
  const now = Date.now();
  const windowMs = 60000;
  const limit = 100;
  if (!rateLimitMap[clientIp]) rateLimitMap[clientIp] = [];
  rateLimitMap[clientIp] = rateLimitMap[clientIp].filter(ts => ts > now - windowMs);
  if (rateLimitMap[clientIp].length >= limit) return res.status(429).json({ error: "Too many requests" });
  rateLimitMap[clientIp].push(now);
  next();
}`;
    setSubmittedCode(`// Submitting copied solution with renamed variables:
// Demonstrates AST structural normalization catching renamed tokens
${canonical}`);
    setShowCodeEditor(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionUrl.trim() && !submittedCode.trim()) {
      alert('Please provide an external submission URL (OnlineGDB, GitHub, Gist) or paste your code directly.');
      return;
    }

    await onSubmitAndVerify({
      taskId: activeTask.id,
      submissionUrl: submissionUrl.trim() || undefined,
      submittedCode: submittedCode.trim() || undefined,
    });
  };

  // Check if active task is completed
  const isTaskPassed = progress?.history?.some((h) => h.taskId === activeTask.id && h.passed);

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      {/* Task Navigation Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {tasks.map((task, idx) => {
          const isSelected = task.id === activeTask.id;
          const passed = progress?.history?.some((h) => h.taskId === task.id && h.passed);
          return (
            <button
              key={task.id}
              onClick={() => {
                setActiveTaskId(task.id);
                setSubmissionUrl('');
                setSubmittedCode('');
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs dark:shadow-none'
                  : passed
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>Task {idx + 1}: {task.targetSkill}</span>
              {passed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Task Specs & Test Cases */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs dark:shadow-none space-y-4">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Target: {activeTask.targetSkill}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  {activeTask.difficulty}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Est. {activeTask.estimatedMinutes} mins</span>
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {activeTask.title}
            </h2>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeTask.description}
            </p>

            {/* Problem Statement */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <FileCode className="w-4 h-4 text-indigo-600" />
                <span>Problem Statement</span>
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {activeTask.problemStatement}
              </p>
            </div>

            {/* Constraints & Pass/Fail Criteria */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-100">Constraints:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                  {activeTask.constraints?.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-100">Pass/Fail Rubric:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                  {activeTask.passFailCriteria?.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Test Cases Table */}
            {activeTask.testCases && activeTask.testCases.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Terminal className="w-4 h-4 text-indigo-600" />
                  <span>Validation Test Cases (Evaluated on Submission)</span>
                </span>
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50 dark:bg-slate-950 font-semibold text-slate-700 dark:text-slate-200 text-[11px]">
                      <tr>
                        <th className="px-3 py-2 text-left">Case</th>
                        <th className="px-3 py-2 text-left">Input Scenario</th>
                        <th className="px-3 py-2 text-left">Expected Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {activeTask.testCases.map((tc, idx) => (
                        <tr key={idx} className={tc.isEdgeCase ? 'bg-amber-50/50' : 'bg-white dark:bg-slate-900'}>
                          <td className="px-3 py-2 font-mono text-slate-500 dark:text-slate-400">
                            #{idx + 1} {tc.isEdgeCase && <span className="text-[9px] text-amber-700 bg-amber-100 px-1 py-0.2 rounded font-bold">Edge</span>}
                          </td>
                          <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-100">{tc.inputDescription}</td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-300 font-mono">{tc.expectedOutput}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Starter Code Snippet with Copy button */}
            {activeTask.starterCode && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-1.5">
                    <Code className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    <span>Starter Template ({activeTask.starterCode.language})</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyStarterCode}
                    className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    {copiedStarter ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedStarter ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-xl text-xs font-mono overflow-x-auto max-h-48 scrollbar-thin">
                  <code>{activeTask.starterCode.code}</code>
                </pre>
              </div>
            )}

            {/* Hints Accordion */}
            {activeTask.hints && activeTask.hints.length > 0 && (
              <div className="border border-indigo-100 bg-indigo-50/50 rounded-xl p-3">
                <button
                  type="button"
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center justify-between w-full text-xs font-semibold text-indigo-900"
                >
                  <span className="flex items-center space-x-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Need a hint? ({activeTask.hints.length} available)</span>
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${showHints ? 'rotate-90' : ''}`} />
                </button>
                {showHints && (
                  <ul className="mt-2.5 list-disc list-inside space-y-1 text-xs text-indigo-950 pt-2 border-t border-indigo-100">
                    {activeTask.hints.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: External Solve & Submit Box */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs dark:shadow-none space-y-5 sticky top-20">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                <span>Submit Solution for Verification</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Solve on OnlineGDB or GitHub, paste the link below, and the platform will fetch and verify correctness + check plagiarism.
              </p>
            </div>

            {/* External solve helper banner */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-100">Solve in Online IDE:</span>
                <a
                  href="https://www.onlinegdb.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-indigo-600 font-semibold hover:underline"
                >
                  <span>Open OnlineGDB</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Click "Share" on OnlineGDB, copy the URL (e.g. <code>onlinegdb.com/xxxx</code>), and paste it below.
              </p>
            </div>

            {/* 1-Click Preset Demo Buttons */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <span>Quick Test Presets (Instant Demo):</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={handleLoadDemoCorrect}
                  className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition-all text-center"
                  title="Loads a solution that passes test cases"
                >
                  🟢 Pass Test
                </button>
                <button
                  type="button"
                  onClick={handleLoadDemoBuggy}
                  className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold transition-all text-center"
                  title="Loads a solution with edge case errors"
                >
                  🟡 Edge Fail
                </button>
                <button
                  type="button"
                  onClick={handleLoadDemoPlagiarized}
                  className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-[10px] font-bold transition-all text-center"
                  title="Loads reference benchmark to trigger plagiarism flag"
                >
                  🔴 Copied Code
                </button>
              </div>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 mb-1">
                  External Solution URL
                </label>
                <input
                  type="text"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder="https://onlinegdb.com/xxxxx or https://github.com/..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Supports OnlineGDB, GitHub blobs, Gist, and Pastebin.
                </span>
              </div>

              {/* Direct Code Editor Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <button
                    type="button"
                    onClick={() => setShowCodeEditor(!showCodeEditor)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    {showCodeEditor ? 'Hide Code Editor' : '+ Or Paste/Edit Code Directly'}
                  </button>
                  {submittedCode && (
                    <span className="text-[10px] text-slate-400">
                      {submittedCode.length} characters
                    </span>
                  )}
                </div>

                {showCodeEditor && (
                  <textarea
                    rows={8}
                    value={submittedCode}
                    onChange={(e) => setSubmittedCode(e.target.value)}
                    placeholder="Paste or write your full solution code here..."
                    className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-xl p-3 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>

              {/* Submit & Verify Action */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Fetching Code & Running Verification Pipeline...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Fetch Code & Verify Submission</span>
                  </>
                )}
              </button>
            </form>

            {/* Previous Status summary if verified */}
            {isTaskPassed && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center space-x-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">Task previously verified as Passed!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
