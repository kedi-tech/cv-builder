
import { GoogleGenAI } from "@google/genai";
import { ResumeData, Language } from "../types";
import { TRANSLATIONS } from "../constants";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// List of models to try in order of preference
const MODELS = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
];

// Helper function to try multiple models
const tryModels = async (ai: GoogleGenAI, prompt: string, models: string[] = MODELS): Promise<string> => {
  let lastError: Error | null = null;
  
  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      
      const text = response.text || "";
      if (text) {
        console.log(`Successfully used model: ${model}`);
        return text;
      }
    } catch (error: any) {
      lastError = error;
      const errorCode = error?.error?.code || error?.status || error?.statusCode;
      const errorMessage = error?.error?.message || error?.message || '';
      
      console.warn(`Model ${model} failed:`, errorMessage);
      
      // If it's a model-specific error (503, 404, etc.), try next model
      if (errorCode === 503 || errorCode === 404 || errorCode === 'UNAVAILABLE' || 
          errorMessage.includes('overloaded') || errorMessage.includes('not found')) {
        console.log(`Trying next model...`);
        continue;
      }
      
      // For other errors, throw immediately
      throw error;
    }
  }
  
  // If all models failed, throw the last error
  throw lastError || new Error('All models failed');
};

export const generateSummary = async (data: ResumeData, lang: Language): Promise<string> => {
  try {
    const ai = getClient();
    const languageName = lang === 'fr' ? 'French' : 'English';
    const prompt = `
      You are a professional resume writer. Write a concise, impactful professional summary (max 60 words) for a resume based on the following profile.
      IMPORTANT: The output must be in ${languageName}.
      
      Role: ${data.personalInfo.role}
      Skills: ${data.skills.join(', ')}
      Recent Experience: ${data.experiences[0]?.title} at ${data.experiences[0]?.company}
      
      The tone should be professional, confident, and action-oriented. Do not include markdown formatting or quotes.
    `;

    return await tryModels(ai, prompt);
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
};

export const improveDescription = async (description: string, role: string, lang: Language): Promise<string> => {
  try {
    const ai = getClient();
    const languageName = lang === 'fr' ? 'French' : 'English';
    const prompt = `
      You are an expert career coach. Rewrite the following resume job description bullet points to be more impactful, using strong action verbs and professional language. Keep the meaning but improve the clarity and impact.
      IMPORTANT: The output must be in ${languageName}.
      
      Role context: ${role}
      Original Description:
      ${description}
      
      Output only the rewritten bullet points. Do not add conversational filler.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || description;
  } catch (error) {
    console.error("Error improving description:", error);
    throw error;
  }
};

export const generateCoverLetter = async (data: ResumeData, lang: Language): Promise<string> => {
  try {
    const ai = getClient();
    const languageName = lang === 'fr' ? 'French' : 'English';
    const t = TRANSLATIONS[lang];
    
    // Build comprehensive resume context
    const personalInfo = `
      Name: ${data.personalInfo.fullName}
      Current Role: ${data.personalInfo.role}
      Location: ${data.personalInfo.location}
      Email: ${data.personalInfo.email}
      Phone: ${data.personalInfo.phone}
      LinkedIn: ${data.personalInfo.linkedin || 'Not provided'}
      Professional Summary: ${data.personalInfo.summary || 'Not provided'}
    `;

    const experiences = data.experiences.length > 0 
      ? data.experiences.map((exp, idx) => `
        Experience ${idx + 1}:
        - Title: ${exp.title}
        - Company: ${exp.company}
        - Location: ${exp.location}
        - Period: ${exp.startDate} to ${exp.endDate}
        - Description: ${exp.description || 'No description provided'}
      `).join('\n')
      : 'No work experience provided';

    const education = data.education.length > 0
      ? data.education.map((edu, idx) => `
        Education ${idx + 1}:
        - Degree: ${edu.degree}
        - School: ${edu.school}
        - Period: ${edu.startDate} to ${edu.endDate}
      `).join('\n')
      : 'No education provided';

    const skills = data.skills.length > 0 
      ? data.skills.join(', ')
      : 'No skills listed';

    const languages = data.languages.length > 0
      ? data.languages.map(lang => `${lang.language} (${['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'][lang.proficiency - 1]})`).join(', ')
      : 'No languages listed';

    const achievements = data.achievements.length > 0
      ? data.achievements.map(ach => `- ${ach.title}: ${ach.description}`).join('\n')
      : 'No achievements listed';

    const courses = data.courses.length > 0
      ? data.courses.join(', ')
      : 'No courses listed';

    const prompt = `
      You are a professional career coach and cover letter writer. Write a compelling, personalized cover letter based on the complete resume information provided below.
      
      TARGET POSITION:
      - Job Title: ${data.coverLetter.jobTitle}
      - Company: ${data.coverLetter.companyName}
      - Recipient: ${data.coverLetter.recipientName || t.hiringManager}
      
      COMPLETE RESUME INFORMATION:
      ${personalInfo}
      
      WORK EXPERIENCE:
      ${experiences}
      
      EDUCATION:
      ${education}
      
      SKILLS:
      ${skills}
      
      LANGUAGES:
      ${languages}
      
      ACHIEVEMENTS:
      ${achievements}
      
      RELEVANT COURSES:
      ${courses}
      
      INSTRUCTIONS:
      - Language: Write the entire cover letter in ${languageName}
      - Tone: Professional, confident, and enthusiastic. Show genuine interest in the role and company.
      - Personalization: Reference specific experiences, skills, and achievements from the resume that directly relate to the job requirements.
      - Structure: Use standard business letter format:
        * Salutation (${t.dear} ${data.coverLetter.recipientName || t.hiringManager},)
        * Opening paragraph: Introduce yourself and express interest in the position
        * Body paragraphs (2-3): Highlight relevant experience, skills, and achievements that make you a strong fit
        * Closing paragraph: Reiterate interest, mention availability for interview, and thank them
        * Sign-off (${t.sincerely}, ${data.personalInfo.fullName})
      - Length: Approximately 300-400 words
      - Do NOT include addresses, dates, or header information - just the letter content starting from the salutation
      - Make it specific to the role and company, not generic
      - Connect the candidate's background to the job requirements naturally
    `;

    return await tryModels(ai, prompt);
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw error;
  }
};
