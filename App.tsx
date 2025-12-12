
import React, { useState, useEffect, useRef } from 'react';
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
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';

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
  const [showIOSDownloadHelp, setShowIOSDownloadHelp] = useState(false);
  const [pendingIOSShare, setPendingIOSShare] = useState<{ blob: Blob; filename: string } | null>(null);
  const previewRef = useRef<HTMLDivElement>(null); // Ref for PDF generation

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

  // Function to generate and download PDF (extracted for reuse)
  const generateAndDownloadPDF = async () => {
    if (!user) return;

    // Calculate required credits: 2 for both resume and cover letter
    const requiredCredits = 2;

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

    // Generate PDF filename with person's name
    const safeName = resumeData.personalInfo.fullName.replace(/[^a-zA-Z0-9]/g, '_') || 'Document';
    const type = activeView === 'resume' ? 'Resume' : 'Cover_Letter';
    const filename = `BaraCV_${safeName}_${type}.pdf`;

    // Find the preview element to convert to PDF
    // The preview is inside a div with the preview content
    const previewElement = previewRef.current;
    if (!previewElement) {
      console.error('Preview element not found');
      return;
    }

    // Find the actual resume/cover letter content (the element with width: 210mm)
    // This should be the inner element without the zoom transform
    let contentElement: HTMLElement | null = previewElement.querySelector('.resume-page');
    
    // If not found, try to find element with 210mm width (for cover letter)
    if (!contentElement) {
      const allElements = previewElement.querySelectorAll('*');
      for (const el of allElements) {
        const htmlEl = el as HTMLElement;
        if (htmlEl.style.width && htmlEl.style.width.includes('210mm')) {
          contentElement = htmlEl;
          break;
        }
      }
    }
    
    // Fallback to first child or preview element itself
    if (!contentElement) {
      contentElement = (previewElement.firstElementChild as HTMLElement) || previewElement;
    }

    if (!contentElement) {
      console.error('Content element not found');
      return;
    }

    // Temporarily remove zoom transform for PDF generation to ensure correct size
    const originalTransform = previewElement.style.transform;
    const originalTransformOrigin = previewElement.style.transformOrigin;
    previewElement.style.transform = 'scale(1)';
    previewElement.style.transformOrigin = 'top center';

    // Temporarily modify content element to prevent extra blank pages
    const originalMinHeight = contentElement.style.minHeight;
    const originalHeight = contentElement.style.height;
    // Remove minHeight constraint to let content size naturally
    contentElement.style.minHeight = 'auto';
    contentElement.style.height = 'auto';

    // Hide watermark elements before PDF generation
    // Watermarks have class "print:hidden" and contain "BaraCV Preview" text
    const watermarkElements = contentElement.querySelectorAll('.print\\:hidden, [class*="print:hidden"]');
    const watermarkDisplayStates: Array<{ element: HTMLElement; originalDisplay: string }> = [];
    
    watermarkElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      watermarkDisplayStates.push({
        element: htmlEl,
        originalDisplay: htmlEl.style.display || window.getComputedStyle(htmlEl).display
      });
      htmlEl.style.display = 'none';
    });
    
    // Also hide any elements with opacity 0.22 (watermark styling)
    const opacityElements = contentElement.querySelectorAll('*');
    opacityElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);
      if (computedStyle.opacity === '0.22' || htmlEl.textContent?.includes('BaraCV Preview')) {
        if (!watermarkDisplayStates.find(w => w.element === htmlEl)) {
          watermarkDisplayStates.push({
            element: htmlEl,
            originalDisplay: htmlEl.style.display || computedStyle.display
          });
          htmlEl.style.display = 'none';
        }
      }
    });

    // Configure PDF options for A4 size (210mm x 297mm)
    // Get the actual content width
    const contentWidth = contentElement.offsetWidth || 794; // 794px = 210mm at 96 DPI
    
    const opt = {
      margin: [0, 0, 0, 0],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      enableLinks: false,
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        width: contentWidth,
        // Don't specify height - let it calculate from content
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: contentElement.style.backgroundColor || '#ffffff',
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4',
        orientation: 'portrait',
        compress: true,
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: ['img', '.no-break'],
      },
    };

    try {
      // Wait a bit for styles to apply
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Use html2canvas directly to generate canvas from content
      const canvas = await html2canvas(contentElement as HTMLElement, {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        width: contentWidth,
        backgroundColor: contentElement.style.backgroundColor || '#ffffff',
      });
      
      if (!canvas) {
        throw new Error('Failed to generate canvas');
      }
      
      // Now use jsPDF directly to have full control over pages
      const { jsPDF } = await import('jspdf');
      
      // A4 dimensions in mm
      const a4WidthMm = 210;
      const a4HeightMm = 297;
      
      // Calculate image dimensions to fit A4 width
      const imgWidthMm = a4WidthMm;
      const imgHeightMm = (canvas.height / canvas.width) * a4WidthMm;
      
      // Calculate how many pages we actually need
      const totalPages = Math.ceil(imgHeightMm / a4HeightMm);
      
      // Create PDF with first page
      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true,
      });
      
      // Add content page by page, cropping each page's content
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calculate the source rectangle for this page
        const sourceY = i * a4HeightMm * (canvas.width / imgWidthMm);
        const sourceHeight = Math.min(
          a4HeightMm * (canvas.width / imgWidthMm),
          canvas.height - sourceY
        );
        
        // Only add if there's content for this page
        if (sourceHeight > 0 && sourceY < canvas.height) {
          // Create a cropped canvas for this page
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.ceil(sourceHeight);
          const ctx = pageCanvas.getContext('2d');
          
          if (ctx) {
            // Fill with background color first
            ctx.fillStyle = contentElement.style.backgroundColor || '#ffffff';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            
            // Draw only the portion of the image for this page
            ctx.drawImage(
              canvas,
              0, sourceY,
              canvas.width, sourceHeight,
              0, 0,
              canvas.width, sourceHeight
            );
            
            // Calculate the height in mm for this page (should be <= a4HeightMm)
            const pageHeightMm = Math.min(
              (sourceHeight / canvas.width) * imgWidthMm,
              a4HeightMm
            );
            
            // Add this page's cropped content to PDF at position 0,0
            pdf.addImage(
              pageCanvas.toDataURL('image/jpeg', 0.98),
              'JPEG',
              0,
              0,
              imgWidthMm,
              pageHeightMm
            );
          }
        }
      }
      
      // Save the PDF - iOS requires special handling
      // Detect iOS devices
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      if (isIOS) {
        // iOS Safari - use Web Share API with direct file link approach
        try {
          const pdfBlob = pdf.output('blob');
          const url = URL.createObjectURL(pdfBlob);
          
          // Create file with proper MIME type for Web Share API
          const file = new File([pdfBlob], filename, { 
            type: 'application/pdf',
            lastModified: Date.now()
          });
          
          // Try Web Share API first (preferred method)
          if (navigator.share) {
            try {
              // Check if we can share files
              let canShareFiles = false;
              if (navigator.canShare) {
                try {
                  canShareFiles = navigator.canShare({ files: [file] });
                } catch (e) {
                  // canShare might throw, try anyway
                }
              }
              
              if (canShareFiles) {
                await navigator.share({
                  title: filename,
                  files: [file],
                });
                URL.revokeObjectURL(url);
                return; // Successfully shared
              }
            } catch (shareError: any) {
              if (shareError.name === 'AbortError' || shareError.name === 'NotAllowedError') {
                // User cancelled
                URL.revokeObjectURL(url);
                return;
              }
              console.log('Web Share API failed, using direct link method:', shareError);
            }
          }
          
          // Fallback: Use direct file link with hidden <a> tag
          // This triggers the browser's share menu on iOS
          const link = document.createElement('a');
          link.href = url;
          link.download = filename; // iOS ignores this but it's good practice
          link.style.display = 'none';
          document.body.appendChild(link);
          
          // Click the link - this will open the PDF and user can use browser's share button
          link.click();
          
          // Clean up after a delay
          setTimeout(() => {
            if (document.body.contains(link)) {
              document.body.removeChild(link);
            }
            URL.revokeObjectURL(url);
          }, 1000);
          
        } catch (error: any) {
          console.error('iOS PDF share failed:', error);
          // Final fallback: try to open blob URL directly
          try {
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
              if (document.body.contains(link)) {
                document.body.removeChild(link);
              }
              URL.revokeObjectURL(url);
            }, 1000);
          } catch (blobError) {
            console.error('All iOS methods failed:', blobError);
            alert('Unable to share PDF on iOS. Please try using a different browser or device.');
          }
        }
      } else {
        // Non-iOS devices: use standard download approach
        try {
          const pdfBlob = pdf.output('blob');
          const url = URL.createObjectURL(pdfBlob);
          
          // Create a temporary link element for download
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.style.display = 'none';
          link.setAttribute('download', filename);
          
          // Append to body
          document.body.appendChild(link);
          
          // Trigger download immediately (synchronous within user interaction)
          link.click();
          
          // Clean up after a short delay
          setTimeout(() => {
            if (document.body.contains(link)) {
              document.body.removeChild(link);
            }
            URL.revokeObjectURL(url);
          }, 200);
        } catch (error) {
          // Fallback to direct save method
          console.warn('Blob download failed, trying direct save:', error);
          pdf.save(filename);
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      // Restore original transform and transform origin
      previewElement.style.transform = originalTransform;
      previewElement.style.transformOrigin = originalTransformOrigin;
      
      // Restore content element styles
      contentElement.style.minHeight = originalMinHeight;
      contentElement.style.height = originalHeight;
      
      // Restore watermark visibility
      watermarkDisplayStates.forEach(({ element, originalDisplay }) => {
        element.style.display = originalDisplay;
      });
    }
  };

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

    // Detect iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                 (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // On iOS, generate PDF and open share sheet directly
    if (isIOS) {
      // Switch to preview tab first if currently on editor tab
      if (activeTab === 'editor') {
        setActiveTab('preview');
        // Wait for preview to render
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Generate PDF and share directly (no modal)
      await generateAndDownloadPDF();
      return;
    }

    // For non-iOS devices, proceed directly with PDF generation
    await generateAndDownloadPDF();
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
  
  // Detect iOS devices for UI customization
  const isIOS = typeof window !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
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
            ref={previewRef}
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
      
      {/* iOS Download Help Modal */}
      {showIOSDownloadHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {lang === 'fr' ? 'Enregistrer votre PDF' : 'Save Your PDF'}
            </h3>
            <div className="space-y-4 text-gray-700">
              <p className="text-sm font-medium">
                {lang === 'fr' 
                  ? 'Cliquez sur "Continuer" pour ouvrir le menu de partage iOS. Sélectionnez "Enregistrer dans Fichiers" pour accéder à l\'application Fichiers et sauvegarder votre PDF.' 
                  : 'Click "Continue" to open the iOS share menu. Select "Save to Files" to access the Files app and save your PDF.'}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="text-blue-800 font-semibold mb-2 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#007AFF"/>
                    <path d="M2 17L12 22L22 17" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {lang === 'fr' ? 'Étapes:' : 'Steps:'}
                </p>
                <ol className="list-decimal list-inside space-y-2 text-blue-700">
                  <li>{lang === 'fr' ? 'Cliquez sur "Continuer" ci-dessous' : 'Click "Continue" below'}</li>
                  <li>{lang === 'fr' ? 'Le menu de partage iOS s\'ouvrira automatiquement' : 'The iOS share menu will open automatically'}</li>
                  <li>{lang === 'fr' ? 'Sélectionnez "Enregistrer dans Fichiers"' : 'Select "Save to Files"'}</li>
                  <li>{lang === 'fr' ? 'L\'application Fichiers s\'ouvrira - choisissez l\'emplacement et enregistrez' : 'The Files app will open - choose location and save'}</li>
                </ol>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowIOSDownloadHelp(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                {lang === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                onClick={async () => {
                  if (!pendingIOSShare) {
                    setShowIOSDownloadHelp(false);
                    await generateAndDownloadPDF();
                    return;
                  }

                  setShowIOSDownloadHelp(false);
                  
                  // Immediately call share from user interaction
                  try {
                    const file = new File([pendingIOSShare.blob], pendingIOSShare.filename, { 
                      type: 'application/pdf',
                      lastModified: Date.now()
                    });

                    if (navigator.share) {
                      // Try to share the file
                      try {
                        await navigator.share({
                          title: pendingIOSShare.filename,
                          files: [file],
                        });
                        setPendingIOSShare(null);
                        return;
                      } catch (shareError: any) {
                        if (shareError.name === 'AbortError' || shareError.name === 'NotAllowedError') {
                          setPendingIOSShare(null);
                          return;
                        }
                        console.log('Share with files failed, trying blob URL:', shareError);
                      }
                    }
                    
                    // Fallback: open blob URL
                    const url = URL.createObjectURL(pendingIOSShare.blob);
                    const newWindow = window.open(url, '_blank');
                    if (!newWindow || newWindow.closed) {
                      window.location.href = url;
                    } else {
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                    }
                    setPendingIOSShare(null);
                  } catch (error) {
                    console.error('Failed to share PDF:', error);
                    setPendingIOSShare(null);
                  }
                }}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
              >
                {lang === 'fr' ? 'Continuer' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
