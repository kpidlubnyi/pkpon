import { useState } from 'react';
import type { Stop } from '../types';

const MAX_HISTORY_ITEMS = 5;
const STORAGE_PREFIX = 'search-history';

export const useSearchHistory = (storageKey: string) => {
  const fullStorageKey = `${STORAGE_PREFIX}-${storageKey}`;
  
  const [history, setHistory] = useState<Stop[]>(() => {
    try {
      const saved = localStorage.getItem(fullStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addToHistory = (stop: Stop) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item.stop_id !== stop.stop_id);
      
      const newHistory = [stop, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      
      try {
        localStorage.setItem(fullStorageKey, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Failed to save search history:', error);
      }
      
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(fullStorageKey);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  return { history, addToHistory, clearHistory };
};