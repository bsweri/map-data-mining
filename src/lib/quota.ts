export const FREE_DAILY_LIMIT = 10;
const QUOTA_KEY = 'lookinmaps_free_quota';

interface QuotaData {
  count: number;
  date: string;
  localId: string;
}

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const generateLocalId = () => {
  return 'local_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

export function getLocalQuota(): QuotaData {
  const today = getTodayDateString();
  const stored = localStorage.getItem(QUOTA_KEY);
  
  if (stored) {
    try {
      const data: QuotaData = JSON.parse(stored);
      if (data.date === today) {
        return data;
      }
    } catch (e) {
      // JSON parse error, ignore and create new
    }
  }

  // Generate new quota data for today
  const newData: QuotaData = {
    count: 0,
    date: today,
    localId: stored ? (JSON.parse(stored).localId || generateLocalId()) : generateLocalId()
  };
  
  localStorage.setItem(QUOTA_KEY, JSON.stringify(newData));
  return newData;
}

export function incrementLocalQuota(): void {
  const data = getLocalQuota();
  data.count += 1;
  localStorage.setItem(QUOTA_KEY, JSON.stringify(data));
}

export function hasExceededLocalQuota(): boolean {
  const data = getLocalQuota();
  return data.count >= FREE_DAILY_LIMIT;
}
