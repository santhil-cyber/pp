
import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Calendar, AlertCircle, CheckCircle, Download, RefreshCw } from 'lucide-react';
import { queueSalesReport, checkReportStatus } from '../services/easyEcomService';
import { ReportHistoryItem } from '../types';
import { useConfig } from '../contexts/ConfigContext';
import { useReportHistory } from '../contexts/ReportHistoryContext';

const SalesReports: React.FC = () => {
  const { config } = useConfig();
  const { salesHistory, addReport, updateReport } = useReportHistory();
  
  const getDefaults = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const startStr = firstDay.toISOString().split('T')[0];
    const endStr = now.toISOString().split('T')[0];
    return { startStr, endStr };
  };

  const { startStr, endStr } = getDefaults();
  
  const [startDate, setStartDate] = useState<string>(startStr);
  const [endDate, setEndDate] = useState<string>(endStr);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollingRef = useRef<Set<number>>(new Set());

  const pollStatus = (itemId: number, reportId: string) => {
    if (pollingRef.current.has(itemId)) return;
    pollingRef.current.add(itemId);

    const interval = setInterval(async () => {
        try {
            const data = await checkReportStatus(config, reportId);
            if (data.reportStatus === 'COMPLETED' && data.downloadUrl) {
                updateReport(itemId, { status: 'Ready', downloadUrl: data.downloadUrl });
                clearInterval(interval);
                pollingRef.current.delete(itemId);
            } else if (data.reportStatus === 'FAILED') {
                updateReport(itemId, { status: 'Failed' });
                clearInterval(interval);
                pollingRef.current.delete(itemId);
            }
        } catch (e) {
            console.error("Polling error", e);
        }
    }, 3000);

    setTimeout(() => {
        if (pollingRef.current.has(itemId)) {
            clearInterval(interval);
            pollingRef.current.delete(itemId);
        }
    }, 120000);
  };

  useEffect(() => {
    salesHistory.forEach(item => {
        if (item.status === 'Processing') {
            pollStatus(item.id, item.reportId);
        }
    });
  }, []);

  const validateDateRange = (start: string, end: string): boolean => {
    const s = new Date(start);
    const e = new Date(end);
    
    if (e < s) {
        setError("End date cannot be before start date.");
        return false;
    }
    return true;
  };

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
        setError("Please select both start and end dates.");
        return;
    }

    if (!validateDateRange(startDate, endDate)) {
        return;
    }
    
    setLoading(true);
    setError(null);

    try {
        const reportId = await queueSalesReport(config, startDate, endDate);
        
        const newItem: ReportHistoryItem = {
            id: Date.now(),
            reportId: reportId,
            type: 'MINI_SALES_REPORT',
            date: new Date().toLocaleString(),
            status: 'Processing',
            dateRange: `${startDate} to ${endDate}`
        };

        addReport(newItem);
        pollStatus(newItem.id, reportId);

    } catch (err: any) {
        setError(err.message || "Failed to queue sales report");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-8 w-full max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Sales Reports</h1>
                <p className="text-gray-500 mt-1">Generate Sales Report (EasyEcom Source)</p>
            </div>
        </div>

        {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
            </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-6 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-emerald-600" /> 
                REPORT PARAMETERS
            </h3>
            <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Start Date</label>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => {
                            setStartDate(e.target.value);
                            setError(null);
                        }}
                        style={{ colorScheme: 'light' }}
                        className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm" 
                    />
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-600 mb-2">End Date</label>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => {
                            setEndDate(e.target.value);
                            setError(null);
                        }}
                        style={{ colorScheme: 'light' }}
                        className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm" 
                    />
                </div>
                <div className="w-full md:w-auto">
                    <button 
                        onClick={handleGenerateReport}
                        disabled={loading}
                        className="w-full md:w-auto flex items-center justify-center px-8 py-2.5 rounded-lg text-white font-semibold shadow-md transition-all bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {loading ? (
                            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        ) : (
                            <TrendingUp className="h-5 w-5 mr-2" />
                        )}
                        <span>{loading ? 'Queuing...' : 'Generate Report'}</span>
                    </button>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">Generated Reports History</h3>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">Persistent History</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                            <th className="px-6 py-3 font-medium">Report ID</th>
                            <th className="px-6 py-3 font-medium">Date Range</th>
                            <th className="px-6 py-3 font-medium">Created At</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {salesHistory.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-500">
                                    No sales reports generated yet.
                                </td>
                            </tr>
                        ) : (
                            salesHistory.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm text-gray-600">{item.reportId}</td>
                                    <td className="px-6 py-4 text-sm text-gray-800">{item.dateRange || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{item.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            item.status === 'Ready' ? 'bg-emerald-100 text-emerald-800' :
                                            item.status === 'Failed' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {item.status === 'Ready' && <CheckCircle className="w-3 h-3 mr-1" />}
                                            {item.status === 'Processing' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {item.status === 'Ready' && item.downloadUrl ? (
                                            <a 
                                                href={item.downloadUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-emerald-600 hover:text-emerald-800 font-medium text-sm inline-flex items-center bg-white border border-emerald-200 px-3 py-1 rounded hover:bg-emerald-50 transition-colors"
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                Download CSV
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 text-sm">--</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default SalesReports;
