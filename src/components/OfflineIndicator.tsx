import { useState, useEffect } from 'react';
import { getOfflineChecklists, clearOfflineChecklist } from '../utils/offlineStorage';

const OfflineIndicator = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkUnsynced = () => {
      const offlineItems = getOfflineChecklists();
      setUnsyncedCount(offlineItems.length);
    };

    checkUnsynced();
    window.addEventListener('storage', checkUnsynced);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', checkUnsynced);
    };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    console.log('Attempting to sync offline data...');

    const offlineChecklists = getOfflineChecklists();
    const VITE_APPSCRIPT_URL = import.meta.env.VITE_APPSCRIPT_URL;

    if (!VITE_APPSCRIPT_URL) {
      console.error('VITE_APPSCRIPT_URL is not set. Cannot sync.');
      setSyncing(false);
      return;
    }

    for (const checklist of offlineChecklists) {
      try {
        await fetch(VITE_APPSCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(checklist.data),
        });
        console.log(`Successfully synced checklist ${checklist.id}`);
        clearOfflineChecklist(checklist.id);
      } catch (error) {
        console.error(`Failed to sync checklist ${checklist.id}:`, error);
      }
    }

    setUnsyncedCount(getOfflineChecklists().length);
    setSyncing(false);
    console.log('Offline data sync completed.');
  };

  return (
    <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 ${
      online 
        ? 'bg-yellow-500 text-white' 
        : 'bg-red-500 text-white animate-pulse'
    }`}>
      {!online && (
        <>
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
          <div>
            <div className="font-semibold">You're Offline</div>
            <div className="text-xs opacity-90">Changes will sync when you're back online</div>
          </div>
        </>
      )}
      
      {online && unsyncedCount > 0 && (
        <>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <div className="flex-1">
            <div className="font-semibold">Syncing...</div>
            <div className="text-xs">{unsyncedCount} checklist{unsyncedCount > 1 ? 's' : ''} pending</div>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-3 py-1 bg-white text-yellow-600 rounded text-xs font-semibold hover:bg-yellow-50 disabled:opacity-50 transition-colors"
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;