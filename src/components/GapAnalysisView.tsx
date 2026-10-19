import React from 'react';
import { AlertCircle, CheckCircle, TrendingUp, Sparkles, ArrowRight, ShieldAlert, Award } from 'lucide-react';
import { GapAnalysisResult, JobRole } from '../types';

interface GapAnalysisViewProps {
  analysis: GapAnalysisResult;
  role: JobRole;
  onGenerateTasks: () => void;
  isLoading: boolean;
}

export const GapAnalysisView: React.FC<GapAnalysisViewProps> = ({
  analysis,
  role,
  onGenerateTasks,
  isLoading,
}) => {
  const highPriorityGaps = analysis.rankedGaps.filter((g) => g.priority === 'high');
  const mediumPriorityGaps = analysis.rankedGaps.filter((g) => g.priority === 'medium');

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      {/* Header Metric Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs dark:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Skill Gap Evaluation</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Placement Readiness for {role.title}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
              {analysis.analysisSummary}
            </p>
          </div>

          {/* Readiness Meter */}
          <div className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shrink-0">
            <div className="text-center">
              <div className="text-3xl font-black text-indigo-600">
                {analysis.overallReadinessScore}%
              </div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Readiness Score
              </div>
            </div>
            <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-1.5 text-emerald-700">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="font-semibold">{analysis.matchedCount} Benchmarks Met</span>
              </div>
              <div className="flex items-center space-x-1.5 text-rose-700">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="font-semibold">{analysis.gapsCount} Priority Gaps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            <span>Target Role Alignment</span>
            <span>{analysis.overallReadinessScore} / 100</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                analysis.overallReadinessScore >= 75
                  ? 'bg-emerald-500'
                  : analysis.overallReadinessScore >= 50
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${analysis.overallReadinessScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Ranked Skill Gaps List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs dark:shadow-none space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>Ranked Skill Gaps (Ordered by Placement Impact)</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {analysis.rankedGaps.length} Actionable Items
          </span>
        </div>

        <div className="space-y-3">
          {analysis.rankedGaps.map((gap, index) => {
            const isHigh = gap.priority === 'high';
            const isMissing = gap.status === 'missing';

            return (
              <div
                key={gap.skillId}
                className="border border-slate-200/90 rounded-xl p-4 bg-white dark:bg-slate-900 hover:border-indigo-300 hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      #{index + 1}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{gap.skillName}</h4>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isHigh
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {gap.priority} Priority
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Current:</span>
                    <span
                      className={`font-semibold capitalize px-2 py-0.5 rounded ${
                        isMissing
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {gap.currentLevel}
                    </span>
                    <span className="text-slate-400">→ Target:</span>
                    <span className="font-semibold capitalize bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
                      {gap.requiredLevel}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-3 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="font-medium text-slate-700 dark:text-slate-200">{gap.gapReason}</div>
                  <div className="text-slate-500 dark:text-slate-400">
                    <strong className="text-slate-700 dark:text-slate-200 font-semibold">Recommended Focus: </strong>
                    {gap.recommendedFocus}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Already Matched Strengths */}
      {analysis.strengths && analysis.strengths.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs dark:shadow-none space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Demonstrated Strengths / Benchmarks Met ({analysis.strengths.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.strengths.map((str, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-semibold"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>{str}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action CTA: Generate Personalized Tasks */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white rounded-2xl p-6 shadow-md space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-300" />
            <span>Generate Actionable Preparation Tasks</span>
          </h3>
          <p className="text-xs text-indigo-200 max-w-xl">
            Convert these {analysis.rankedGaps.length} gaps into specific coding challenges, system design mini-exercises, and testable tasks with clear pass/fail rubrics.
          </p>
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={onGenerateTasks}
          className="px-6 py-3.5 bg-white dark:bg-slate-900 text-indigo-900 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-xs dark:shadow-none flex items-center space-x-2 transition-all disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin" />
              <span>Generating Targeted Placement Tasks with AI...</span>
            </>
          ) : (
            <>
              <span>Generate Tasks & Open Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
