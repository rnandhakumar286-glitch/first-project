import React from 'react';
import { 
  FileText, 
  GitCompare, 
  ListOrdered, 
  ExternalLink, 
  CheckCircle, 
  ShieldCheck, 
  TrendingUp, 
  RotateCw,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  const steps = [
    {
      step: '1. Resume Parsing',
      icon: FileText,
      tech: 'Gemini 3.8 Flash Document Understanding + Fallback AST Regex',
      desc: 'Extracts programming languages, frameworks, databases, developer tools, projects, and work experience from PDF base64 or plaintext with proficiency inference.'
    },
    {
      step: '2. Role-Skill Competency Mapping',
      icon: Layers,
      tech: 'Weighted Placement Matrices',
      desc: 'Maintains curated matrices for Backend, Frontend, Full Stack, ML, and SDE roles with interview importance weights (e.g. SQL = 95 wt, REST = 90 wt).'
    },
    {
      step: '3. Gap Analysis & Ranking Engine',
      icon: GitCompare,
      tech: 'Proficiency Differential & Priority Ranking Algorithm',
      desc: 'Compares extracted skills vs role requirements to identify missing and partial gaps, generating a ranked priority order based on interview impact.'
    },
    {
      step: '4. Personalized Task Synthesis',
      icon: ListOrdered,
      tech: 'Generative AI + Curated Benchmark Library',
      desc: 'For each priority gap, synthesizes targeted coding challenges with explicit problem statements, runtime constraints, pass/fail rubrics, and automated test cases.'
    },
    {
      step: '5. External Solve & Code Ingestion',
      icon: ExternalLink,
      tech: 'OnlineGDB / GitHub / Gist Scraper with Direct Fallback',
      desc: 'Students solve the task externally and submit a link. The backend fetches code from OnlineGDB, converts GitHub blobs to raw, or accepts pasted solutions.'
    },
    {
      step: '6. Correctness & Test-Case Verification',
      icon: CheckCircle,
      tech: 'Gemini 3.8 Flash Automated Grader + Test Assertions',
      desc: 'Tests submitted code against standard inputs, boundary values, and edge cases. Evaluates time and space complexity with placement interview criteria.'
    },
    {
      step: '7. Structural Anti-Plagiarism Check',
      icon: ShieldCheck,
      tech: 'AST Token Normalization + Winnowing Shingles + Cross-Student Store',
      desc: 'Strips comments, normalizes variable/parameter identifiers to ID(VAR), and calculates Jaccard shingle similarity against canonical solutions and peer submissions to detect renamed copies.'
    },
    {
      step: '8. Dynamic Recommendation Loop',
      icon: RotateCw,
      tech: 'Adaptive Skill State Graph',
      desc: 'Recalculates student skill mastery and placement readiness score. Automatically promotes the student to the next priority gap or prescribes prerequisite drills if revisions are needed.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs dark:shadow-none space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5" />
          <span>System Architecture & Pipeline</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How SkillBridge AI Operates
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          The platform bridges the gap between passive resume reviews and hands-on skill verification. By connecting AI-driven gap identification with verifiable external code submissions, students prove readiness with audited artifacts.
        </p>
      </div>

      {/* 8-Step Core Flow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs dark:shadow-none space-y-2 hover:border-indigo-300 transition-all">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">{s.step}</h3>
                  <span className="text-[10px] font-semibold text-indigo-600">{s.tech}</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Deep-Dive: Anti-Plagiarism AST Explanation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xs dark:shadow-none space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Deep Dive: AST Structural Normalization Against Cheating & Renamed Copies</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Traditional text difference tools (like diff or simple string matching) fail when a student renames variables (e.g. renaming <code>total_orders</code> to <code>cnt</code>) or re-indents code. SkillBridge's similarity engine normalizes all variable identifiers into standard token representations (<code>ID(VAR)</code>) and tokenizes control structures. A 4-gram winnowing algorithm computes shingle intersection against reference benchmark solutions and past student submissions in O(N) time.
        </p>
      </div>
    </div>
  );
};
