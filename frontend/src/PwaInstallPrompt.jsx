import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (isIosDevice && !isInStandaloneMode) {
      setIsIos(true);
      const hasDismissed = localStorage.getItem('shiksha_ios_pwa_dismissed');
      if (!hasDismissed) {
        setShowPrompt(true);
      }
    }

    // Capture Android / Chrome install event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIos) {
      localStorage.setItem('shiksha_ios_pwa_dismissed', 'true');
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-bounce-short">
      <div className="bg-slate-800/95 border border-indigo-500/40 backdrop-blur-md rounded-2xl p-4 shadow-2xl shadow-indigo-950/50 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>

        <div className="flex-1 text-xs">
          <h4 className="font-bold text-slate-100 text-sm">Install ShikshaIQ App</h4>
          {isIos ? (
            <p className="text-slate-300 mt-1 leading-relaxed">
              Tap <Share className="w-3.5 h-3.5 inline text-indigo-400 mx-0.5" /> in Safari and select <strong className="text-white">"Add to Home Screen"</strong> for full-screen practice.
            </p>
          ) : (
            <p className="text-slate-300 mt-1 leading-relaxed">
              Install ShikshaIQ on your phone for faster test access and offline question caching.
            </p>
          )}

          {!isIos && (
            <button
              onClick={handleInstallClick}
              className="mt-2.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Now</span>
            </button>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-200 p-1 transition cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}