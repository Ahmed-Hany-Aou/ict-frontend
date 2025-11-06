import React, { useState, useEffect } from 'react';
import { ExternalLink, Download, Upload } from 'lucide-react';

const InstallButton: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    const checkInstallStatus = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(standalone);

      const wasInstalled = localStorage.getItem('pwa_installed') === 'true';
      setIsInstalled(wasInstalled);
    };

    checkInstallStatus();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      localStorage.setItem('pwa_installed', 'true');
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // SIMPLIFIED: Clear single action for each button
  const handleOpenInApp = () => {
    // For installed apps, just navigate to the same URL - should open in PWA
    window.location.href = window.location.origin;
  };

  const handleInstallPrompt = async () => {
    if (!installPrompt) return;
    
    try {
      (installPrompt as any).prompt();
      const { outcome } = await (installPrompt as any).userChoice;
      
      if (outcome === 'accepted') {
        localStorage.setItem('pwa_installed', 'true');
        setIsInstalled(true);
      }
    } catch (error) {
      console.error('Install failed:', error);
    }
    
    setInstallPrompt(null);
  };

  const handleIosInstructions = () => {
    window.open('/install', '_blank');
  };

  // CLEAN LOGIC: One clear path for each scenario
  const getButtonState = () => {
    // 1. If we're IN the app, show nothing
    if (isStandalone) return 'none';
    
    // 2. If install prompt available (Android/Desktop Chrome), show install
    if (installPrompt) return 'install';
    
    // 3. If app is already installed, show "Open in App"
    if (isInstalled) return 'open';
    
    // 4. If iOS (no install prompt), show iOS instructions
    if (isIos) return 'ios';
    
    // 5. Default: show nothing (or could show generic instructions)
    return 'none';
  };

  const buttonState = getButtonState();

  // Don't show anything in the installed app
  if (buttonState === 'none') return null;

  // Render the appropriate button
  return (
    <div className="w-full">
      {buttonState === 'open' && (
        <button 
          onClick={handleOpenInApp}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <ExternalLink size={20} />
          <span className="font-medium">Open in App</span>
        </button>
      )}
      
      {buttonState === 'install' && (
        <button 
          onClick={handleInstallPrompt}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Download size={20} />
          <span className="font-medium">Install App</span>
        </button>
      )}
      
      {buttonState === 'ios' && (
        <button 
          onClick={handleIosInstructions}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Upload size={20} />
          <span className="font-medium">Add to Home Screen</span>
        </button>
      )}
    </div>
  );
};

export default InstallButton;