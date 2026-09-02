import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-amber-500/90 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md backdrop-blur-sm animate-pulse">
      <WifiOff className="w-3.5 h-3.5" />
      <span>You are in offline mode. Flashcards and cached tests remain accessible.</span>
    </div>
  );
}