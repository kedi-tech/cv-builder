
import React, { useState, useEffect } from 'react';
import ResumePreview from './components/ResumePreview';
import CoverLetterPreview from './components/CoverLetterPreview';
import Editor from './components/Editor';
import LandingPage from './components/LandingPage';
import { INITIAL_DATA, TRANSLATIONS } from './constants';
import { ResumeData, Language } from './types';
import { Globe, Download, FileText, User, CreditCard, LogIn, LogOut, Edit, Eye, Menu, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import AuthModal, { AuthUser } from './components/AuthModal';
import CheckoutModal, { CheckoutResult } from './components/CheckoutModal';
import { getBalance, updateCredit } from './services/authService';

const App: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_DATA);
  const [lang, setLang] = useState<Language>('fr');
  const [activeView, setActiveView] = useState<'resume' | 'cover-letter'>('resume');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor'); // For mobile tabs
  const [showLanding, setShowLanding] = useState(true); // Show landing page by default
  const [showMobileMenu, setShowMobileMenu] = useState(false); // Mobile menu toggle
  const [previewZoom, setPreviewZoom] = useState(0.5); // Zoom level for mobile preview (0.35 = 35%, 0.5 = 50%, etc.)
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    // Check if user has seen the landing page before
    const hasSeenLanding = localStorage.getItem('baracv-has-seen-landing');
    if (hasSeenLanding === 'true') {
      setShowLanding(false);
    }
  }, []);

  // Function to fetch and update balance
  const fetchAndUpdateBalance = async (currentUser: AuthUser | null) => {
    if (!currentUser || !currentUser.id || !currentUser.token) {
      return;
    }

    try {
      const balanceResult = await getBalance();
      if (balanceResult.success && balanceResult.credits !== undefined) {
        const updated = {
          ...currentUser,
          credits: balanceResult.credits,
        };
        setUser(updated);
        localStorage.setItem('tp-auth-user', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  useEffect(() => {
    const loadUserAndBalance = async () => {
      const stored = localStorage.getItem('tp-auth-user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Ensure user has an ID and credits
          const normalized = {
            ...parsed,
            id: parsed.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            credits: parsed.credits || 0,
          };
          setUser(normalized);
          localStorage.setItem('tp-auth-user', JSON.stringify(normalized));

          // Fetch latest balance from API on reload
          await fetchAndUpdateBalance(normalized);
        } catch {
          // ignore bad data
        }
      }
    };

    loadUserAndBalance();

    // Check for payment callback
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    const paymentStatus = urlParams.get('status');

    if (orderId && paymentStatus === 'success') {
      // Verify and process the order
      const orderData = localStorage.getItem(`tp-order-${orderId}`);
      if (orderData) {
        try {
          const order = JSON.parse(orderData);
          const currentUser = JSON.parse(localStorage.getItem('tp-auth-user') || '{}');
          
          if (currentUser.id === order.user_id) {
            // Add credits to user account
            const updated = {
              ...currentUser,
              credits: (currentUser.credits || 0) + order.credits,
            };
            setUser(updated);
            localStorage.setItem('tp-auth-user', JSON.stringify(updated));
            
            // Clean up order data
            localStorage.removeItem(`tp-order-${orderId}`);
            
            // Remove query params from URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (err) {
          console.error('Error processing payment callback:', err);
        }
      }
    }
  }, []);

  // Auto-refresh balance every 5 minutes when user is logged in
  useEffect(() => {
    if (!user || !user.id || !user.token) {
      return;
    }

    // Set up interval to check balance every 5 minutes (300000 ms)
    const intervalId = setInterval(() => {
      fetchAndUpdateBalance(user);
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup interval on unmount or when user changes
    return () => {
      clearInterval(intervalId);
    };
  }, [user?.id, user?.token]); // Re-run when user or token changes

  const handlePrint = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    // Calculate required credits: 2 for both resume and cover letter
    const requiredCredits = 2;

    // Check if user has enough credits
    if ((user.credits || 0) < requiredCredits) {
      setShowCheckout(true);
      return;
    }

    // Deduct credits locally first
    const remainingCredits = (user.credits || 0) - requiredCredits;
    const updated = { ...user, credits: remainingCredits };
    setUser(updated);
    localStorage.setItem('tp-auth-user', JSON.stringify(updated));

    // Update credit on server (send remaining balance)
    const creditResult = await updateCredit(user.id, remainingCredits);
    if (creditResult.success && creditResult.balance !== undefined) {
      // Sync with server balance
      const synced = { ...updated, credits: creditResult.balance };
      setUser(synced);
      localStorage.setItem('tp-auth-user', JSON.stringify(synced));
    }

    // 1. Change document title to get a nice filename
    const originalTitle = document.title;
    const safeName = resumeData.personalInfo.fullName.replace(/[^a-zA-Z0-9]/g, '_') || 'Document';
    const type = activeView === 'resume' ? 'Resume' : 'Cover_Letter';
    document.title = `BaraCV_${safeName}_${type}`;

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

  const handleAuthComplete = async (profile: AuthUser) => {
    const normalized = { ...profile, plan: profile.plan || 'free' as const };
    setUser(normalized);
    localStorage.setItem('tp-auth-user', JSON.stringify(normalized));
    
    // Fetch latest balance after authentication
    if (normalized.id && normalized.token) {
      const balanceResult = await getBalance();
      if (balanceResult.success && balanceResult.credits !== undefined) {
        const updated = {
          ...normalized,
          credits: balanceResult.credits,
        };
        setUser(updated);
        localStorage.setItem('tp-auth-user', JSON.stringify(updated));
      }
    }
    
    if (pendingCheckout) {
      setShowCheckout(true);
      setPendingCheckout(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('tp-auth-user');
  };

  const handleStartCheckout = () => {
    if (!user) {
      setPendingCheckout(true);
      setShowAuth(true);
      return;
    }
    setShowCheckout(true);
  };

  const handleCheckoutComplete = async (result: CheckoutResult) => {
    if (!user) return;
    
    // Update credits locally first
    const updated = { 
      ...user, 
      credits: (user.credits || 0) + result.credits 
    };
    setUser(updated);
    localStorage.setItem('tp-auth-user', JSON.stringify(updated));
    
    // Then fetch latest balance from API to ensure sync
    if (user.id && user.token) {
      const balanceResult = await getBalance();
      if (balanceResult.success && balanceResult.credits !== undefined) {
        const synced = {
          ...updated,
          credits: balanceResult.credits,
        };
        setUser(synced);
        localStorage.setItem('tp-auth-user', JSON.stringify(synced));
      }
    }
  };

  const handleCreditsUpdate = (newCredits: number) => {
    if (!user) return;
    const updated = { ...user, credits: newCredits };
    setUser(updated);
    localStorage.setItem('tp-auth-user', JSON.stringify(updated));
  };

  const t = TRANSLATIONS[lang];
  const hasPro = user?.plan === 'pro';
  const userCredits = user?.credits || 0;
  // Calculate required credits: 2 for both resume and cover letter
  const requiredCredits = 2;
  const hasEnoughCredits = userCredits >= requiredCredits;

  const handleGetStarted = () => {
    setShowLanding(false);
    localStorage.setItem('baracv-has-seen-landing', 'true');
  };

  // Show landing page if not dismissed
  if (showLanding) {
    return <LandingPage lang={lang} onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible print:block">
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 z-20 shadow-sm shrink-0 print:hidden relative">
        {/* Left: Logo */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">BCV</div>
          <h1 className="text-lg md:text-xl font-bold text-gray-800 tracking-tight hidden sm:block">BaraCV Builder</h1>
        </div>
        
        {/* Center: View Toggle - Hidden on mobile, shown on tablet+ */}
        <div className="hidden md:flex bg-gray-100 p-1 rounded-lg gap-1">
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
        
        {/* Right: Actions - Desktop */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition font-medium text-sm px-3 py-1.5 rounded-md hover:bg-gray-50"
          >
            <Globe size={18} />
            <span className="hidden lg:inline">{lang === 'en' ? 'English' : 'Français'}</span>
          </button>
          <button
            onClick={handleStartCheckout}
            className={`flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-md border transition ${hasPro ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
          >
            <CreditCard size={16} />
            <span className="hidden lg:inline">{hasPro ? t.proActive : t.upgrade}</span>
          </button>
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-md border border-emerald-200 relative group">
                <span className="text-xs font-semibold text-emerald-700">{t.credits}:</span>
                <span className="text-sm font-bold text-emerald-800">{userCredits}</span>
                {/* Credit Usage Info Tooltip */}
                <div className="absolute top-full right-0 mt-2 w-80 p-3 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-50 hidden lg:block">
                  <div className="font-semibold mb-2 text-emerald-400">{t.creditUsage}</div>
                  <div className="space-y-1 text-gray-200">
                    <div>• {t.resumeDownloadCost}: <span className="text-emerald-400 font-semibold">2 {t.creditsText}</span></div>
                    <div>• {t.coverLetterDownloadCost}: <span className="text-emerald-400 font-semibold">2 {t.creditsText}</span></div>
                    <div>• {t.aiFeaturesCost}: <span className="text-emerald-400 font-semibold">1 {t.creditText} {t.each}</span></div>
                    <div className="text-xs text-gray-400 mt-2 italic">({t.aiCreditsNote})</div>
                  </div>
                </div>
              </div>
              <span className="text-sm text-gray-600 hidden xl:inline">{user.name.split(' ')[0]}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-md hover:bg-gray-50 transition"
                title={t.authSignOut}
              >
                <LogOut size={16} />
                <span className="hidden lg:inline">{t.authSignOut}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="flex items-center gap-2 text-sm text-gray-700 px-3 py-1.5 rounded-md border border-gray-200 hover:border-emerald-300 hover:text-emerald-700 transition"
            >
              <LogIn size={16} />
              <span className="hidden lg:inline">{t.authSignIn}</span>
            </button>
          )}
          <div className="relative group">
            {!user ? (
              <button 
                onClick={() => setShowAuth(true)}
                className="bg-gray-400 text-white px-4 lg:px-5 py-2.5 rounded-lg flex items-center gap-2 cursor-not-allowed transition shadow-md font-medium text-sm"
                title={t.signInToDownload}
              >
                <Download size={18} />
                <span className="hidden lg:inline">{t.print}</span>
              </button>
            ) : (
              <button 
                onClick={!hasEnoughCredits ? () => setShowCheckout(true) : handlePrint}
                disabled={!hasEnoughCredits}
                className={`px-4 lg:px-5 py-2.5 rounded-lg flex items-center gap-2 transition shadow-md font-medium text-sm ${
                  !hasEnoughCredits 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-gray-900 text-white hover:bg-gray-800 active:transform active:scale-95'
                }`}
                title={!hasEnoughCredits ? t.insufficientCredits : ''}
              >
                <Download size={18} />
                <span className="hidden lg:inline">{t.print}</span>
              </button>
            )}
            <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-50 text-center hidden lg:block">
               {!user 
                 ? t.signInToDownload 
                 : !hasEnoughCredits 
                   ? t.insufficientCredits 
                   : `${t.printTooltip} (${t.credits}: ${userCredits}, 2 credits required)`}
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
          aria-label="Toggle menu"
        >
          {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-30 md:hidden">
            <div className="px-4 py-3 space-y-3">
              {/* View Toggle for Mobile */}
              <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                <button 
                  onClick={() => { setActiveView('resume'); setShowMobileMenu(false); }}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition flex items-center justify-center gap-2 ${activeView === 'resume' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                >
                  <User size={16} /> {t.viewResume}
                </button>
                <button 
                  onClick={() => { setActiveView('cover-letter'); setShowMobileMenu(false); }}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition flex items-center justify-center gap-2 ${activeView === 'cover-letter' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                >
                  <FileText size={16} /> {t.viewCoverLetter}
                </button>
              </div>

              {/* Language Toggle */}
              <button 
                onClick={() => { toggleLanguage(); setShowMobileMenu(false); }}
                className="w-full flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md transition"
              >
                <div className="flex items-center gap-2">
                  <Globe size={18} />
                  <span className="text-sm font-medium">{t.language || 'Language'}</span>
                </div>
                <span className="text-sm">{lang === 'en' ? 'English' : 'Français'}</span>
              </button>

              {/* Credits Display */}
              {user && (
                <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 rounded-md border border-emerald-200">
                  <span className="text-sm font-semibold text-emerald-700">{t.credits}:</span>
                  <span className="text-sm font-bold text-emerald-800">{userCredits}</span>
                </div>
              )}

              {/* Upgrade Button */}
              <button
                onClick={() => { handleStartCheckout(); setShowMobileMenu(false); }}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border transition text-sm font-semibold ${hasPro ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
              >
                <CreditCard size={16} />
                {hasPro ? t.proActive : t.upgrade}
              </button>

              {/* User Info */}
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-600 border-t border-gray-200">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <button
                    onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition"
                  >
                    <LogOut size={16} />
                    {t.authSignOut}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setShowAuth(true); setShowMobileMenu(false); }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-200 hover:border-emerald-300 hover:text-emerald-700 rounded-md transition"
                >
                  <LogIn size={16} />
                  {t.authSignIn}
                </button>
              )}

              {/* Download Button */}
              <div className="pt-2 border-t border-gray-200">
                {!user ? (
                  <button 
                    onClick={() => { setShowAuth(true); setShowMobileMenu(false); }}
                    className="w-full bg-gray-400 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition shadow-md font-medium text-sm"
                  >
                    <Download size={18} />
                    {t.print}
                  </button>
                ) : (
                  <button 
                    onClick={() => { 
                      if (!hasEnoughCredits) {
                        setShowCheckout(true);
                      } else {
                        handlePrint();
                      }
                      setShowMobileMenu(false);
                    }}
                    disabled={!hasEnoughCredits}
                    className={`w-full px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition shadow-md font-medium text-sm ${
                      !hasEnoughCredits 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    <Download size={18} />
                    {t.print}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden print:overflow-visible print:h-auto print:block">
        
        {/* Mobile Tabs - Only visible on mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 print:hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${
                activeTab === 'editor'
                  ? 'bg-emerald-50 text-emerald-700 border-t-2 border-emerald-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Edit size={18} />
              {t.editor}
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${
                activeTab === 'preview'
                  ? 'bg-emerald-50 text-emerald-700 border-t-2 border-emerald-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye size={18} />
              {t.preview}
            </button>
          </div>
        </div>

        {/* Left Side: Editor (Scrollable) - Desktop: Always visible, Mobile: Tab-based */}
        <div className={`${
          activeTab === 'editor' ? 'block' : 'hidden'
        } md:block w-full md:w-1/3 md:min-w-[400px] h-full md:h-auto pb-16 md:pb-0 border-r border-gray-200 bg-white z-10 overflow-y-auto print:hidden`}>
          <Editor 
            data={resumeData} 
            onChange={setResumeData} 
            lang={lang} 
            activeView={activeView}
            setActiveView={setActiveView}
            user={user}
            hasPro={hasPro}
            onUpgrade={handleStartCheckout}
            onCreditsUpdate={handleCreditsUpdate}
          />
        </div>

        {/* Right Side: Preview (Scrollable) - Desktop: Always visible, Mobile: Tab-based */}
        <div className={`${
          activeTab === 'preview' ? 'block' : 'hidden'
        } md:flex flex-1 bg-gray-100 overflow-y-auto overflow-x-auto p-4 md:p-12 flex justify-center items-start print:p-0 print:bg-white print:overflow-visible print:h-auto print:block pb-20 md:pb-12 relative`}>
          {/* Mobile Zoom Controls - Only visible on mobile */}
          <div className="md:hidden fixed bottom-20 right-4 z-40 flex flex-col gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
            <button
              onClick={() => setPreviewZoom(prev => Math.min(prev + 0.1, 1.5))}
              className="p-2 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 transition active:scale-95"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={() => setPreviewZoom(prev => Math.max(prev - 0.1, 0.3))}
              className="p-2 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 transition active:scale-95"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={() => setPreviewZoom(0.5)}
              className="p-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition active:scale-95"
              title="Reset Zoom"
            >
              <RotateCcw size={20} />
            </button>
            <div className="text-xs text-center text-gray-500 pt-1 border-t border-gray-200">
              {Math.round(previewZoom * 100)}%
            </div>
          </div>
          
          {/* 
            Wrapper for scaling. 
            In print mode, we remove scaling, margins, and transforms to let it flow naturally as a page 
          */}
          <div 
            className="origin-top transition-transform duration-200 print:scale-100 print:transform-none print:m-0 print:p-0 print:w-full preview-zoom-mobile md:scale-90 lg:scale-100 xl:scale-100"
            style={{
              transform: `scale(${previewZoom})`,
              transformOrigin: 'top center',
            }}
          >
             {activeView === 'resume' ? (
                 <ResumePreview data={resumeData} lang={lang} showWatermark={!hasPro} />
             ) : (
                 <CoverLetterPreview data={resumeData} lang={lang} showWatermark={!hasPro} />
             )}
          </div>
        </div>
      </div>
      <AuthModal
        isOpen={showAuth}
        lang={lang}
        onClose={() => { setShowAuth(false); setPendingCheckout(false); }}
        onAuthenticated={handleAuthComplete}
      />
      <CheckoutModal
        isOpen={showCheckout}
        lang={lang}
        user={user}
        onClose={() => setShowCheckout(false)}
        onComplete={handleCheckoutComplete}
      />
    </div>
  );
};

export default App;
