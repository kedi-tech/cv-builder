
import React from 'react';
import { ResumeData, Language } from '../types';
import { DEFAULT_THEME, TRANSLATIONS } from '../constants';

interface CoverLetterProps {
  data: ResumeData;
  lang: Language;
  showWatermark?: boolean;
}

const CoverLetterPreview: React.FC<CoverLetterProps> = ({ data, lang, showWatermark = false }) => {
  const t = TRANSLATIONS[lang];
  const theme = data.theme || DEFAULT_THEME;
  const currentDate = new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Determine font style based on template
  const isSerif = data.template === 'classic';
  const fontClass = isSerif ? 'font-serif' : 'font-sans';

  // Header styles variations to match resume templates loosely
  const renderHeader = () => {
    switch (data.template) {
        case 'minimal':
            return (
                <div className="mb-16 border-b border-gray-900 pb-6">
                    <h1 className="text-5xl font-black tracking-tighter mb-2 uppercase" style={{ color: theme.accent }}>
                        {data.personalInfo.fullName}
                    </h1>
                    <div className="text-sm font-medium flex flex-wrap gap-4" style={{ color: theme.primary }}>
                        {data.personalInfo.email} <span>•</span> {data.personalInfo.phone} <span>•</span> {data.personalInfo.location}
                    </div>
                </div>
            );
        case 'classic':
            return (
                <div className="text-center mb-12 border-b-4 pb-8" style={{ borderColor: theme.primary }}>
                    <h1 className="text-4xl font-serif font-bold uppercase tracking-tight mb-2" style={{ color: theme.accent }}>
                        {data.personalInfo.fullName}
                    </h1>
                    <div className="text-sm font-serif italic" style={{ color: theme.primary }}>
                        {data.personalInfo.email} &bull; {data.personalInfo.phone} &bull; {data.personalInfo.location}
                    </div>
                </div>
            );
        case 'modern':
        case 'professional':
        case 'elegant':
        case 'creative':
        default:
            return (
                <div className="mb-12">
                     <h1 className="text-4xl font-bold uppercase tracking-tight mb-2" style={{ color: theme.accent }}>
                        {data.personalInfo.fullName}
                    </h1>
                    <div className="text-sm font-medium" style={{ color: theme.primary }}>
                        {data.personalInfo.role}
                    </div>
                    <div className="text-sm mt-2 flex flex-wrap gap-4" style={{ color: theme.text }}>
                         <span>{data.personalInfo.email}</span>
                         <span>{data.personalInfo.phone}</span>
                         <span>{data.personalInfo.location}</span>
                    </div>
                    <hr className="mt-6 border-t-2" style={{ borderColor: theme.primary }} />
                </div>
            );
    }
  };

  return (
    <div 
      className={`bg-white shadow-2xl mx-auto relative print:shadow-none print:m-0 print:p-0 ${fontClass}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        height: 'auto',
        padding: '25mm',
        backgroundColor: data.theme?.background || DEFAULT_THEME.background,
        color: data.theme?.text || DEFAULT_THEME.text
      }}
    >
      {showWatermark && (
        <div
          className="pointer-events-none select-none absolute inset-0 print:hidden z-20 overflow-hidden"
          style={{
            opacity: 0.22,
            backgroundImage: `repeating-linear-gradient(45deg, rgba(15,23,42,0.14) 0, rgba(15,23,42,0.14) 2px, transparent 2px, transparent 18px)`,
          }}
        >
          <div className="absolute inset-0" style={{ overflow: 'hidden' }}>
            {[...Array(4)].map((_, row) => (
              <div key={row} className="flex gap-12" style={{ marginTop: `${row * 25}%` }}>
                {[...Array(3)].map((__, col) => (
                  <span
                    key={`${row}-${col}`}
                    className="text-3xl md:text-4xl font-black tracking-widest whitespace-nowrap"
                    style={{ 
                      color: 'rgba(31,41,55,0.28)',
                      transform: 'rotate(-45deg)',
                      transformOrigin: 'center',
                      display: 'inline-block'
                    }}
                  >
                    BaraCV Preview
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Header */}
      {renderHeader()}

      {/* Date */}
      <div className="mb-8 text-gray-700">
        {currentDate}
      </div>

      {/* Recipient Block */}
      <div className="mb-8 text-gray-800 leading-relaxed">
        <div className="font-bold">{data.coverLetter.recipientName}</div>
        <div>{data.coverLetter.jobTitle ? `${t.hiringFor} ${data.coverLetter.jobTitle}` : ''}</div>
        <div className="font-bold">{data.coverLetter.companyName}</div>
      </div>

      {/* Body Content */}
      <div className="text-gray-800 leading-7 whitespace-pre-wrap text-[15px] text-justify">
        {data.coverLetter.body || t.coverLetterPlaceholder}
      </div>

    </div>
  );
};

export default CoverLetterPreview;
