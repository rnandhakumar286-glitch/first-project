import { ai } from './geminiClient';
import { ExtractedResumeData, ExtractedSkill } from '../src/types';
import { PDFParse } from 'pdf-parse';

/**
 * Extract text from a base64-encoded PDF using pdf-parse.
 */
async function extractTextFromPdf(pdfBase64: string): Promise<string> {
  try {
    // Remove the data URL prefix if present
    const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Convert Buffer to Uint8Array for PDFParse v2
    const uint8Array = new Uint8Array(buffer);
    const parser = new PDFParse({ data: uint8Array });
    const result = await parser.getText();
    return result.text || '';
  } catch (err) {
    console.error('PDF text extraction failed:', err);
    return '';
  }
}

export async function parseResume(payload: {
  resumeText?: string;
  pdfBase64?: string;
}): Promise<ExtractedResumeData> {
  const { resumeText, pdfBase64 } = payload;

  const prompt = `You are an expert Technical Recruiter and ATS Resume Parser.
Analyze the provided candidate resume thoroughly. Extract all technical skills, programming languages, libraries, frameworks, databases, developer tools, and projects.

Carefully evaluate the candidate's level of proficiency based on how skills are used in projects or experience:
- 'beginner': Listed only in skills list, academic coursework, or basic hello-world projects.
- 'intermediate': Used in complete projects, applications, or internships.
- 'advanced': Multiple complex systems, architecture, performance tuning, or extensive experience.

Return a valid JSON object matching this exact schema:
{
  "candidateName": string,
  "email": string,
  "phone": string,
  "summary": string,
  "education": string[],
  "skills": [
    {
      "name": string,
      "category": "language" | "framework" | "database" | "tool" | "concept",
      "proficiency": "beginner" | "intermediate" | "advanced",
      "context": string (short note on where found, e.g. "Used in Pathfinding Visualizer")
    }
  ],
  "toolsAndPlatforms": string[],
  "projects": [
    {
      "title": string,
      "technologies": string[],
      "description": string
    }
  ],
  "experienceSummary": string
}`;

  let extractedText = resumeText || '';

  try {
    if (pdfBase64) {
      console.log('Extracting text from PDF locally before AI analysis...');
      extractedText = await extractTextFromPdf(pdfBase64);
    }

    const contents = `${prompt}\n\nRESUME CONTENT:\n${extractedText || 'No text provided.'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const skills: ExtractedSkill[] = Array.isArray(parsed.skills) ? parsed.skills : [];

    return {
      candidateName: parsed.candidateName || 'Student Candidate',
      email: parsed.email || '',
      phone: parsed.phone || '',
      summary: parsed.summary || 'Aspiring engineer preparing for placement interviews.',
      education: Array.isArray(parsed.education) ? parsed.education : [],
      skills,
      toolsAndPlatforms: Array.isArray(parsed.toolsAndPlatforms) ? parsed.toolsAndPlatforms : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      experienceSummary: parsed.experienceSummary || '',
      rawSkillCount: skills.length,
    };
  } catch (err: any) {
    console.error('Resume parsing failed via Gemini:', err);

    // Fallback: use the text we already extracted
    return fallbackRegexParser(extractedText);
  }
}

function fallbackRegexParser(text: string): ExtractedResumeData {
  // Comprehensive skill keyword dictionary
  const skillDictionary: { name: string; category: ExtractedSkill['category']; aliases?: string[] }[] = [
    // Languages
    { name: 'Python', category: 'language' },
    { name: 'JavaScript', category: 'language', aliases: ['JS', 'ES6', 'ES6+'] },
    { name: 'TypeScript', category: 'language', aliases: ['TS'] },
    { name: 'C++', category: 'language', aliases: ['CPP'] },
    { name: 'C#', category: 'language', aliases: ['CSharp', 'C Sharp'] },
    { name: 'Java', category: 'language' },
    { name: 'Go', category: 'language', aliases: ['Golang'] },
    { name: 'Rust', category: 'language' },
    { name: 'Ruby', category: 'language' },
    { name: 'PHP', category: 'language' },
    { name: 'Swift', category: 'language' },
    { name: 'Kotlin', category: 'language' },
    { name: 'Dart', category: 'language' },
    { name: 'R', category: 'language' },
    { name: 'Scala', category: 'language' },
    { name: 'HTML', category: 'language', aliases: ['HTML5'] },
    { name: 'CSS', category: 'language', aliases: ['CSS3'] },
    { name: 'SQL', category: 'language' },
    { name: 'Bash', category: 'language', aliases: ['Shell', 'Shell Scripting'] },
    { name: 'MATLAB', category: 'language' },
    { name: 'Perl', category: 'language' },
    { name: 'Lua', category: 'language' },

    // Frameworks & Libraries
    { name: 'React', category: 'framework', aliases: ['React.js', 'ReactJS'] },
    { name: 'Next.js', category: 'framework', aliases: ['NextJS'] },
    { name: 'Angular', category: 'framework', aliases: ['AngularJS'] },
    { name: 'Vue.js', category: 'framework', aliases: ['Vue', 'VueJS'] },
    { name: 'Svelte', category: 'framework' },
    { name: 'Node.js', category: 'framework', aliases: ['NodeJS', 'Node'] },
    { name: 'Express', category: 'framework', aliases: ['Express.js', 'ExpressJS'] },
    { name: 'NestJS', category: 'framework', aliases: ['Nest.js'] },
    { name: 'Flask', category: 'framework' },
    { name: 'Django', category: 'framework' },
    { name: 'FastAPI', category: 'framework' },
    { name: 'Spring Boot', category: 'framework', aliases: ['Spring'] },
    { name: 'Flutter', category: 'framework' },
    { name: 'React Native', category: 'framework' },
    { name: 'Tailwind CSS', category: 'framework', aliases: ['TailwindCSS', 'Tailwind'] },
    { name: 'Bootstrap', category: 'framework' },
    { name: 'Redux', category: 'framework', aliases: ['Redux Toolkit'] },
    { name: 'jQuery', category: 'framework' },
    { name: 'Pandas', category: 'framework' },
    { name: 'NumPy', category: 'framework' },
    { name: 'Scikit-Learn', category: 'framework', aliases: ['sklearn', 'scikit learn'] },
    { name: 'TensorFlow', category: 'framework' },
    { name: 'PyTorch', category: 'framework' },
    { name: 'Keras', category: 'framework' },
    { name: 'Matplotlib', category: 'framework' },
    { name: 'SciPy', category: 'framework' },
    { name: 'Tkinter', category: 'framework' },
    { name: 'Axios', category: 'framework' },
    { name: 'Socket.IO', category: 'framework' },
    { name: 'Three.js', category: 'framework' },
    { name: 'Electron', category: 'framework' },
    { name: 'OpenCV', category: 'framework' },
    { name: 'SFML', category: 'framework' },

    // Databases
    { name: 'PostgreSQL', category: 'database', aliases: ['Postgres'] },
    { name: 'MySQL', category: 'database' },
    { name: 'SQLite', category: 'database' },
    { name: 'MongoDB', category: 'database', aliases: ['Mongo'] },
    { name: 'Redis', category: 'database' },
    { name: 'Firebase', category: 'database' },
    { name: 'DynamoDB', category: 'database' },
    { name: 'Cassandra', category: 'database' },
    { name: 'Elasticsearch', category: 'database' },
    { name: 'Supabase', category: 'database' },
    { name: 'Oracle', category: 'database' },
    { name: 'MariaDB', category: 'database' },
    { name: 'Neo4j', category: 'database' },

    // Tools & Platforms
    { name: 'Git', category: 'tool' },
    { name: 'GitHub', category: 'tool' },
    { name: 'GitLab', category: 'tool' },
    { name: 'Docker', category: 'tool' },
    { name: 'Kubernetes', category: 'tool', aliases: ['K8s'] },
    { name: 'AWS', category: 'tool', aliases: ['Amazon Web Services'] },
    { name: 'Azure', category: 'tool' },
    { name: 'GCP', category: 'tool', aliases: ['Google Cloud'] },
    { name: 'Linux', category: 'tool' },
    { name: 'VS Code', category: 'tool', aliases: ['Visual Studio Code', 'VSCode'] },
    { name: 'Postman', category: 'tool' },
    { name: 'Figma', category: 'tool' },
    { name: 'Jira', category: 'tool' },
    { name: 'Webpack', category: 'tool' },
    { name: 'Vite', category: 'tool' },
    { name: 'Nginx', category: 'tool' },
    { name: 'Jenkins', category: 'tool' },
    { name: 'Terraform', category: 'tool' },
    { name: 'Jupyter', category: 'tool', aliases: ['Jupyter Notebooks', 'Jupyter Notebook'] },
    { name: 'Heroku', category: 'tool' },
    { name: 'Vercel', category: 'tool' },
    { name: 'Netlify', category: 'tool' },
    { name: 'Excel', category: 'tool' },
    { name: 'Tableau', category: 'tool' },
    { name: 'Power BI', category: 'tool' },
    { name: 'Ansible', category: 'tool' },
    { name: 'Grafana', category: 'tool' },

    // Concepts
    { name: 'REST API', category: 'concept', aliases: ['RESTful', 'RESTful API', 'RESTful APIs'] },
    { name: 'GraphQL', category: 'concept' },
    { name: 'Microservices', category: 'concept' },
    { name: 'CI/CD', category: 'concept' },
    { name: 'Agile', category: 'concept', aliases: ['Scrum'] },
    { name: 'OOP', category: 'concept', aliases: ['Object-Oriented Programming', 'Object Oriented'] },
    { name: 'Data Structures', category: 'concept', aliases: ['DSA'] },
    { name: 'Machine Learning', category: 'concept', aliases: ['ML'] },
    { name: 'Deep Learning', category: 'concept', aliases: ['DL'] },
    { name: 'OAuth', category: 'concept', aliases: ['OAuth2', 'JWT'] },
    { name: 'WebSocket', category: 'concept', aliases: ['WebSockets'] },
    { name: 'Unit Testing', category: 'concept', aliases: ['Jest', 'Mocha', 'Pytest'] },
    { name: 'Design Patterns', category: 'concept', aliases: ['SOLID'] },
    { name: 'DevOps', category: 'concept' },
    { name: 'Cloud Computing', category: 'concept' },
    { name: 'Blockchain', category: 'concept' },
    { name: 'NLP', category: 'concept', aliases: ['Natural Language Processing'] },
    { name: 'Computer Vision', category: 'concept' },
  ];

  const matchedSkills: ExtractedSkill[] = [];
  const addedNames = new Set<string>();

  // Extract resume sections for smarter proficiency detection
  const projectSections = text.match(/(?:projects?|portfolio)\s*[:\-]?\s*([\s\S]*?)(?=\n\s*\n\s*[A-Z]{2,}|\n\s*\n\s*$|$)/gi) || [];
  const projectText = projectSections.join(' ').toLowerCase();
  const experienceSection = text.match(/(?:experience|work|internship|employment)\s*[:\-]?\s*([\s\S]*?)(?=\n\s*\n\s*[A-Z]{2,}|\n\s*\n\s*$|$)/gi) || [];
  const expText = experienceSection.join(' ').toLowerCase();

  for (const s of skillDictionary) {
    if (addedNames.has(s.name.toLowerCase())) continue;

    const allTerms = [s.name, ...(s.aliases || [])];
    let found = false;

    for (const term of allTerms) {
      // Use word boundary matching to avoid false matches (e.g., "C" matching "CSS")
      // For single-char or short names, require more precise matching
      let regex: RegExp;
      if (term.length <= 2) {
        // For very short terms like "C", "R", "Go" — require word boundaries and specific patterns
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        regex = new RegExp(`(?:^|[\\s,;|/()•\\-])${escapedTerm}(?:[\\s,;|/()•\\-]|$)`, 'im');
      } else {
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        regex = new RegExp(`\\b${escapedTerm}\\b`, 'i');
      }
      if (regex.test(text)) {
        found = true;
        break;
      }
    }

    if (found) {
      let proficiency: ExtractedSkill['proficiency'] = 'beginner';
      let context = 'Found in skills section';

      // Check where skill appears to determine proficiency
      const nameCheck = s.name.toLowerCase();
      if (expText.includes(nameCheck)) {
        proficiency = 'advanced';
        context = 'Used in work experience';
      } else if (projectText.includes(nameCheck)) {
        proficiency = 'intermediate';
        context = 'Used in projects';
      }

      matchedSkills.push({
        name: s.name,
        category: s.category,
        proficiency,
        context,
      });
      addedNames.add(s.name.toLowerCase());
    }
  }

  // --- DEMO SKILLS FALLBACK ---
  // If the resume has no text (e.g. image PDF) or no skills were matched,
  // we add demo skills as requested so the UI is fully populated.
  if (matchedSkills.length === 0) {
    matchedSkills.push(
      { name: 'Python', category: 'language', proficiency: 'advanced', context: 'Demo data' },
      { name: 'Java', category: 'language', proficiency: 'intermediate', context: 'Demo data' },
      { name: 'TypeScript', category: 'language', proficiency: 'intermediate', context: 'Demo data' },
      { name: 'React', category: 'framework', proficiency: 'advanced', context: 'Demo data' },
      { name: 'Node.js', category: 'framework', proficiency: 'intermediate', context: 'Demo data' },
      { name: 'PostgreSQL', category: 'database', proficiency: 'advanced', context: 'Demo data' },
      { name: 'Docker', category: 'tool', proficiency: 'intermediate', context: 'Demo data' },
      { name: 'Git', category: 'tool', proficiency: 'advanced', context: 'Demo data' },
      { name: 'Machine Learning', category: 'concept', proficiency: 'beginner', context: 'Demo data' }
    );
  }

  // Name extraction: first non-empty line that looks like a name
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const firstLine = lines[0] || 'Student Candidate';
  const candidateName = firstLine.length < 50 && !firstLine.includes(':') && !firstLine.match(/^(summary|objective|resume)/i)
    ? firstLine
    : 'Student Candidate';

  // Email extraction
  const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.\w+/);
  const email = emailMatch ? emailMatch[0] : '';

  // Phone extraction
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // Summary extraction
  const summaryMatch = text.match(/(?:summary|objective|about|profile)\s*[:\-]?\s*([\s\S]*?)(?:\n\s*\n|\n[A-Z]{2,})/i);
  const summary = summaryMatch
    ? summaryMatch[1].trim().slice(0, 300)
    : matchedSkills.length > 0
      ? `Candidate with skills in ${matchedSkills.slice(0, 5).map((s) => s.name).join(', ')}.`
      : 'Parsed from submitted resume.';

  // Education extraction
  const education: string[] = [];
  const eduMatch = text.match(/(?:education|degree|university|college|b\.?s\.?|b\.?tech|m\.?s\.?|bachelor|master)[:\s]*([\s\S]*?)(?:\n\s*\n|\n(?:TECHNICAL|SKILLS|PROJECT|EXPERIENCE|WORK))/i);
  if (eduMatch) {
    const eduLines = eduMatch[0].split('\n').map((l) => l.trim()).filter((l) => l.length > 10);
    education.push(...eduLines.slice(0, 3));
  }

  // Project extraction: look for numbered items or bullet points
  const projects: { title: string; technologies: string[]; description: string }[] = [];
  const projectSection = text.match(/(?:projects?|portfolio)\s*[:\-]?\s*([\s\S]*?)(?:\n\s*\n\s*[A-Z]{2,}|$)/i);
  if (projectSection) {
    const projText = projectSection[1];
    // Match numbered items like "1. Title" or "- Title" or "• Title"
    const projItems = projText.split(/\n\s*(?:\d+[.)]\s*|[-•]\s+)/).filter((p) => p.trim().length > 5);
    for (const item of projItems.slice(0, 5)) {
      const itemLines = item.split('\n').map((l) => l.trim()).filter((l) => l);
      const title = itemLines[0]?.replace(/^\*+|\*+$/g, '').trim() || 'Project';
      const desc = itemLines.slice(1).join(' ').replace(/^[-•]\s*/gm, '').trim();

      // Find technologies mentioned in the project
      const techs: string[] = [];
      const techMatch = title.match(/\(([^)]+)\)/);
      if (techMatch) {
        techs.push(...techMatch[1].split(/[,&]/).map((t) => t.trim()).filter(Boolean));
      }
      // Also check desc for known skills
      for (const skill of matchedSkills) {
        const skillRegex = new RegExp(`\\b${skill.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (skillRegex.test(title + ' ' + desc) && !techs.some((t) => t.toLowerCase() === skill.name.toLowerCase())) {
          techs.push(skill.name);
        }
      }

      if (title.length > 2) {
        projects.push({
          title: title.length > 80 ? title.slice(0, 80) + '...' : title,
          technologies: techs.length > 0 ? techs : ['Not specified'],
          description: desc.length > 0 ? (desc.length > 200 ? desc.slice(0, 200) + '...' : desc) : 'Project described in resume.',
        });
      }
    }
  }

  // If no projects found, create one generic entry from matched skills
  if (projects.length === 0 && matchedSkills.length > 0) {
    projects.push({
      title: 'Academic / Personal Projects',
      technologies: matchedSkills.slice(0, 6).map((m) => m.name),
      description: 'Projects listed in candidate resume.',
    });
  }

  // Tools and platforms list
  const toolSkills = matchedSkills.filter((s) => s.category === 'tool');
  const toolsAndPlatforms = toolSkills.map((s) => s.name);

  return {
    candidateName,
    email,
    phone,
    summary,
    education,
    skills: matchedSkills,
    toolsAndPlatforms: toolsAndPlatforms.length > 0 ? toolsAndPlatforms : ['Git'],
    projects,
    experienceSummary: '',
    rawSkillCount: matchedSkills.length,
  };
}
