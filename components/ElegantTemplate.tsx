
import React from 'react';
import { ResumeData, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  Phone, 
  Mail, 
  Linkedin, 
  MapPin, 
  Award,
  Zap,
  Globe
} from 'lucide-react';

interface TemplateProps {
  data: ResumeData;
  lang: Language;
}

const LEFT_SECTIONS = new Set(['experience', 'education', 'summary']);

const ElegantTemplate: React.FC<TemplateProps> = ({ data, lang }) => {
  const t = TRANSLATIONS[lang];

  const renderLeftSection = (key: string) => {
    switch (key) {
      case 'summary':
        return data.personalInfo.summary && (
           <div key="summary" className="mb-8">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
                {t.summary}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed text-justify">
                {data.personalInfo.summary}
              </p>
              <hr className="mt-6 border-gray-200" />
           </div>
        );
      case 'experience':
        return data.experiences.length > 0 && (
          <div key={key} className="mb-8">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
               {t.experience}
            </h3>
            <div className="flex flex-col gap-6">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-900 text-lg">{exp.title}</h4>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-emerald-600 font-medium text-sm">{exp.company}</span>
                     <span className="text-gray-500 text-xs flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                        {exp.startDate} – {exp.endDate}
                        <span className="w-1 h-1 rounded-full bg-gray-400 ml-1"></span>
                        {exp.location}
                     </span>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line pl-1 mt-2">
                    {exp.description}
                  </div>
                </div>
              ))}
            </div>
            <hr className="mt-8 border-gray-200" />
          </div>
        );
      case 'education':
        return data.education.length > 0 && (
          <div key={key} className="mb-8">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
               {t.education}
            </h3>
            <div className="flex flex-col gap-5">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h4 className="font-bold text-gray-900 text-md">{edu.school}</h4>
                   <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                      <span>{edu.degree}</span>
                      <span className="text-xs text-gray-500 italic">
                        {edu.startDate} – {edu.endDate}
                      </span>
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
            <h3 className="text-xs font-bold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-4 tracking-wider">
              {t.achievements}
            </h3>
            <div className="flex flex-col gap-5">
              {data.achievements.map((ach) => (
                <div key={ach.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                     <Award size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-1">
                        {ach.title}
                    </h4>
                    <p className="text-xs text-gray-600 leading-snug">
                        {ach.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'skills':
        return data.skills.length > 0 && (
          <div key={key} className="mb-8">
            <h3 className="text-xs font-bold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-4 tracking-wider">
              {t.skills}
            </h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-3">
              {data.skills.map((skill, idx) => (
                <div key={idx} className="text-xs text-gray-700 font-medium border-b border-gray-100 pb-1">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        );
      case 'languages':
        return data.languages.length > 0 && (
          <div key={key} className="mb-8">
            <h3 className="text-xs font-bold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-4 tracking-wider">
              {t.languages}
            </h3>
            <div className="flex flex-col gap-3">
              {data.languages.map((lang) => (
                <div key={lang.id} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-800">{lang.language}</span>
                  <div className="flex gap-1">
                     {[1,2,3,4,5].map(i => (
                         <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= lang.proficiency ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                     ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'courses':
        return data.courses.length > 0 && (
          <div key={key} className="mb-8">
             <h3 className="text-xs font-bold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-4 tracking-wider">
              {t.courses}
            </h3>
            <ul className="text-xs text-gray-600 space-y-2">
              {data.courses.map((course, idx) => (
                <li key={idx} className="flex gap-2">
                    <span className="text-emerald-500">•</span>
                    {course}
                </li>
              ))}
            </ul>
          </div>
        );
      case 'interests':
        return data.interests.length > 0 && (
          <div key={key} className="mb-8">
             <h3 className="text-xs font-bold text-gray-900 uppercase border-b border-gray-300 pb-2 mb-4 tracking-wider">
              {t.interests}
            </h3>
            <div className="flex flex-wrap gap-2">
               {data.interests.map((interest, idx) => (
                 <span key={idx} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
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

  // Split content based on layout
  const leftColumnContent = [
     renderLeftSection('summary'),
     ...data.sectionOrder.filter(k => k !== 'summary' && LEFT_SECTIONS.has(k)).map(k => renderLeftSection(k))
  ];

  const rightColumnContent = data.sectionOrder
    .filter(key => !LEFT_SECTIONS.has(key))
    .map(key => renderRightSection(key));

  return (
    <div className="flex flex-col h-full min-h-[297mm] bg-white text-gray-800 font-sans">
        
        {/* Header */}
        <div className="p-10 pb-6">
            <div className="border-b border-gray-300 pb-8 flex justify-between items-start">
                <div>
                     <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-2">
                        {data.personalInfo.fullName}
                    </h1>
                    <div className="text-xl text-emerald-600 font-medium tracking-wide uppercase mb-4">
                        {data.personalInfo.role}
                    </div>
                     <div className="flex flex-wrap gap-5 text-sm text-gray-600">
                        {data.personalInfo.phone && (
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-gray-400" />
                                <span>{data.personalInfo.phone}</span>
                            </div>
                        )}
                        {data.personalInfo.email && (
                            <div className="flex items-center gap-2">
                                <Mail size={14} className="text-gray-400" />
                                <span>{data.personalInfo.email}</span>
                            </div>
                        )}
                         {data.personalInfo.linkedin && (
                            <div className="flex items-center gap-2">
                                <Linkedin size={14} className="text-gray-400" />
                                <span className="max-w-[150px] truncate">{data.personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
                            </div>
                        )}
                         {data.personalInfo.location && (
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-gray-400" />
                                <span>{data.personalInfo.location}</span>
                            </div>
                        )}
                    </div>
                </div>
                 {data.personalInfo.photoUrl && (
                    <div className="w-28 h-28 rounded-full overflow-hidden shadow-sm border border-gray-200">
                         <img 
                            src={data.personalInfo.photoUrl} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
            </div>
        </div>

        {/* Content */}
        <div className="flex flex-1">
             {/* Left Column (Main) */}
            <div className="w-[62%] pl-10 pr-8 pt-4 pb-10">
                {leftColumnContent}
            </div>

             {/* Right Column (Sidebar) */}
            <div className="w-[38%] pr-10 pl-6 pt-4 pb-10 border-l border-gray-200">
                {rightColumnContent}
            </div>
        </div>
    </div>
  );
};

export default ElegantTemplate;
