
import React from 'react';
import { ResumeData, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface TemplateProps {
  data: ResumeData;
  lang: Language;
}

const ClassicTemplate: React.FC<TemplateProps> = ({ data, lang }) => {
  const t = TRANSLATIONS[lang];

  const renderSection = (key: string) => {
    switch (key) {
      case 'experience':
        return data.experiences.length > 0 && (
          <div key={key} className="mb-6">
            <h3 className="font-serif text-lg font-bold text-gray-900 border-b-2 border-gray-300 pb-1 mb-4 uppercase tracking-wider">
              {t.experience}
            </h3>
            <div className="flex flex-col gap-5">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-800 text-sm font-serif text-[15px]">{exp.company}</h4>
                    <span className="text-xs text-gray-600 italic font-serif">
                      {exp.location} &bull; {exp.startDate} – {exp.endDate}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-700 mb-2 font-serif italic">
                    {exp.title}
                  </div>
                  <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line pl-4 border-l-2 border-gray-200">
                    {exp.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'education':
        return data.education.length > 0 && (
          <div key={key} className="mb-6">
            <h3 className="font-serif text-lg font-bold text-gray-900 border-b-2 border-gray-300 pb-1 mb-4 uppercase tracking-wider">
              {t.education}
            </h3>
            <div className="flex flex-col gap-4">
              {data.education.map((edu) => (
                <div key={edu.id}>
                   <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-800 text-[15px] font-serif">{edu.school}</h4>
                    <span className="text-xs text-gray-600 italic font-serif">
                      {edu.startDate} – {edu.endDate}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 font-serif">
                    {edu.degree}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'skills':
        return data.skills.length > 0 && (
          <div key={key} className="mb-6">
            <h3 className="font-serif text-lg font-bold text-gray-900 border-b-2 border-gray-300 pb-1 mb-4 uppercase tracking-wider">
              {t.skills}
            </h3>
            <div className="text-sm text-gray-800 font-serif leading-6">
              {data.skills.join(' • ')}
            </div>
          </div>
        );
      case 'achievements':
        return data.achievements.length > 0 && (
          <div key={key} className="mb-6">
            <h3 className="font-serif text-lg font-bold text-gray-900 border-b-2 border-gray-300 pb-1 mb-4 uppercase tracking-wider">
              {t.achievements}
            </h3>
            <div className="flex flex-col gap-3">
              {data.achievements.map((ach) => (
                <div key={ach.id}>
                  <h4 className="text-sm font-bold text-gray-800 font-serif mb-1">
                    {ach.title}
                  </h4>
                  <p className="text-xs text-gray-700 font-serif leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'languages':
        return data.languages.length > 0 && (
          <div key={key} className="mb-6">
            <h3 className="font-serif text-lg font-bold text-gray-900 border-b-2 border-gray-300 pb-1 mb-4 uppercase tracking-wider">
              {t.languages}
            </h3>
            <div className="flex flex-wrap gap-6">
              {data.languages.map((lang) => (
                <div key={lang.id} className="text-sm font-serif">
                  <span className="font-bold">{lang.language}:</span> <span className="italic text-gray-600">{t.level} {lang.proficiency}/5</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'courses':
        return data.courses.length > 0 && (
          <div key={key} className="mb-6">
            <h3 className="font-serif text-lg font-bold text-gray-900 border-b-2 border-gray-300 pb-1 mb-4 uppercase tracking-wider">
              {t.courses}
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-700 font-serif grid grid-cols-2 gap-1">
              {data.courses.map((course, idx) => (
                <li key={idx}>{course}</li>
              ))}
            </ul>
          </div>
        );
      case 'interests':
        return data.interests.length > 0 && (
           <div key={key} className="mb-6">
            <h3 className="font-serif text-lg font-bold text-gray-900 border-b-2 border-gray-300 pb-1 mb-4 uppercase tracking-wider">
              {t.interests}
            </h3>
             <div className="text-sm text-gray-800 font-serif leading-6">
              {data.interests.join(' • ')}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[297mm] p-12 bg-white text-gray-900">
      
      {/* Header */}
      <div className="text-center mb-10 border-b-4 border-gray-800 pb-8">
        <h1 className="text-4xl font-serif font-bold tracking-tight uppercase mb-2">
          {data.personalInfo.fullName}
        </h1>
        <div className="text-lg text-gray-600 font-serif italic mb-4">
          {data.personalInfo.role}
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 text-sm font-serif text-gray-700">
           {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
           {data.personalInfo.email && (
             <>
                <span className="text-gray-400">&bull;</span>
                <span>{data.personalInfo.email}</span>
             </>
           )}
           {data.personalInfo.location && (
             <>
                <span className="text-gray-400">&bull;</span>
                <span>{data.personalInfo.location}</span>
             </>
           )}
           {data.personalInfo.linkedin && (
             <>
                <span className="text-gray-400">&bull;</span>
                <span>{data.personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
             </>
           )}
        </div>
      </div>

      {/* Summary - Only if exists */}
      {data.personalInfo.summary && (
        <div className="mb-8">
           <p className="text-sm font-serif leading-relaxed text-center italic text-gray-700 max-w-2xl mx-auto">
             "{data.personalInfo.summary}"
           </p>
        </div>
      )}

      {/* Dynamic Sections - Rendered sequentially */}
      <div>
         {data.sectionOrder.map(key => renderSection(key))}
      </div>

    </div>
  );
};

export default ClassicTemplate;
