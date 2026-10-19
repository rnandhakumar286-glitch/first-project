import React from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Target, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { StudentProgress, PreparationTask } from '../types';

interface ProgressDashboardProps {
  progress: StudentProgress;
  tasks: PreparationTask[];
  onSelectTask: (taskId: string) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progress,
  tasks,
  onSelectTask,
}) => {
  const skillsList = Object.entries(progress.skillsMastery || {});

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs dark:shadow-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Placement Preparation Tracker</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {progress.studentName}'s Placement Mastery
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Target Role: <strong className="text-indigo-600 font-semibold">{progress.targetRoleTitle}</strong>
            </p>
          </div>

          {/* Large Readiness Score Metric */}
          <div className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-4 rounded-xl">
            <div className="text-center">
              <div className="text-4xl font-black text-indigo-600">
                {progress.readinessScore}%
              </div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Interview Ready
              </div>
            </div>
            <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-1.5 text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-semibold">{progress.completedTasks} Tasks Passed</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                <XCircle className="w-4 h-4 text-slate-400" />
                <span>{progress.failedTasks} Revisions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-5 space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            <span>Overall Readiness Track</span>
            <span>{progress.readinessScore}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${progress.readinessScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid: Skill Mastery Bars & Recommended Next Task */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skill Mastery Levels */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs dark:shadow-none space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Skill Mastery Breakdown</span>
            </h3>
            <span className="text-xs text-slate-400">{skillsList.length} Tracked</span>
          </div>

          {skillsList.length > 0 ? (
            <div className="space-y-3">
              {skillsList.map(([skill, mastery]) => (
                <div key={skill} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-100">{skill}</span>
                    <span className="text-indigo-600">{mastery}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        mastery >= 75 ? 'bg-emerald-500' : mastery >= 50 ? 'bg-indigo-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${mastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Submit task solutions to begin recording verified skill mastery.
            </p>
          )}
        </div>

        {/* Dynamic Next Task Recommendation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs dark:shadow-none space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Dynamic Next Recommendation</span>
            </div>

            {tasks.length > 0 ? (
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-slate-900 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
                  Recommended Priority
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {tasks[0].title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Target Skill: <strong className="text-indigo-900 font-semibold">{tasks[0].targetSkill}</strong> • {tasks[0].estimatedMinutes} mins
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {tasks[0].description}
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Generate tasks from the intake flow to populate your recommendation path.
              </div>
            )}
          </div>

          {tasks.length > 0 && (
            <button
              type="button"
              onClick={() => onSelectTask(tasks[0].id)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs dark:shadow-none flex items-center justify-center space-x-2 transition-all mt-4"
            >
              <span>Jump into Recommended Task</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Submissions & Verification History */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs dark:shadow-none space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Submission & Verification History ({progress.history.length})</span>
          </h3>
        </div>

        {progress.history.length > 0 ? (
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 dark:bg-slate-950 font-semibold text-slate-700 dark:text-slate-200 text-[11px]">
                <tr>
                  <th className="px-4 py-2.5 text-left">Task</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5 text-left">Score</th>
                  <th className="px-4 py-2.5 text-left">Anti-Plagiarism</th>
                  <th className="px-4 py-2.5 text-left">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {progress.history.map((record, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">{record.taskTitle}</td>
                    <td className="px-4 py-2.5">
                      {record.passed ? (
                        <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <XCircle className="w-3 h-3 mr-1" /> Revise
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-bold text-slate-700 dark:text-slate-200">{record.score}/100</td>
                    <td className="px-4 py-2.5">
                      {record.similarityFlag ? (
                        <span className="inline-flex items-center text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded">
                          <ShieldAlert className="w-3 h-3 mr-1" /> Flagged
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                          <ShieldCheck className="w-3 h-3 mr-1" /> Clean
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-slate-400">
                      {new Date(record.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            No submissions recorded yet. Submit your first task solution to see results logged here!
          </div>
        )}
      </div>
    </div>
  );
};
