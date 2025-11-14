import React, { useState, useEffect } from 'react';
import { Download, Upload, ExternalLink, Share2 } from 'lucide-react';

const InstallButton: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in standalone mode (app is installed and running)
    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(standalone);
    };

    // Detect iOS platform
    const userAgent = navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(iosDevice);

    checkStandalone();

    // Check if app was previously installed
    const wasInstalled = localStorage.getItem('pwa_installed') === 'true';
    setIsInstalled(wasInstalled);

    // Handle beforeinstallprompt event (Android/Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      localStorage.setItem('pwa_installed', 'true');
      setIsInstalled(true);
      setInstallPrompt(null);
      // Recheck standalone status after installation
      setTimeout(checkStandalone, 100);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Helper function to guide user to open the installed PWA
  const guideOpenPWA = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(userAgent);
    const isDesktop = !isAndroid && !/iphone|ipad|ipod/.test(userAgent);

    let message = '✨ To open the installed app:\n\n';

    if (isAndroid) {
      message += '📱 Android:\n';
      message += '• Find "WADHA" icon on your home screen and tap it\n';
      message += '• OR use the "Open app" button in your browser\'s address bar\n';
    } else if (isDesktop) {
      message += '💻 Desktop:\n';
      message += '• Click the app icon (🔗) in your browser\'s address bar\n';
      message += '• OR find "WADHA" in your Start Menu/Applications\n';
    } else {
      message += '• Find "WADHA" icon on your home screen\n';
      message += '• Tap it to open the app\n';
    }

    alert(message);
  };

  // SMART HANDLER: Prioritizes install prompt, then guides user
  const handleButtonClick = async () => {
    // 1. PRIORITY: If install prompt is available, trigger it (like browser's native icon)
    if (installPrompt) {
      try {
        (installPrompt as any).prompt();
        const { outcome } = await (installPrompt as any).userChoice;

        if (outcome === 'accepted') {
          localStorage.setItem('pwa_installed', 'true');
          setIsInstalled(true);
          console.log('App installation accepted');

          // Show success message and guide to open
          setTimeout(() => {
            alert('✅ App installed successfully!\n\nYou can now open it from your home screen or use the browser\'s "Open app" button.');
          }, 500);
        }
      } catch (error) {
        console.error('Install failed:', error);
        // Fallback to instructions on error
        window.open('/install', '_blank');
      }

      setInstallPrompt(null);
      return;
    }

    // 2. FALLBACK: If no prompt but app is installed, guide user to open it
    if (isInstalled && !isStandalone) {
      guideOpenPWA();
      return;
    }

    // 3. LAST RESORT: Show instructions
    window.open('/install', '_blank');
  };

  // Handle iOS instructions
  const handleIosInstructions = () => {
    window.open('/install', '_blank');
  };

  // Handle share functionality
  const handleShare = async () => {
    const shareData = {
      title: 'ICT Learning Platform',
      text: 'Check out this amazing learning platform!',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        // Use native share if available
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.origin);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // COMPLETE LOGIC: All user cases covered
  const getButtonState = () => {
    // 1. Running in standalone mode (app installed and running) → Only show share button
    if (isStandalone) return 'standalone';

    // 2. App marked as installed (show purple, even if installPrompt exists)
    // The handleButtonClick will use installPrompt if available, or guide user to open
    if (isInstalled && !isStandalone) return 'open';

    // 3. iOS device (no native install prompt) → Show iOS instructions
    if (isIos) return 'ios';

    // 4. Install prompt available (Android/Chrome/Edge) → Show install button
    if (installPrompt) return 'install';

    // 5. Default (no install prompt, not installed) → Show nothing
    return 'none';
  };

  const buttonState = getButtonState();

  // Render the appropriate button(s)
  return (
    <div className="w-full space-y-2">
      {/* Main Install/Open Button - Uses smart unified handler */}
      {buttonState === 'install' && (
        <>
          <button
            onClick={handleButtonClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Download size={20} />
            <span className="font-medium">Install App</span>
          </button>

          {/* Share Button - Visible in browser */}
          <button
            onClick={handleShare}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-600 hover:text-white transition-all duration-200 bg-blue-800 bg-opacity-50"
          >
            <Share2 size={20} />
            <span className="font-medium">Share App</span>
          </button>
        </>
      )}

      {buttonState === 'open' && (
        <>
          <button
            onClick={handleButtonClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ExternalLink size={20} />
            <span className="font-medium">Open in App</span>
          </button>

          {/* Share Button - Visible in browser */}
          <button
            onClick={handleShare}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-600 hover:text-white transition-all duration-200 bg-blue-800 bg-opacity-50"
          >
            <Share2 size={20} />
            <span className="font-medium">Share App</span>
          </button>
        </>
      )}

      {buttonState === 'ios' && (
        <>
          <button
            onClick={handleIosInstructions}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Upload size={20} />
            <span className="font-medium">Add to Home Screen</span>
          </button>

          {/* Share Button - Visible in browser */}
          <button
            onClick={handleShare}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-600 hover:text-white transition-all duration-200 bg-blue-800 bg-opacity-50"
          >
            <Share2 size={20} />
            <span className="font-medium">Share App</span>
          </button>
        </>
      )}

      {/* Standalone mode - Only show share button */}
      {buttonState === 'standalone' && (
        <button
          onClick={handleShare}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-blue-600 hover:text-white transition-all duration-200 bg-blue-800 bg-opacity-50"
        >
          <Share2 size={20} />
          <span className="font-medium">Share App</span>
        </button>
      )}

      {/* If no buttons to show, return null */}
      {buttonState === 'none' && null}
    </div>
  );
};

export default InstallButton;