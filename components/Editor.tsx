
import React, { useState, useRef } from 'react';
import { ResumeData, Experience, Education, LanguageItem, Achievement, Language } from '../types';
import { Plus, Trash2, Wand2, ChevronDown, ChevronUp, Upload, GripVertical, LayoutTemplate, Sparkles, FileText, User } from 'lucide-react';
import { generateSummary, improveDescription, generateCoverLetter } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';
import ImageCropper from './ImageCropper';

interface EditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  lang: Language;
  activeView: 'resume' | 'cover-letter';
  setActiveView: (view: 'resume' | 'cover-letter') => void;
}

const Editor: React.FC<EditorProps> = ({ data, onChange, lang, activeView, setActiveView }) => {
  const [activeSection, setActiveSection] = useState<string | null>('personal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Image cropping state
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  
  // Drag and Drop state
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const t = TRANSLATIONS[lang];

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value }
    });
  };
  
  const updateCoverLetter = (field: keyof ResumeData['coverLetter'], value: string) => {
    onChange({
      ...data,
      coverLetter: { ...data.coverLetter, [field]: value }
    });
  };

  const handleTemplateChange = (template: ResumeData['template']) => {
    onChange({ ...data, template });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
      // Reset input so the same file can be selected again
      e.target.value = '';
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    updatePersonalInfo('photoUrl', croppedImage);
    setShowCropper(false);
    setImageToCrop(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
  };

  const handleAISummary = async () => {
    if(!process.env.API_KEY) {
        setError("API Key missing. Cannot generate summary.");
        return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const summary = await generateSummary(data, lang);
      updatePersonalInfo('summary', summary);
    } catch (err) {
      setError("Failed to generate summary. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleAICoverLetter = async () => {
    if(!process.env.API_KEY) {
        setError("API Key missing.");
        return;
    }
    if(!data.coverLetter.companyName || !data.coverLetter.jobTitle) {
        setError("Please enter Company Name and Job Title first.");
        return;
    }
    
    setIsGenerating(true);
    setError(null);
    try {
      const letter = await generateCoverLetter(data, lang);
      updateCoverLetter('body', letter);
    } catch (err) {
      setError("Failed to generate cover letter.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImproveDescription = async (index: number) => {
    if(!process.env.API_KEY) {
        setError("API Key missing.");
        return;
    }
    const exp = data.experiences[index];
    if (!exp.description) return;
    
    setIsGenerating(true);
    try {
      const improved = await improveDescription(exp.description, exp.title, lang);
      const newExperiences = [...data.experiences];
      newExperiences[index] = { ...exp, description: improved };
      onChange({ ...data, experiences: newExperiences });
    } catch (err) {
      setError("Failed to improve description.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to manage array fields
  const addItem = <T,>(field: keyof ResumeData, item: T) => {
    onChange({
      ...data,
      [field]: [...(data[field] as T[]), item]
    });
  };

  const removeItem = (field: keyof ResumeData, index: number) => {
    const newArray = [...(data[field] as any[])];
    newArray.splice(index, 1);
    onChange({ ...data, [field]: newArray });
  };

  const updateArrayItem = (field: keyof ResumeData, index: number, subField: string, value: any) => {
    const newArray = [...(data[field] as any[])];
    newArray[index] = { ...newArray[index], [subField]: value };
    onChange({ ...data, [field]: newArray });
  };

  const updateSimpleArray = (field: keyof ResumeData, index: number, value: string) => {
    const newArray = [...(data[field] as string[])];
    newArray[index] = value;
    onChange({ ...data, [field]: newArray });
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    const draggedIdx = dragItem.current;
    const overIdx = dragOverItem.current;

    if (draggedIdx !== null && overIdx !== null && draggedIdx !== overIdx) {
      const newOrder = [...data.sectionOrder];
      const draggedItemContent = newOrder[draggedIdx];
      newOrder.splice(draggedIdx, 1);
      newOrder.splice(overIdx, 0, draggedItemContent);
      
      onChange({
        ...data,
        sectionOrder: newOrder
      });
    }

    dragItem.current = null;
    dragOverItem.current = null;
  };

  const renderSectionContent = (sectionKey: string) => {
    switch(sectionKey) {
      case 'experience':
        return (
          <div className="p-4 space-y-6 animate-fadeIn">
            {data.experiences.map((exp, index) => (
              <div key={exp.id} className="relative bg-gray-50 p-3 rounded border border-gray-200">
                <button 
                  onClick={() => removeItem('experiences', index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input 
                    placeholder={t.company}
                    className="p-2 border rounded text-sm"
                    value={exp.company}
                    onChange={(e) => updateArrayItem('experiences', index, 'company', e.target.value)}
                  />
                  <input 
                    placeholder={t.title}
                    className="p-2 border rounded text-sm"
                    value={exp.title}
                    onChange={(e) => updateArrayItem('experiences', index, 'title', e.target.value)}
                  />
                  <input 
                    placeholder={t.startDate}
                    className="p-2 border rounded text-sm"
                    value={exp.startDate}
                    onChange={(e) => updateArrayItem('experiences', index, 'startDate', e.target.value)}
                  />
                  <input 
                    placeholder={t.endDate}
                    className="p-2 border rounded text-sm"
                    value={exp.endDate}
                    onChange={(e) => updateArrayItem('experiences', index, 'endDate', e.target.value)}
                  />
                   <input 
                    placeholder={t.location}
                    className="p-2 border rounded text-sm col-span-2"
                    value={exp.location}
                    onChange={(e) => updateArrayItem('experiences', index, 'location', e.target.value)}
                  />
                </div>
                 <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-gray-500">{t.description}</label>
                    <button 
                      onClick={() => handleImproveDescription(index)}
                      disabled={isGenerating}
                      className="text-xs flex items-center gap-1 text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
                    >
                      <Wand2 size={12} /> {isGenerating ? t.enhancing : t.enhance}
                    </button>
                </div>
                <textarea 
                  className="w-full p-2 border rounded text-sm h-24"
                  placeholder={t.placeholderDesc}
                  value={exp.description}
                  onChange={(e) => updateArrayItem('experiences', index, 'description', e.target.value)}
                />
              </div>
            ))}
            <button 
              onClick={() => addItem<Experience>('experiences', { id: Date.now().toString(), company: '', title: '', location: '', startDate: '', endDate: '', description: '' })}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus size={16} /> {t.addExperience}
            </button>
          </div>
        );
      case 'education':
        return (
          <div className="p-4 space-y-4 animate-fadeIn">
            {data.education.map((edu, index) => (
              <div key={edu.id} className="relative bg-gray-50 p-3 rounded border border-gray-200">
                <button 
                  onClick={() => removeItem('education', index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 gap-3">
                  <input 
                    placeholder={t.school}
                    className="p-2 border rounded text-sm"
                    value={edu.school}
                    onChange={(e) => updateArrayItem('education', index, 'school', e.target.value)}
                  />
                  <input 
                    placeholder={t.degree}
                    className="p-2 border rounded text-sm"
                    value={edu.degree}
                    onChange={(e) => updateArrayItem('education', index, 'degree', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                        placeholder={t.startDate}
                        className="p-2 border rounded text-sm"
                        value={edu.startDate}
                        onChange={(e) => updateArrayItem('education', index, 'startDate', e.target.value)}
                    />
                    <input 
                        placeholder={t.endDate}
                        className="p-2 border rounded text-sm"
                        value={edu.endDate}
                        onChange={(e) => updateArrayItem('education', index, 'endDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={() => addItem<Education>('education', { id: Date.now().toString(), school: '', degree: '', startDate: '', endDate: '' })}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus size={16} /> {t.addEducation}
            </button>
          </div>
        );
      case 'skills':
        return (
          <div className="p-4 animate-fadeIn">
             <div className="flex flex-wrap gap-2 mb-4">
                {data.skills.map((skill, index) => (
                    <div key={index} className="flex bg-gray-100 rounded px-2 py-1 items-center gap-1">
                        <input 
                            className="bg-transparent text-sm border-b border-transparent focus:border-emerald-500 focus:outline-none w-24"
                            value={skill}
                            onChange={(e) => updateSimpleArray('skills', index, e.target.value)}
                        />
                        <button onClick={() => removeItem('skills', index)} className="text-gray-400 hover:text-red-500"><Trash2 size={12}/></button>
                    </div>
                ))}
             </div>
             <button 
              onClick={() => addItem<string>('skills', 'New Skill')}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus size={16} /> {t.addSkill}
            </button>
          </div>
        );
      case 'languages':
        return (
          <div className="p-4 space-y-3 animate-fadeIn">
             {data.languages.map((langItem, index) => (
                 <div key={langItem.id} className="flex gap-2 items-center">
                     <input 
                        className="flex-1 p-2 border rounded text-sm"
                        value={langItem.language}
                        onChange={(e) => updateArrayItem('languages', index, 'language', e.target.value)}
                        placeholder={t.language}
                     />
                     <select 
                        className="p-2 border rounded text-sm"
                        value={langItem.proficiency}
                        onChange={(e) => updateArrayItem('languages', index, 'proficiency', parseInt(e.target.value))}
                     >
                        <option value={1}>{t.beginner}</option>
                        <option value={2}>{t.elementary}</option>
                        <option value={3}>{t.intermediate}</option>
                        <option value={4}>{t.advanced}</option>
                        <option value={5}>{t.native}</option>
                     </select>
                     <button onClick={() => removeItem('languages', index)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                 </div>
             ))}
             <button 
              onClick={() => addItem<LanguageItem>('languages', { id: Date.now().toString(), language: '', proficiency: 3 })}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus size={16} /> {t.addLanguage}
            </button>
          </div>
        );
      case 'achievements':
        return (
          <div className="p-4 space-y-4 animate-fadeIn">
            {data.achievements.map((ach, index) => (
              <div key={ach.id} className="relative bg-gray-50 p-3 rounded border border-gray-200">
                <button 
                  onClick={() => removeItem('achievements', index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
                <div className="flex flex-col gap-2">
                  <input 
                    placeholder={t.achievementTitle}
                    className="p-2 border rounded text-sm"
                    value={ach.title}
                    onChange={(e) => updateArrayItem('achievements', index, 'title', e.target.value)}
                  />
                  <textarea 
                    placeholder="Description"
                    className="p-2 border rounded text-sm h-16"
                    value={ach.description}
                    onChange={(e) => updateArrayItem('achievements', index, 'description', e.target.value)}
                  />
                </div>
              </div>
            ))}
            <button 
              onClick={() => addItem<Achievement>('achievements', { id: Date.now().toString(), title: '', description: '' })}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus size={16} /> {t.addAchievement}
            </button>
          </div>
        );
      case 'courses':
        return (
          <div className="p-4 animate-fadeIn">
             <div className="space-y-2 mb-4">
                {data.courses.map((course, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <input 
                            className="flex-1 p-2 border rounded text-sm"
                            value={course}
                            onChange={(e) => updateSimpleArray('courses', index, e.target.value)}
                        />
                        <button onClick={() => removeItem('courses', index)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                ))}
             </div>
             <button 
              onClick={() => addItem<string>('courses', 'New Course')}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus size={16} /> {t.addCourse}
            </button>
          </div>
        );
      case 'interests':
        return (
          <div className="p-4 animate-fadeIn">
             <div className="flex flex-wrap gap-2 mb-4">
                {data.interests.map((interest, index) => (
                    <div key={index} className="flex bg-gray-100 rounded px-2 py-1 items-center gap-1">
                        <input 
                            className="bg-transparent text-sm border-b border-transparent focus:border-emerald-500 focus:outline-none w-24"
                            value={interest}
                            onChange={(e) => updateSimpleArray('interests', index, e.target.value)}
                        />
                        <button onClick={() => removeItem('interests', index)} className="text-gray-400 hover:text-red-500"><Trash2 size={12}/></button>
                    </div>
                ))}
             </div>
             <button 
              onClick={() => addItem<string>('interests', 'New Interest')}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus size={16} /> {t.addInterest}
            </button>
          </div>
        );
      default:
        return null;
    }
  }

  // Get translated title for section
  const getSectionTitle = (key: string) => {
    // @ts-ignore
    return t[key] || key;
  }

  return (
    <>
      {showCropper && imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
      <div className="h-full overflow-y-auto bg-white border-r border-gray-200 p-6 shadow-xl z-10 relative">
      
      {/* Tab Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
        <button
            onClick={() => setActiveView('resume')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition ${activeView === 'resume' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
            <User size={16} /> {t.viewResume}
        </button>
        <button
            onClick={() => setActiveView('cover-letter')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition ${activeView === 'cover-letter' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
            <FileText size={16} /> {t.viewCoverLetter}
        </button>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        {activeView === 'resume' ? t.editorTitle : t.viewCoverLetter}
      </h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* --- Template Selection --- */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
           <LayoutTemplate size={14} />
           {t.selectTemplate}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['modern', 'classic', 'minimal', 'professional', 'elegant', 'creative'].map((temp) => (
             <button 
                key={temp}
                // @ts-ignore
                onClick={() => handleTemplateChange(temp)}
                className={`p-2 rounded border text-xs font-medium transition ${data.template === temp ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
                {/* @ts-ignore */}
                {t[temp] || temp}
            </button>
          ))}
        </div>
      </div>

      <hr className="my-6 border-gray-100" />

      {activeView === 'resume' ? (
        <>
            {/* --- Personal Info (Fixed at top) --- */}
            <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                <button 
                onClick={() => toggleSection('personal')}
                className="w-full bg-gray-50 p-4 flex justify-between items-center font-semibold text-gray-700 hover:bg-gray-100 transition"
                >
                {t.personalInfo}
                {activeSection === 'personal' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </button>
                {activeSection === 'personal' && (
                <div className="p-4 space-y-4 animate-fadeIn">
                    <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t.fullName}</label>
                    <input 
                        type="text" 
                        value={data.personalInfo.fullName}
                        onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    </div>
                    <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t.role}</label>
                    <input 
                        type="text" 
                        value={data.personalInfo.role}
                        onChange={(e) => updatePersonalInfo('role', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t.email}</label>
                        <input 
                        type="text" 
                        value={data.personalInfo.email}
                        onChange={(e) => updatePersonalInfo('email', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t.phone}</label>
                        <input 
                        type="text" 
                        value={data.personalInfo.phone}
                        onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                    </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t.location}</label>
                        <input 
                        type="text" 
                        value={data.personalInfo.location}
                        onChange={(e) => updatePersonalInfo('location', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t.linkedin}</label>
                        <input 
                        type="text" 
                        value={data.personalInfo.linkedin}
                        onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                    </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t.photo}</label>
                        <div className="flex gap-2 items-center">
                            <input 
                            type="text" 
                            value={data.personalInfo.photoUrl}
                            onChange={(e) => updatePersonalInfo('photoUrl', e.target.value)}
                            placeholder={t.placeholderImgUrl}
                            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                            />
                            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded border border-gray-300 transition flex items-center justify-center" title="Upload Photo">
                                <Upload size={18} />
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>
                    </div>
                    <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-medium text-gray-500">{t.summary}</label>
                        <button 
                        onClick={handleAISummary}
                        disabled={isGenerating}
                        className="text-xs flex items-center gap-1 text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
                        >
                        <Wand2 size={12} /> {isGenerating ? t.writing : t.autoWrite}
                        </button>
                    </div>
                    <textarea 
                        value={data.personalInfo.summary}
                        onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                        rows={4}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                    />
                    </div>
                </div>
                )}
            </div>

            {/* --- Draggable Sections --- */}
            {data.sectionOrder.map((key, index) => (
                <div 
                key={key}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`mb-4 border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 ${isDragging && dragItem.current === index ? 'opacity-50' : 'opacity-100'}`}
                >
                <div className="flex items-center w-full bg-gray-50 hover:bg-gray-100 transition">
                    <div className="cursor-grab p-4 text-gray-400 hover:text-gray-600 active:cursor-grabbing border-r border-gray-200" title={t.dragReorder}>
                        <GripVertical size={16} />
                    </div>
                    <button 
                    onClick={() => toggleSection(key)}
                    className="flex-1 p-4 flex justify-between items-center font-semibold text-gray-700"
                    >
                    {getSectionTitle(key)}
                    {activeSection === key ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </button>
                </div>
                
                {activeSection === key && (
                    renderSectionContent(key)
                )}
                </div>
            ))}
        </>
      ) : (
        /* --- Cover Letter Editor --- */
        <div className="space-y-6">
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 text-sm text-emerald-800 mb-4">
                 <p className="flex gap-2 items-start">
                     <Sparkles size={16} className="shrink-0 mt-0.5" />
                     <span>
                         <strong>{t.coverLetterDetails}</strong> - Fill in the job details below, then click "Generate with AI" to create a personalized cover letter using all your resume information (experiences, skills, education, achievements, etc.).
                     </span>
                 </p>
            </div>

            <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t.targetCompany}</label>
                    <input 
                        type="text" 
                        value={data.coverLetter.companyName}
                        onChange={(e) => updateCoverLetter('companyName', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t.targetRole}</label>
                    <input 
                        type="text" 
                        value={data.coverLetter.jobTitle}
                        onChange={(e) => updateCoverLetter('jobTitle', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t.recipientName}</label>
                    <input 
                        type="text" 
                        value={data.coverLetter.recipientName}
                        onChange={(e) => updateCoverLetter('recipientName', e.target.value)}
                        placeholder="e.g. Hiring Manager"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-medium text-gray-500">{t.coverLetterBody}</label>
                    <button 
                      onClick={handleAICoverLetter}
                      disabled={isGenerating}
                      className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
                    >
                      <Sparkles size={12} /> {isGenerating ? t.generating : t.generateCoverLetter}
                    </button>
                </div>
                <textarea 
                    value={data.coverLetter.body}
                    onChange={(e) => updateCoverLetter('body', e.target.value)}
                    rows={15}
                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm leading-relaxed"
                />
            </div>
        </div>
      )}

    </div>
    </>
  );
};

export default Editor;
