const OFFLINE_STORAGE_KEY = 'offlineChecklists';

interface OfflineChecklistEntry {
  id: string;
  timestamp: number;
  data: any; // This will store the payload
}

export const saveOfflineChecklist = (payload: any) => {
  const existing = getOfflineChecklists();
  const newEntry: OfflineChecklistEntry = {
    id: `offline-${Date.now()}`,
    timestamp: Date.now(),
    data: payload,
  };
  existing.push(newEntry);
  localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(existing));
  console.log('Checklist saved offline:', newEntry);
};

export const getOfflineChecklists = (): OfflineChecklistEntry[] => {
  const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const clearOfflineChecklist = (id: string) => {
  let existing = getOfflineChecklists();
  existing = existing.filter(entry => entry.id !== id);
  localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(existing));
};

export const clearAllOfflineChecklists = () => {
  localStorage.removeItem(OFFLINE_STORAGE_KEY);
};
