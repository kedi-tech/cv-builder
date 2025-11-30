
import React, { useState, useEffect } from 'react';
import ResumePreview from './components/ResumePreview';
import CoverLetterPreview from './components/CoverLetterPreview';
import Editor from './components/Editor';
import { INITIAL_DATA, TRANSLATIONS } from './constants';
import { ResumeData, Language } from './types';
import { Globe, Download, FileText, User } from 'lucide-react';

const App: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_DATA);
  const [lang, setLang] = useState<Language>('en');
  const [activeView, setActiveView] = useState<'resume' | 'cover-letter'>('resume');

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const handlePrint = () => {
    // 1. Change document title to get a nice filename
    const originalTitle = document.title;
    const safeName = resumeData.personalInfo.fullName.replace(/[^a-zA-Z0-9]/g, '_') || 'Document';
    const type = activeView === 'resume' ? 'Resume' : 'Cover_Letter';
    document.title = `${safeName}_${type}`;

    // 2. Trigger print
    // Use a small timeout to ensure React rendering/Title update is complete
    setTimeout(() => {
        window.print();
        // 3. Restore title
        document.title = originalTitle;
    }, 100);
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'fr' : 'en');
  };

  const t = TRANSLATIONS[lang];

  return (
    <div className="flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible print:block">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20 shadow-sm shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">Tp</div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">TealPrint Builder</h1>
        </div>
        
        {/* Central Toggle */}
        <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
             <button 
                onClick={() => setActiveView('resume')}
                className={`px-4 py-1.5 rounded text-sm font-medium transition flex items-center gap-2 ${activeView === 'resume' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
             >
                <User size={16} /> {t.viewResume}
             </button>
             <button 
                onClick={() => setActiveView('cover-letter')}
                className={`px-4 py-1.5 rounded text-sm font-medium transition flex items-center gap-2 ${activeView === 'cover-letter' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
             >
                <FileText size={16} /> {t.viewCoverLetter}
             </button>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition font-medium text-sm px-3 py-1.5 rounded-md hover:bg-gray-50"
          >
            <Globe size={18} />
            {lang === 'en' ? 'English' : 'Français'}
          </button>
          <div className="relative group">
            <button 
              onClick={handlePrint}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition shadow-md font-medium text-sm active:transform active:scale-95"
            >
              <Download size={18} />
              {t.print}
            </button>
            <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-50 text-center">
               {t.printTooltip}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden print:overflow-visible print:h-auto print:block">
        
        {/* Left Side: Editor (Scrollable) */}
        <div className="w-1/3 min-w-[400px] h-full border-r border-gray-200 bg-white z-10 overflow-y-auto print:hidden">
          <Editor 
            data={resumeData} 
            onChange={setResumeData} 
            lang={lang} 
            activeView={activeView}
            setActiveView={setActiveView}
          />
        </div>

        {/* Right Side: Preview (Scrollable) */}
        <div className="flex-1 bg-gray-100 overflow-y-auto p-12 flex justify-center items-start print:p-0 print:bg-white print:overflow-visible print:h-auto print:block">
          {/* 
            Wrapper for scaling. 
            In print mode, we remove scaling, margins, and transforms to let it flow naturally as a page 
          */}
          <div className="origin-top scale-75 md:scale-90 lg:scale-100 xl:scale-100 transition-transform duration-200 print:scale-100 print:transform-none print:m-0 print:p-0 print:w-full">
             {activeView === 'resume' ? (
                 <ResumePreview data={resumeData} lang={lang} />
             ) : (
                 <CoverLetterPreview data={resumeData} lang={lang} />
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
