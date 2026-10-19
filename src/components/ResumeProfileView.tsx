import React from 'react';
import { User, Code2, Database, Wrench, Layers, FolderGit2, ArrowRight, RotateCcw, CheckCircle, GraduationCap, Lightbulb } from 'lucide-react';
import { ExtractedResumeData, JobRole } from '../types';

interface ResumeProfileViewProps {
  extractedData: ExtractedResumeData;
  targetRole: JobRole;
  onProceedToGapAnalysis: () => void;
  onReset: () => void;
  isLoading: boolean;
}

export const ResumeProfileView: React.FC<ResumeProfileViewProps> = ({
  extractedData,
  targetRole,
  onProceedToGapAnalysis,
  onReset,
  isLoading,
}) => {
  const languages = extractedData.skills.filter((s) => s.category === 'language');
  const frameworks = extractedData.skills.filter((s) => s.category === 'framework');
  const databases = extractedData.skills.filter((s) => s.category === 'database');
  const concepts = extractedData.skills.filter((s) => s.category === 'concept');

  // Deduplicate: only show toolsAndPlatforms entries not already in skills
  const skillNames = new Set(extractedData.skills.map((s) => s.name.toLowerCase()));
  const toolSkills = extractedData.skills.filter((s) => s.category === 'tool');
  const additionalTools = extractedData.toolsAndPlatforms
    .filter((t) => !skillNames.has(t.toLowerCase()))
    .map((t) => ({ name: t, category: 'tool' as const }));
  const tools = [...toolSkills, ...additionalTools];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs dark:shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {extractedData.candidateName || 'Candidate Profile'}
                </h2>
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Resume Extracted</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Target Role: <strong className="text-indigo-600 font-semibold">{targetRole.title}</strong> • {extractedData.rawSkillCount} distinct skills identified
              </p>
              {extractedData.email && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {extractedData.email}{extractedData.phone ? ` \u2022 ${extractedData.phone}` : ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Change Resume</span>
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={onProceedToGapAnalysis}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs dark:shadow-none transition-all"
            >
              <span>View Gap Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {extractedData.summary && (
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200/80">
            {extractedData.summary}
          </p>
        )}
      </div>

      {/* Education */}
      {extractedData.education && extractedData.education.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs dark:shadow-none space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span>Education</span>
          </div>
          <div className="space-y-1">
            {extractedData.education.map((edu, idx) => (
              <p key={idx} className="text-xs text-slate-700 dark:text-slate-200 bg-amber-50/50 border border-amber-100 px-3 py-2 rounded-lg">
                {edu}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Skills Categorized */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Languages */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs dark:shadow-none space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <Code2 className="w-4 h-4 text-blue-600" />
            <span>Programming Languages ({languages.length})</span>
          </div>
          {languages.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {languages.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 bg-blue-50 text-blue-900 border border-blue-200/80 px-2.5 py-1 rounded-lg text-xs"
                  title={s.context || ''}
                >
                  <span className="font-semibold">{s.name}</span>
                  {s.proficiency && (
                    <span className="text-[10px] text-blue-700 bg-white dark:bg-slate-900 px-1.5 py-0.2 rounded font-medium">
                      {s.proficiency}
                    </span>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">None detected explicitly.</p>
          )}
        </div>

        {/* Frameworks & Libraries */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs dark:shadow-none space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Frameworks & Libraries ({frameworks.length})</span>
          </div>
          {frameworks.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {frameworks.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-900 border border-indigo-200/80 px-2.5 py-1 rounded-lg text-xs"
                  title={s.context || ''}
                >
                  <span className="font-semibold">{s.name}</span>
                  {s.proficiency && (
                    <span className="text-[10px] text-indigo-700 bg-white dark:bg-slate-900 px-1.5 py-0.2 rounded font-medium">
                      {s.proficiency}
                    </span>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">None detected in resume.</p>
          )}
        </div>

        {/* Databases */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs dark:shadow-none space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Databases & Storage ({databases.length})</span>
          </div>
          {databases.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {databases.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-xs"
                  title={s.context || ''}
                >
                  <span className="font-semibold">{s.name}</span>
                  {s.proficiency && (
                    <span className="text-[10px] text-emerald-700 bg-white dark:bg-slate-900 px-1.5 py-0.2 rounded font-medium">
                      {s.proficiency}
                    </span>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg font-medium">
              \u26A0\uFE0F No dedicated database technologies detected in resume.
            </p>
          )}
        </div>

        {/* Tools & DevOps */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs dark:shadow-none space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <Wrench className="w-4 h-4 text-purple-600" />
            <span>Developer Tools & Platforms ({tools.length})</span>
          </div>
          {tools.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {tools.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 bg-purple-50 text-purple-900 border border-purple-200/80 px-2.5 py-1 rounded-lg text-xs"
                >
                  <span className="font-semibold">{s.name}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">None detected.</p>
          )}
        </div>
      </div>

      {/* Concepts & Additional Skills */}
      {concepts.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs dark:shadow-none space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Concepts & Additional Skills ({concepts.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {concepts.map((s, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-lg text-xs"
                title={s.context || ''}
              >
                <span className="font-semibold">{s.name}</span>
                {s.proficiency && (
                  <span className="text-[10px] text-amber-700 bg-white dark:bg-slate-900 px-1.5 py-0.2 rounded font-medium">
                    {s.proficiency}
                  </span>
                )}
                {s.context === 'Added by user' && (
                  <span className="text-[9px] text-amber-600 bg-amber-100 px-1 py-0.5 rounded font-bold">
                    self-reported
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Projects */}
      {extractedData.projects && extractedData.projects.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs dark:shadow-none space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-semibold">
            <FolderGit2 className="w-5 h-5 text-indigo-600" />
            <span>Extracted Projects ({extractedData.projects.length})</span>
          </div>

          <div className="space-y-3">
            {extractedData.projects.map((proj, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{proj.title}</h4>
                  <div className="flex flex-wrap gap-1">
                    {proj.technologies?.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTA to proceed */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={onProceedToGapAnalysis}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 flex items-center space-x-2 transition-all"
        >
          <span>Proceed to Role Skill Gap Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
