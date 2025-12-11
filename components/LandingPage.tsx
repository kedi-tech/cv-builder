import React from 'react';
import { ArrowRight, FileText, Wand2, Download, Palette, Globe, Phone, CheckCircle, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface LandingPageProps {
  lang: Language;
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ lang, onGetStarted }) => {
  const t = TRANSLATIONS[lang];

  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: t.landingFeature1Title,
      description: t.landingFeature1Desc,
    },
    {
      icon: <Wand2 className="w-6 h-6" />,
      title: t.landingFeature2Title,
      description: t.landingFeature2Desc,
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: t.landingFeature3Title,
      description: t.landingFeature3Desc,
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: t.landingFeature4Title,
      description: t.landingFeature4Desc,
    },
  ];

  const steps = [
    { number: 1, text: t.landingStep1 },
    { number: 2, text: t.landingStep2 },
    { number: 3, text: t.landingStep3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-xl">
                BCV
              </div>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">
              {t.landingTitle}
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t.landingSubtitle}
            </p>
            
            {/* CTA Button */}
            <button
              onClick={onGetStarted}
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {t.landingGetStarted}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.landingFeaturesTitle}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.landingFeaturesSubtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.landingHowItWorks}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.landingHowItWorksDesc}
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 relative">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center text-center max-w-xs">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg">
                    {step.number}
                  </div>
                  <p className="text-gray-700 text-lg font-medium">
                    {step.text}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <>
                    <ArrowRight className="w-6 h-6 text-emerald-500 rotate-90 md:rotate-0" />
                  </>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t.landingSupportTitle}
          </h2>
          <p className="text-xl text-emerald-50 mb-6 max-w-2xl mx-auto">
            {t.landingSupportDesc}
          </p>
          <a
            href={`tel:613956391`}
            className="inline-flex items-center gap-3 bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Phone className="w-5 h-5" />
            +224 613 956 391
          </a>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {t.landingReadyToStart}
          </h3>
          <p className="text-gray-400 mb-6 text-lg">
            {t.landingReadyToStartDesc}
          </p>
          <button
            onClick={onGetStarted}
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {t.landingGetStarted}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

