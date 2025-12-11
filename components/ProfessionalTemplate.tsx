
import React from 'react';
import { ResumeData, Language } from '../types';
import { DEFAULT_THEME, TRANSLATIONS } from '../constants';
import { 
  Phone, 
  Mail, 
  Linkedin, 
  MapPin, 
  Star,
  Award,
  Globe,
  Briefcase,
  GraduationCap
} from 'lucide-react';

interface TemplateProps {
  data: ResumeData;
  lang: Language;
}

const LEFT_SECTIONS = new Set(['experience', 'education', 'summary']);
// Right sections include the others by default if not in Left

const ProfessionalTemplate: React.FC<TemplateProps> = ({ data, lang }) => {
  const t = TRANSLATIONS[lang];
  const theme = data.theme || DEFAULT_THEME;

  const renderLeftSection = (key: string) => {
    switch (key) {
      case 'summary':
        return data.personalInfo.summary && (
           <div key="summary" className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 uppercase border-b-2 border-gray-900 pb-1 mb-3 tracking-wider">
                {t.summary}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed text-justify">
                {data.personalInfo.summary}
              </p>
           </div>
        );
      case 'experience':
        return data.experiences.length > 0 && (
          <div key={key} className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase border-b-2 border-gray-900 pb-1 mb-4 tracking-wider flex items-center gap-2">
               {t.experience}
            </h3>
            <div className="flex flex-col gap-6">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-md" style={{ color: theme.primary }}>{exp.title}</h4>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-sm text-gray-700 font-medium">
                     <span>{exp.company}</span>
                     <span className="text-gray-500 text-xs italic">{exp.startDate} – {exp.endDate} | {exp.location}</span>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line pl-1" style={{ borderLeft: `2px solid ${theme.primary}` }}>
                    {exp.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'education':
        return data.education.length > 0 && (
          <div key={key} className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase border-b-2 border-gray-900 pb-1 mb-4 tracking-wider">
               {t.education}
            </h3>
            <div className="flex flex-col gap-4">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-sm" style={{ color: theme.accent }}>{edu.school}</h4>
                    <span className="text-xs text-gray-500 font-medium">
                      {edu.startDate} – {edu.endDate}
                    </span>
                  </div>
                  <div className="text-sm font-medium" style={{ color: theme.primary }}>
                    {edu.degree}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderRightSection = (key: string) => {
    switch (key) {
      case 'achievements':
        return data.achievements.length > 0 && (
          <div key={key} className="mb-6">
            <h3 className="text-xs font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-3 tracking-wider">
              {t.achievements}
            </h3>
            <div className="flex flex-col gap-3">
              {data.achievements.map((ach) => (
                <div key={ach.id} className="relative pl-4">
                  <Star className="w-3 h-3 absolute left-0 top-1" style={{ color: theme.primary }} />
                  <h4 className="text-xs font-bold text-gray-800 mb-0.5">
                    {ach.title}
                  </h4>
                  <p className="text-[11px] text-gray-600 leading-snug">
                    {ach.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'skills':
        return data.skills.length > 0 && (
          <div key={key} className="mb-6">
            <h3 className="text-xs font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-3 tracking-wider">
              {t.skills}
            </h3>
            <div className="flex flex-col gap-2">
              {data.skills.map((skill, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-700 border-b border-dotted border-gray-200 pb-0.5">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'languages':
        return data.languages.length > 0 && (
          <div key={key} className="mb-6">
            <h3 className="text-xs font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-3 tracking-wider">
              {t.languages}
            </h3>
            <div className="space-y-2">
              {data.languages.map((lang) => (
                <div key={lang.id} className="text-xs">
                  <div className="font-semibold text-gray-800">{lang.language}</div>
                  <div className="text-gray-500 text-[10px] uppercase tracking-wide">
                     {t.level} {lang.proficiency}/5
                  </div>
                  <div className="w-full bg-gray-200 h-1 mt-0.5 rounded-full overflow-hidden">
                    <div className="h-full" style={{ width: `${(lang.proficiency/5)*100}%`, backgroundColor: theme.primary }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'courses':
        return data.courses.length > 0 && (
          <div key={key} className="mb-6">
             <h3 className="text-xs font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-3 tracking-wider">
              {t.courses}
            </h3>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              {data.courses.map((course, idx) => (
                <li key={idx}>{course}</li>
              ))}
            </ul>
          </div>
        );
      case 'interests':
        return data.interests.length > 0 && (
          <div key={key} className="mb-6">
             <h3 className="text-xs font-bold text-gray-900 uppercase border-b border-gray-300 pb-1 mb-3 tracking-wider">
              {t.interests}
            </h3>
            <div className="flex flex-wrap gap-2">
               {data.interests.map((interest, idx) => (
                 <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-medium border" style={{ backgroundColor: `${theme.primary}0D`, color: theme.primary, borderColor: `${theme.primary}33` }}>
                   {interest}
                 </span>
               ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const leftColumnContent = [
    // Explicitly add summary first if it exists, although we handle it manually above,
    // let's follow the sectionOrder but strictly filtering into columns
    ...data.sectionOrder.filter(key => LEFT_SECTIONS.has(key)).map(key => renderLeftSection(key))
  ];

  const rightColumnContent = data.sectionOrder
    .filter(key => !LEFT_SECTIONS.has(key)) // Everything else goes right
    .map(key => renderRightSection(key));

  return (
    <div className="flex flex-col h-full min-h-[297mm]" style={{ backgroundColor: theme.background, color: theme.text }}>
        
        {/* Header */}
        <div className="px-10 pt-10 pb-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h1 className="text-4xl font-bold uppercase tracking-tight mb-2" style={{ color: theme.accent }}>
                        {data.personalInfo.fullName}
                    </h1>
                    <div className="text-xl font-medium mb-4" style={{ color: theme.primary }}>
                        {data.personalInfo.role}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                        {data.personalInfo.email && (
                            <div className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                                <span>{data.personalInfo.email}</span>
                            </div>
                        )}
                        {data.personalInfo.phone && (
                            <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                                <span>{data.personalInfo.phone}</span>
                            </div>
                        )}
                        {data.personalInfo.linkedin && (
                            <div className="flex items-center gap-1.5">
                                <Linkedin className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                                <span className="max-w-[150px] truncate">{data.personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
                            </div>
                        )}
                        {data.personalInfo.location && (
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                                <span>{data.personalInfo.location}</span>
                            </div>
                        )}
                    </div>
                </div>
                 {data.personalInfo.photoUrl && (
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 ml-4 shrink-0">
                        <img 
                            src={data.personalInfo.photoUrl} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
            </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-1">
            {/* Main Left Column */}
            <div className="w-[65%] p-10 pr-8">
               {/* Always render summary first in the left column if it exists, regardless of order array for this template style */}
               {renderLeftSection('summary')}
               {/* Then other left sections */}
               {data.sectionOrder.filter(k => k !== 'summary' && LEFT_SECTIONS.has(k)).map(k => renderLeftSection(k))}
            </div>

            {/* Right Sidebar */}
            <div className="w-[35%] p-8 border-l border-gray-100" style={{ backgroundColor: theme.background }}>
                {rightColumnContent}
            </div>
        </div>
    </div>
  );
};

export default ProfessionalTemplate;
