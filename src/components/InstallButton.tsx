import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

const InstallButton: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  useEffect(() => {
    // Get current URL for opening the app
    setCurrentUrl(window.location.href);

    const checkInstallStatus = () => {
      // Multiple ways to detect if app is installed
      const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const hasReferrer = document.referrer.includes('android-app://') || document.referrer.includes('ios-app://');
      
      setIsInstalled(isInStandaloneMode || hasReferrer);
    };

    // Check initial status
    checkInstallStatus();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      console.log('App was installed');
      setIsInstalled(true);
      setInstallPrompt(null);
      // Store in localStorage for future reference
      localStorage.setItem('pwa_installed', 'true');
    };

    // Check URL parameters for install detection
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('installed') === 'true') {
      setIsInstalled(true);
    }

    // Check localStorage
    if (localStorage.getItem('pwa_installed') === 'true') {
      setIsInstalled(true);
    }

    // Listen for visibility changes (user might have installed the app)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setTimeout(checkInstallStatus, 1000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic check for install status
    const interval = setInterval(checkInstallStatus, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  const handleInstallClick = async (): Promise<void> => {
    if (isInstalled) {
      // Open the current page in the installed app
      window.location.href = currentUrl;
      return;
    }

    if (!installPrompt) {
      window.open('/install', '_blank');
      return;
    }

    try {
      (installPrompt as any).prompt();
      const { outcome } = await (installPrompt as any).userChoice;
      
      if (outcome === 'accepted') {
        console.log('User installed the PWA');
        localStorage.setItem('pwa_installed', 'true');
        setIsInstalled(true);
      }
    } catch (error) {
      console.error('Install failed:', error);
      window.open('/install', '_blank');
    }
    
    setInstallPrompt(null);
  };

  const handleOpenInApp = () => {
    // Force open in the installed app
    window.location.href = currentUrl;
  };

  // If app is installed, show "Open in App" button
  if (isInstalled) {
    return (
      <button 
        onClick={handleOpenInApp}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <ExternalLink size={20} />
        <span className="font-medium">Open in App</span>
      </button>
    );
  }

  // If install prompt is available, show install button
  if (installPrompt) {
    return (
      <button 
        onClick={handleInstallClick}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <span className="text-lg">📲</span>
        <span className="font-medium">Install App</span>
      </button>
    );
  }

  // If no prompt and not installed, don't show anything (Install Instructions will handle it)
  return null;
};

export default InstallButton;