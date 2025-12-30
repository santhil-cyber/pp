import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ReportHistoryItem } from '../types';

interface ReportHistoryContextType {
  stockHistory: ReportHistoryItem[];
  salesHistory: ReportHistoryItem[];
  addReport: (item: ReportHistoryItem) => void;
  updateReport: (id: number, updates: Partial<ReportHistoryItem>) => void;
}

const ReportHistoryContext = createContext<ReportHistoryContextType | undefined>(undefined);

export const ReportHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize Stock History from LocalStorage
  const [stockHistory, setStockHistory] = useState<ReportHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('stockHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Initialize Sales History from LocalStorage
  const [salesHistory, setSalesHistory] = useState<ReportHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('salesHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist Stock History whenever it changes
  useEffect(() => {
    localStorage.setItem('stockHistory', JSON.stringify(stockHistory));
  }, [stockHistory]);

  // Persist Sales History whenever it changes
  useEffect(() => {
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
  }, [salesHistory]);

  const addReport = (item: ReportHistoryItem) => {
    if (item.type === 'STATUS_WISE_STOCK_REPORT') {
      setStockHistory(prev => [item, ...prev]);
    } else {
      setSalesHistory(prev => [item, ...prev]);
    }
  };

  const updateReport = (id: number, updates: Partial<ReportHistoryItem>) => {
    const updater = (prev: ReportHistoryItem[]) => 
      prev.map(item => item.id === id ? { ...item, ...updates } : item);

    // Apply update to both lists to be safe (id is unique timestamp)
    setStockHistory(updater);
    setSalesHistory(updater);
  };

  return (
    <ReportHistoryContext.Provider value={{ stockHistory, salesHistory, addReport, updateReport }}>
      {children}
    </ReportHistoryContext.Provider>
  );
};

export const useReportHistory = () => {
  const context = useContext(ReportHistoryContext);
  if (!context) {
    throw new Error('useReportHistory must be used within a ReportHistoryProvider');
  }
  return context;
};
