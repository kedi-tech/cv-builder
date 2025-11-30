import React from 'react';
import { ResumeData, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  Phone, 
  Mail, 
  Linkedin, 
  MapPin, 
  User, 
  Flag, 
  BookOpen, 
  Heart, 
  Briefcase, 
  GraduationCap, 
  Zap 
} from 'lucide-react';

interface TemplateProps {
  data: ResumeData;
  lang: Language;
}

const LEFT_SECTIONS = new Set(['achievements', 'courses', 'interests']);
const RIGHT_SECTIONS = new Set(['experience', 'education', 'skills', 'languages']);

const ModernTemplate: React.FC<TemplateProps> = ({ data, lang }) => {
  const t = TRANSLATIONS[lang];

  const renderLeftSection = (key: string) => {
    switch (key) {
      case 'achievements':
        return data.achievements.length > 0 && (
          <div key={key}>
            <h3 className="flex items-center gap-2 text-emerald-700 font-bold tracking-wider text-sm mb-3 uppercase">
              <Flag className="w-4 h-4" /> {t.achievements}
            </h3>
            <div className="flex flex-col gap-4">
              {data.achievements.map((ach) => (
                <div key={ach.id}>
                  <h4 className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    {ach.title}
                  </h4>
                  <p className="text-[10px] text-gray-600 pl-3.5 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'courses':
        return data.courses.length > 0 && (
          <div key={key}>
            <h3 className="flex items-center gap-2 text-emerald-700 font-bold tracking-wider text-sm mb-3 uppercase">
              <BookOpen className="w-4 h-4" /> {t.courses}
            </h3>
            <ul className="text-xs text-gray-600 flex flex-col gap-1.5">
              {data.courses.map((course, idx) => (
                <li key={idx} className="font-medium">{course}</li>
              ))}
            </ul>
          </div>
        );
      case 'interests':
        return data.interests.length > 0 && (
          <div key={key}>
            <h3 className="flex items-center gap-2 text-emerald-700 font-bold tracking-wider text-sm mb-3 uppercase">
              <Heart className="w-4 h-4" /> {t.interests}
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.interests.map((interest, idx) => (
                <span key={idx} className="flex items-center gap-1.5 text-xs text-gray-700">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
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

  const renderRightSection = (key: string) => {
    switch (key) {
      case 'experience':
        return data.experiences.length > 0 && (
          <div key={key}>
            <h3 className="flex items-center gap-2 text-emerald-700 font-bold tracking-wider text-sm mb-5 uppercase border-b border-emerald-100 pb-2">
              <Briefcase className="w-4 h-4" /> {t.experience}
            </h3>
            <div className="flex flex-col gap-6">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-800 text-sm">{exp.company}</h4>
                    <span className="text-xs text-gray-500 italic">{exp.location}</span>
                  </div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h5 className="text-xs text-emerald-700 font-semibold">{exp.title}</h5>
                    <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-line pl-1">
                    {exp.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'education':
        return data.education.length > 0 && (
          <div key={key}>
            <h3 className="flex items-center gap-2 text-emerald-700 font-bold tracking-wider text-sm mb-5 uppercase border-b border-emerald-100 pb-2">
              <GraduationCap className="w-4 h-4" /> {t.education}
            </h3>
            <div className="flex flex-col gap-4">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-800 text-sm">{edu.school}</h4>
                    <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                      {edu.startDate} – {edu.endDate}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {edu.degree}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'skills':
        return data.skills.length > 0 && (
          <div key={key}>
            <h3 className="flex items-center gap-2 text-emerald-700 font-bold tracking-wider text-sm mb-4 uppercase border-b border-emerald-100 pb-2">
              <Zap className="w-4 h-4" /> {t.skills}
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        );
      case 'languages':
        return data.languages.length > 0 && (
          <div key={key}>
            <h3 className="flex items-center gap-2 text-emerald-700 font-bold tracking-wider text-sm mb-4 uppercase border-b border-emerald-100 pb-2">
              <Flag className="w-4 h-4" /> {t.languages}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {data.languages.map((lang) => (
                <div key={lang.id} className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-700 uppercase">{lang.language}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <div 
                        key={dot} 
                        className={`w-2 h-2 rounded-full ${dot <= lang.proficiency ? 'bg-emerald-400' : 'bg-gray-200'}`}
                      ></div>
                    ))}
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

  // Determine order based on sectionOrder
  const leftColumnContent = data.sectionOrder
    .filter(key => LEFT_SECTIONS.has(key))
    .map(key => renderLeftSection(key));

  const rightColumnContent = data.sectionOrder
    .filter(key => RIGHT_SECTIONS.has(key))
    .map(key => renderRightSection(key));

  return (
    <div className="flex h-full min-h-[297mm]">
        {/* --- LEFT COLUMN --- */}
        <div className="w-[35%] bg-white pr-6 pl-8 pt-8 pb-8 flex flex-col gap-8 border-r border-gray-100">
          
          {/* Profile Image & Decor (Fixed) */}
          <div className="relative mx-auto mb-2">
            {/* Decorative blobs mimicking the template */}
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-emerald-100 rounded-full opacity-70 mix-blend-multiply filter blur-sm"></div>
            <div className="absolute top-0 -right-2 w-32 h-32 bg-teal-100 rounded-full opacity-70 mix-blend-multiply filter blur-sm"></div>
            <div className="absolute -bottom-2 left-4 w-32 h-32 bg-green-50 rounded-full opacity-70 mix-blend-multiply filter blur-sm"></div>
            
            {data.personalInfo.photoUrl && (
              <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-md mx-auto">
                <img 
                  src={data.personalInfo.photoUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {!data.personalInfo.photoUrl && (
               <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-md mx-auto bg-gray-200 flex items-center justify-center text-gray-400">
                  <User size={48} />
               </div>
            )}
            {/* Small green dot decoration */}
            <div className="absolute bottom-2 right-4 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>

          {/* Contacts (Fixed) */}
          <div>
            <h3 className="flex items-center gap-2 text-emerald-700 font-bold tracking-wider text-sm mb-4 uppercase">
              <Mail className="w-4 h-4" /> {t.contacts}
            </h3>
            <div className="flex flex-col gap-3 text-xs text-gray-600">
              {data.personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3 text-emerald-500" />
                  <span>{data.personalInfo.phone}</span>
                </div>
              )}
              {data.personalInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-emerald-500" />
                  <span className="break-all">{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo.linkedin && (
                <div className="flex items-center gap-2">
                  <Linkedin className="w-3 h-3 text-emerald-500" />
                  <span className="truncate">{data.personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
                </div>
              )}
              {data.personalInfo.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  <span>{data.personalInfo.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary (Fixed in Left Sidebar for this design) */}
          <div>
            <h3 className="flex items-center gap-2 text-emerald-700 font-bold tracking-wider text-sm mb-3 uppercase">
              <User className="w-4 h-4" /> {t.summary}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed text-justify">
              {data.personalInfo.summary}
            </p>
          </div>

          {/* Dynamic Left Column Sections */}
          {leftColumnContent}

        </div>

        {/* --- RIGHT COLUMN --- */}
        <div className="w-[65%] pt-12 pr-8 pl-6 flex flex-col gap-8 pb-8">
          
          {/* Header (Fixed) */}
          <div>
            <h1 className="text-4xl font-light text-gray-800 tracking-tight uppercase mb-3">
              {data.personalInfo.fullName}
            </h1>
            <div className="inline-block bg-emerald-200/50 rounded-full px-6 py-1.5">
              <span className="text-emerald-800 font-bold tracking-widest text-sm uppercase">
                {data.personalInfo.role}
              </span>
            </div>
          </div>

          {/* Dynamic Right Column Sections */}
          {rightColumnContent}

        </div>
      </div>
  );
};

export default ModernTemplate;