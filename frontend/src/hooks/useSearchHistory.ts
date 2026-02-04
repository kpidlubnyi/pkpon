import { useState } from 'react';
import type { Stop } from '../types';

const MAX_HISTORY_ITEMS = 5;
const SHARED_STORAGE_KEY = 'search-history-shared';

export const useSearchHistory = () => {
  const [history, setHistory] = useState<Stop[]>(() => {
    try {
      const saved = localStorage.getItem(SHARED_STORAGE_KEY);
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
        localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('Failed to save search history:', error);
      }
      
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(SHARED_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  return { history, addToHistory, clearHistory };
};