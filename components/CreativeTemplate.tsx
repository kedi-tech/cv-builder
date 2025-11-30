
import React from 'react';
import { ResumeData, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  Phone, 
  Mail, 
  Linkedin, 
  MapPin, 
  Target,
  Zap,
  Globe,
  Award,
  Layers
} from 'lucide-react';

interface TemplateProps {
  data: ResumeData;
  lang: Language;
}

const LEFT_SECTIONS = new Set(['experience', 'education', 'summary']);

const CreativeTemplate: React.FC<TemplateProps> = ({ data, lang }) => {
  const t = TRANSLATIONS[lang];

  const HexagonPattern = () => (
    <svg className="absolute top-0 right-0 w-[400px] h-[400px] opacity-10 pointer-events-none text-blue-600" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
       <pattern id="hexagons" width="20" height="17.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
        <polygon points="10 0 20 5 20 15 10 20 0 15 0 5" fill="none" stroke="currentColor" strokeWidth="0.5"/>
      </pattern>
      <rect width="100%" height="100%" fill="url(#hexagons)"/>
       <circle cx="80" cy="20" r="15" fill="currentColor" fillOpacity="0.1" />
       <circle cx="80" cy="60" r="10" fill="currentColor" fillOpacity="0.1" />
       <circle cx="40" cy="10" r="8" fill="currentColor" fillOpacity="0.1" />
    </svg>
  );

  const renderLeftSection = (key: string) => {
    switch (key) {
      case 'summary':
        return data.personalInfo.summary && (
           <div key="summary" className="mb-8">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter border-b-4 border-gray-900 pb-1 mb-4 inline-block">
                {t.summary}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {data.personalInfo.summary}
              </p>
           </div>
        );
      case 'experience':
        return data.experiences.length > 0 && (
          <div key={key} className="mb-8">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter border-b-4 border-gray-900 pb-1 mb-5 inline-block">
               {t.experience}
            </h3>
            <div className="flex flex-col gap-8 relative border-l-2 border-gray-100 pl-6 ml-2">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="relative">
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
                  <h4 className="font-bold text-gray-900 text-lg leading-tight">{exp.title}</h4>
                  <div className="text-blue-600 font-bold text-sm mb-1">{exp.company}</div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">
                     <span className="bg-gray-100 px-2 py-0.5 rounded">{exp.startDate} – {exp.endDate}</span>
                     <span>{exp.location}</span>
                  </div>

                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
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
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter border-b-4 border-gray-900 pb-1 mb-5 inline-block">
               {t.education}
            </h3>
            <div className="flex flex-col gap-6">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h4 className="font-bold text-gray-900 text-md">{edu.school}</h4>
                   <div className="text-blue-600 font-medium text-sm">{edu.degree}</div>
                   <div className="text-xs text-gray-500 font-medium mt-1 bg-gray-50 inline-block px-2 py-0.5 rounded">
                      {edu.startDate} – {edu.endDate}
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
          <div key={key} className="mb-8">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter border-b-4 border-gray-900 pb-1 mb-5 inline-block">
              {t.achievements}
            </h3>
            <div className="flex flex-col gap-6">
              {data.achievements.map((ach) => (
                <div key={ach.id}>
                  <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">
                        {ach.title}
                      </h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-snug pl-6">
                    {ach.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'skills':
        return data.skills.length > 0 && (
          <div key={key} className="mb-8">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter border-b-4 border-gray-900 pb-1 mb-5 inline-block">
              {t.skills}
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, idx) => (
                <span key={idx} className="bg-white border border-gray-200 shadow-sm text-gray-800 px-3 py-1.5 rounded text-xs font-bold">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        );
      case 'languages':
        return data.languages.length > 0 && (
          <div key={key} className="mb-8">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter border-b-4 border-gray-900 pb-1 mb-5 inline-block">
              {t.languages}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {data.languages.map((lang) => (
                <div key={lang.id} className="flex flex-col">
                  <div className="flex justify-between text-xs font-bold text-gray-800 mb-1">
                    <span>{lang.language}</span>
                    <span className="text-blue-600">{lang.proficiency}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full" style={{ width: `${(lang.proficiency/5)*100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'courses':
        return data.courses.length > 0 && (
          <div key={key} className="mb-8">
             <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter border-b-4 border-gray-900 pb-1 mb-5 inline-block">
              {t.courses}
            </h3>
            <ul className="text-xs text-gray-700 space-y-2 font-medium">
              {data.courses.map((course, idx) => (
                <li key={idx} className="border-l-2 border-blue-400 pl-2">
                    {course}
                </li>
              ))}
            </ul>
          </div>
        );
      case 'interests':
        return data.interests.length > 0 && (
          <div key={key} className="mb-8">
             <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter border-b-4 border-gray-900 pb-1 mb-5 inline-block">
              {t.interests}
            </h3>
            <div className="flex flex-wrap gap-2">
               {data.interests.map((interest, idx) => (
                 <span key={idx} className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-1 rounded">
                   #{interest}
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
     renderLeftSection('summary'),
     ...data.sectionOrder.filter(k => k !== 'summary' && LEFT_SECTIONS.has(k)).map(k => renderLeftSection(k))
  ];

  const rightColumnContent = data.sectionOrder
    .filter(key => !LEFT_SECTIONS.has(key))
    .map(key => renderRightSection(key));

  return (
    <div className="flex flex-col h-full min-h-[297mm] bg-white text-gray-800 font-sans relative overflow-hidden">
        
        {/* Decorative Background */}
        <HexagonPattern />

        {/* Header */}
        <div className="p-12 pb-6 relative z-10">
            <h1 className="text-5xl font-black text-blue-900 uppercase tracking-tighter mb-2 leading-none">
                {data.personalInfo.fullName}
            </h1>
            <div className="text-lg font-bold text-blue-500 uppercase tracking-widest mb-6">
                {data.personalInfo.role}
            </div>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-gray-600 border-t border-gray-200 pt-4">
                 {data.personalInfo.email && (
                    <div className="flex items-center gap-1.5 hover:text-blue-600 transition">
                        <Mail className="w-4 h-4" />
                        <span>{data.personalInfo.email}</span>
                    </div>
                )}
                {data.personalInfo.linkedin && (
                    <div className="flex items-center gap-1.5 hover:text-blue-600 transition">
                        <Linkedin className="w-4 h-4" />
                        <span className="truncate">{data.personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
                    </div>
                )}
                 {data.personalInfo.location && (
                    <div className="flex items-center gap-1.5 hover:text-blue-600 transition">
                        <MapPin className="w-4 h-4" />
                        <span>{data.personalInfo.location}</span>
                    </div>
                )}
            </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 relative z-10">
             {/* Left Column (Main) */}
            <div className="w-[60%] pl-12 pr-8 py-8">
                {leftColumnContent}
            </div>

             {/* Right Column (Sidebar) */}
            <div className="w-[40%] pr-12 pl-8 py-8">
                {rightColumnContent}
            </div>
        </div>
    </div>
  );
};

export default CreativeTemplate;
