
import React from 'react';
import { ResumeData, Language } from '../types';
import ModernTemplate from './ModernTemplate';
import ClassicTemplate from './ClassicTemplate';
import MinimalTemplate from './MinimalTemplate';
import ProfessionalTemplate from './ProfessionalTemplate';
import ElegantTemplate from './ElegantTemplate';
import CreativeTemplate from './CreativeTemplate';
import { DEFAULT_THEME } from '../constants';

interface ResumePreviewProps {
  data: ResumeData;
  scale?: number;
  lang: Language;
  showWatermark?: boolean;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, scale = 1, lang, showWatermark = false }) => {
  const theme = data.theme || DEFAULT_THEME;
  
  const renderTemplate = () => {
    switch (data.template) {
      case 'classic':
        return <ClassicTemplate data={data} lang={lang} />;
      case 'minimal':
        return <MinimalTemplate data={data} lang={lang} />;
      case 'professional':
        return <ProfessionalTemplate data={data} lang={lang} />;
      case 'elegant':
        return <ElegantTemplate data={data} lang={lang} />;
      case 'creative':
        return <CreativeTemplate data={data} lang={lang} />;
      case 'modern':
      default:
        return <ModernTemplate data={data} lang={lang} />;
    }
  };

  return (
    <div 
      className="resume-page shadow-2xl mx-auto relative print:shadow-none print:m-0 print:p-0"
      style={{
        width: '210mm', // A4 width
        minHeight: '297mm', // A4 height
        height: 'auto', // Allow growth
        backgroundColor: theme.background,
        color: theme.text,
        // In print mode, the parent container handles the scale reset (see App.tsx)
      }}
    >
      {renderTemplate()}
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
    </div>
  );
};

export default ResumePreview;