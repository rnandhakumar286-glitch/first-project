import { ExtractedResumeData, JobRole, GapAnalysisResult, SkillGap, SkillProficiency } from '../src/types';
import { JOB_ROLES } from '../src/data/rolesData';

const proficiencyNumeric: Record<SkillProficiency | 'none', number> = {
  none: 0,
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export function analyzeSkillGaps(
  extractedData: ExtractedResumeData,
  roleId: string,
  extraSkills: string[] = [],
  allRoles?: JobRole[]
): GapAnalysisResult {
  const rolesPool = allRoles && allRoles.length > 0 ? allRoles : JOB_ROLES;
  const role = rolesPool.find((r) => r.id === roleId) || JOB_ROLES[0];
  const candidateSkills = [...extractedData.skills];

  // Merge in any manually entered extra skills from the UI
  extraSkills.forEach((extra) => {
    const trimmed = extra.trim();
    if (trimmed && !candidateSkills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      candidateSkills.push({
        name: trimmed,
        category: 'concept',
        proficiency: 'intermediate',
        context: 'Directly specified by student',
      });
    }
  });

  const rankedGaps: SkillGap[] = [];
  const strengths: string[] = [];

  let totalWeight = 0;
  let earnedWeight = 0;

  for (const req of role.requiredSkills) {
    totalWeight += req.interviewWeight;

    // Search for match in candidate skills
    const reqWords = req.name.toLowerCase().split(/[\s,&/()]+/);
    const matched = candidateSkills.find((candSkill) => {
      const cName = candSkill.name.toLowerCase();
      // Direct substring match
      if (req.name.toLowerCase().includes(cName) || cName.includes(req.name.toLowerCase())) {
        return true;
      }
      // Check if key tech keywords match (e.g., "SQL" or "React" or "Python")
      return reqWords.some((w) => w.length > 2 && cName.includes(w));
    });

    const currentLevel: SkillProficiency | 'none' = matched?.proficiency || (matched ? 'intermediate' : 'none');
    const reqLevelNum = proficiencyNumeric[req.requiredLevel];
    const currLevelNum = proficiencyNumeric[currentLevel];

    if (currLevelNum >= reqLevelNum) {
      // Sufficient or exceeds
      strengths.push(req.name);
      earnedWeight += req.interviewWeight;
    } else {
      // Missing or partial gap
      const isMissing = currLevelNum === 0;
      const status = isMissing ? 'missing' : 'partial';

      // Priority calculation: Critical + missing = High, Important + missing = High/Medium, etc.
      let priority: SkillGap['priority'] = 'low';
      let scoreMultiplier = 1;

      if (req.importance === 'critical') {
        priority = 'high';
        scoreMultiplier = 3;
      } else if (req.importance === 'important') {
        priority = isMissing ? 'high' : 'medium';
        scoreMultiplier = 2;
      } else {
        priority = 'low';
        scoreMultiplier = 1;
      }

      // If partial, student earned partial weight
      if (currLevelNum > 0) {
        earnedWeight += req.interviewWeight * 0.5;
      }

      let gapReason = '';
      if (isMissing) {
        gapReason = `No evidence of ${req.name} found in resume projects or declared skills. Required at ${req.requiredLevel} level for ${role.title}.`;
      } else {
        gapReason = `Candidate exhibits ${currentLevel} knowledge, but ${role.title} interviews require ${req.requiredLevel} depth (e.g., edge cases, performance tuning).`;
      }

      rankedGaps.push({
        skillId: req.id,
        skillName: req.name,
        category: req.category,
        importance: req.importance,
        requiredLevel: req.requiredLevel,
        currentLevel,
        status,
        priority,
        priorityRank: req.interviewWeight * scoreMultiplier,
        gapReason,
        recommendedFocus: req.description,
      });
    }
  }

  // Sort gaps by priority rank descending
  rankedGaps.sort((a, b) => b.priorityRank - a.priorityRank);

  // Assign clean 1..N order
  rankedGaps.forEach((g, index) => {
    g.priorityRank = index + 1;
  });

  const readinessScore = Math.min(100, Math.max(10, Math.round((earnedWeight / totalWeight) * 100)));

  let summaryText = '';
  if (readinessScore >= 80) {
    summaryText = `Strong placement alignment! Candidate matches ${strengths.length} of ${role.requiredSkills.length} key benchmarks. Focus on advanced fine-tuning.`;
  } else if (readinessScore >= 50) {
    summaryText = `Promising foundation with ${rankedGaps.length} targeted skill gaps. Master the top critical gaps to become competitive for technical interview rounds.`;
  } else {
    summaryText = `Identified foundational gaps in ${rankedGaps.filter((g) => g.priority === 'high').length} critical areas required by placement interviewers. Follow the customized task track below.`;
  }

  return {
    roleId: role.id,
    roleTitle: role.title,
    overallReadinessScore: readinessScore,
    totalRequirements: role.requiredSkills.length,
    matchedCount: strengths.length,
    gapsCount: rankedGaps.length,
    rankedGaps,
    strengths,
    analysisSummary: summaryText,
  };
}
