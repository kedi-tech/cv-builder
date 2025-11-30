
import React from 'react';
import { ResumeData, Language } from '../types';
import ModernTemplate from './ModernTemplate';
import ClassicTemplate from './ClassicTemplate';
import MinimalTemplate from './MinimalTemplate';
import ProfessionalTemplate from './ProfessionalTemplate';
import ElegantTemplate from './ElegantTemplate';
import CreativeTemplate from './CreativeTemplate';

interface ResumePreviewProps {
  data: ResumeData;
  scale?: number;
  lang: Language;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, scale = 1, lang }) => {
  
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
      className="resume-page bg-white shadow-2xl mx-auto relative print:shadow-none print:m-0 print:p-0"
      style={{
        width: '210mm', // A4 width
        minHeight: '297mm', // A4 height
        height: 'auto', // Allow growth
        // In print mode, the parent container handles the scale reset (see App.tsx)
      }}
    >
      {renderTemplate()}
    </div>
  );
};

export default ResumePreview;