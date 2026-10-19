import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  Gauge, 
  Sparkles, 
  ArrowRight, 
  X,
  FileCode,
  Clock,
  Zap,
  TrendingUp
} from 'lucide-react';
import { VerificationResult, StudentProgress } from '../types';

interface VerificationReportModalProps {
  result: VerificationResult;
  updatedProgress?: StudentProgress;
  onClose: () => void;
  onProceedToNextTask: () => void;
  nextTaskTitle?: string;
}

export const VerificationReportModal: React.FC<VerificationReportModalProps> = ({
  result,
  updatedProgress,
  onClose,
  onProceedToNextTask,
  nextTaskTitle,
}) => {
  const isPassed = result.passed;
  const isPlagiarized = result.similarity?.flaggedAsPlagiarized;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div
          className={`p-6 text-white ${
            isPassed
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
              : 'bg-gradient-to-r from-rose-600 to-amber-700'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center">
                {isPassed ? (
                  <CheckCircle2 className="w-7 h-7 text-white" />
                ) : (
                  <XCircle className="w-7 h-7 text-white" />
                )}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Verification Result
                </span>
                <h2 className="text-xl font-extrabold mt-1">
                  {isPassed ? 'Task Passed & Verified!' : 'Task Needs Revision'}
                </h2>
                <p className="text-xs text-white/80 mt-0.5">
                  Evaluated against requirement rubrics and test scenarios
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="text-[10px] text-white/70 uppercase font-semibold">Correctness Score</div>
              <div className="text-xl font-bold">{result.correctnessScore} / 100</div>
            </div>
            <div>
              <div className="text-[10px] text-white/70 uppercase font-semibold">Code Quality</div>
              <div className="text-xl font-bold capitalize">{result.codeQualityRating}</div>
            </div>
            <div>
              <div className="text-[10px] text-white/70 uppercase font-semibold">Plagiarism Risk</div>
              <div className="text-xl font-bold">
                {result.similarity?.similarityScore || 0}% {isPlagiarized ? '⚠️' : '✓'}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Fetched Code summary */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-200 font-semibold">
              <span className="flex items-center space-x-1.5">
                <FileCode className="w-4 h-4 text-indigo-600" />
                <span>Fetched Code Preview ({result.fetchedCodeLength} chars, {result.detectedLanguage})</span>
              </span>
              {result.sourceUrl && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-xs">
                  {result.sourceUrl}
                </span>
              )}
            </div>
            <pre className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto max-h-28">
              <code>{result.codePreview}</code>
            </pre>
          </div>

          {/* Evaluator Verdict Summary */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 text-xs text-indigo-950">
            <span className="font-bold text-indigo-900">Evaluator Assessment: </span>
            <span>{result.passFailEvaluation}</span>
          </div>

          {/* Plagiarism & Structural Similarity Report */}
          <div
            className={`border rounded-xl p-4 space-y-3 ${
              isPlagiarized
                ? 'bg-rose-50/60 border-rose-300 text-rose-900'
                : 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-bold text-xs">
                {isPlagiarized ? (
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                )}
                <span>Anti-Plagiarism & Structural Similarity Check</span>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isPlagiarized
                    ? 'bg-rose-200 text-rose-800'
                    : 'bg-emerald-200 text-emerald-800'
                }`}
              >
                {result.similarity?.verdict?.replace('_', ' ') || 'Clean'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-current/10">
              <div>
                <span className="opacity-75">AST Structural Overlap: </span>
                <strong className="font-bold">{result.similarity?.structuralSimilarity}%</strong>
              </div>
              <div>
                <span className="opacity-75">Compared Against: </span>
                <strong className="font-bold">{result.similarity?.matchedAgainst}</strong>
              </div>
            </div>

            <p className="text-[11px] leading-relaxed opacity-90">
              {result.similarity?.aiExplanation}
            </p>
          </div>

          {/* Test Cases Results Breakdown */}
          {result.testCaseResults && result.testCaseResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <span>Test Cases Evaluation</span>
              </h4>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 dark:bg-slate-950 font-semibold text-slate-700 dark:text-slate-200 text-[11px]">
                    <tr>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Scenario</th>
                      <th className="px-3 py-2 text-left">Expected</th>
                      <th className="px-3 py-2 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {result.testCaseResults.map((tc, idx) => (
                      <tr key={idx} className={tc.passed ? 'bg-white dark:bg-slate-900' : 'bg-rose-50/40'}>
                        <td className="px-3 py-2">
                          {tc.passed ? (
                            <span className="inline-flex items-center text-emerald-700 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Pass
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-rose-700 font-bold">
                              <XCircle className="w-3.5 h-3.5 mr-1" /> Fail
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-800 dark:text-slate-100 font-medium">{tc.inputDescription}</td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300 font-mono">{tc.expectedOutput}</td>
                        <td className="px-3 py-2 text-slate-500 dark:text-slate-400">{tc.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Complexity & Feedback */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-1">
                <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                <span>Complexity Analysis</span>
              </span>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                <div>Time: <strong className="font-mono text-slate-800 dark:text-slate-100">{result.complexityAnalysis?.timeComplexity || 'O(N)'}</strong></div>
                <div>Space: <strong className="font-mono text-slate-800 dark:text-slate-100">{result.complexityAnalysis?.spaceComplexity || 'O(1)'}</strong></div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-100">Improvement Opportunities:</span>
              <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                {result.feedback?.improvements?.slice(0, 2).map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Updated Readiness Score & Next Task Recommendation */}
          {updatedProgress && (
            <div className="bg-gradient-to-r from-indigo-900 to-blue-950 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs font-bold text-indigo-300">
                  <TrendingUp className="w-4 h-4" />
                  <span>Overall Readiness Updated: {updatedProgress.readinessScore}%</span>
                </div>
                <div className="text-xs text-indigo-100">
                  {nextTaskTitle ? `Next Recommended Task: "${nextTaskTitle}"` : 'Continue mastering your remaining skill gaps!'}
                </div>
              </div>

              <button
                type="button"
                onClick={onProceedToNextTask}
                className="px-4 py-2.5 bg-white dark:bg-slate-900 text-indigo-950 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-xs dark:shadow-none flex items-center space-x-1.5 transition-all shrink-0"
              >
                <span>Proceed to Next Task</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
