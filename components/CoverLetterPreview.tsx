
import React from 'react';
import { ResumeData, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface CoverLetterProps {
  data: ResumeData;
  lang: Language;
}

const CoverLetterPreview: React.FC<CoverLetterProps> = ({ data, lang }) => {
  const t = TRANSLATIONS[lang];
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
                    <h1 className="text-5xl font-black tracking-tighter text-gray-900 mb-2 uppercase">
                        {data.personalInfo.fullName}
                    </h1>
                    <div className="text-sm font-medium text-gray-500 flex flex-wrap gap-4">
                        {data.personalInfo.email} <span>•</span> {data.personalInfo.phone} <span>•</span> {data.personalInfo.location}
                    </div>
                </div>
            );
        case 'classic':
            return (
                <div className="text-center mb-12 border-b-4 border-gray-800 pb-8">
                    <h1 className="text-4xl font-serif font-bold uppercase tracking-tight mb-2">
                        {data.personalInfo.fullName}
                    </h1>
                    <div className="text-sm font-serif italic text-gray-600">
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
                     <h1 className={`text-4xl font-bold uppercase tracking-tight mb-2 ${data.template === 'modern' ? 'text-emerald-800' : data.template === 'creative' ? 'text-blue-900' : 'text-gray-900'}`}>
                        {data.personalInfo.fullName}
                    </h1>
                    <div className="text-sm text-gray-600 font-medium">
                        {data.personalInfo.role}
                    </div>
                    <div className="text-sm text-gray-500 mt-2 flex flex-wrap gap-4">
                         <span>{data.personalInfo.email}</span>
                         <span>{data.personalInfo.phone}</span>
                         <span>{data.personalInfo.location}</span>
                    </div>
                    <hr className={`mt-6 border-t-2 ${data.template === 'modern' ? 'border-emerald-500' : data.template === 'creative' ? 'border-blue-500' : 'border-gray-800'}`} />
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
        padding: '25mm'
      }}
    >
      {/* Header */}
      {renderHeader()}

      {/* Date */}
      <div className="mb-8 text-gray-700">
        {currentDate}
      </div>

      {/* Recipient Block */}
      <div className="mb-8 text-gray-800 leading-relaxed">
        <div className="font-bold">{data.coverLetter.recipientName}</div>
        <div>{data.coverLetter.jobTitle ? `Hiring for ${data.coverLetter.jobTitle}` : ''}</div>
        <div className="font-bold">{data.coverLetter.companyName}</div>
      </div>

      {/* Body Content */}
      <div className="text-gray-800 leading-7 whitespace-pre-wrap text-[15px] text-justify">
        {data.coverLetter.body || "(Cover letter content will appear here. Use the editor to write or generate one.)"}
      </div>

    </div>
  );
};

export default CoverLetterPreview;
