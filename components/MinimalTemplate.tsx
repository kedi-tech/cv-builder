
import React from 'react';
import { ResumeData, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface TemplateProps {
  data: ResumeData;
  lang: Language;
}

const MinimalTemplate: React.FC<TemplateProps> = ({ data, lang }) => {
  const t = TRANSLATIONS[lang];

  const renderSection = (key: string) => {
    switch (key) {
      case 'experience':
        return data.experiences.length > 0 && (
          <div key={key} className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              {t.experience}
            </h3>
            <div className="space-y-6">
              {data.experiences.map((exp) => (
                <div key={exp.id} className="grid grid-cols-[100px_1fr] gap-4">
                  <div className="text-xs text-gray-500 text-right pt-0.5">
                    {exp.startDate} –<br/>{exp.endDate}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-0.5">{exp.company}</h4>
                    <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">{exp.title}</div>
                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'education':
        return data.education.length > 0 && (
           <div key={key} className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              {t.education}
            </h3>
             <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id} className="grid grid-cols-[100px_1fr] gap-4">
                  <div className="text-xs text-gray-500 text-right pt-0.5">
                    {edu.startDate} –<br/>{edu.endDate}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{edu.school}</h4>
                    <div className="text-xs text-gray-600">{edu.degree}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'skills':
        return data.skills.length > 0 && (
          <div key={key} className="mb-8 grid grid-cols-[100px_1fr] gap-4">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
              {t.skills}
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {data.skills.map((skill, idx) => (
                <span key={idx} className="text-xs font-medium text-gray-800 border-b border-gray-200 pb-0.5">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        );
      case 'achievements':
         return data.achievements.length > 0 && (
          <div key={key} className="mb-8 grid grid-cols-[100px_1fr] gap-4">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
              {t.achievements}
            </h3>
            <div className="space-y-3">
              {data.achievements.map((ach) => (
                <div key={ach.id}>
                  <h4 className="text-xs font-bold text-gray-900">{ach.title}</h4>
                  <p className="text-xs text-gray-600">{ach.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'languages':
        return data.languages.length > 0 && (
          <div key={key} className="mb-8 grid grid-cols-[100px_1fr] gap-4">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
              {t.languages}
            </h3>
            <div className="flex flex-wrap gap-4">
               {data.languages.map((lang) => (
                <div key={lang.id} className="text-xs text-gray-700">
                  <span className="font-bold">{lang.language}</span> 
                  <span className="text-gray-400 ml-1">({lang.proficiency}/5)</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'courses':
        return data.courses.length > 0 && (
          <div key={key} className="mb-8 grid grid-cols-[100px_1fr] gap-4">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
              {t.courses}
            </h3>
            <ul className="text-xs text-gray-600 space-y-1">
              {data.courses.map((course, idx) => (
                <li key={idx}>{course}</li>
              ))}
            </ul>
          </div>
        );
      case 'interests':
        return data.interests.length > 0 && (
           <div key={key} className="mb-8 grid grid-cols-[100px_1fr] gap-4">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
              {t.interests}
            </h3>
            <div className="text-xs text-gray-600">
               {data.interests.join(', ')}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[297mm] p-16 bg-white text-gray-900 font-sans">
      
      {/* Header */}
      <div className="mb-16">
        <h1 className="text-6xl font-black tracking-tighter text-gray-900 mb-4 leading-none">
          {data.personalInfo.fullName.split(' ')[0]}<br/>
          <span className="text-gray-400">{data.personalInfo.fullName.split(' ').slice(1).join(' ')}</span>
        </h1>
        
        <div className="flex justify-between items-end border-b border-gray-900 pb-4">
            <div className="text-sm font-bold uppercase tracking-widest text-gray-900">
                {data.personalInfo.role}
            </div>
            <div className="text-right text-xs font-medium text-gray-500 leading-relaxed">
                {data.personalInfo.email}<br/>
                {data.personalInfo.phone}<br/>
                {data.personalInfo.location}
            </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-4">
          
          {/* Summary */}
          {data.personalInfo.summary && (
              <div className="mb-8 grid grid-cols-[100px_1fr] gap-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-right pt-1">
                    {t.about}
                  </h3>
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {data.personalInfo.summary}
                  </p>
              </div>
          )}

          {/* Dynamic Sections */}
          {data.sectionOrder.map(key => renderSection(key))}

      </div>
    </div>
  );
};

export default MinimalTemplate;
