import React, { useState, useEffect, useRef } from 'react';
import { Package, RefreshCw, AlertCircle, CheckCircle, Download, Clock } from 'lucide-react';
import { queueStockReport, checkReportStatus } from '../services/easyEcomService';
import { ReportHistoryItem } from '../types';
import { useConfig } from '../contexts/ConfigContext';
import { useReportHistory } from '../contexts/ReportHistoryContext';

const StockReports: React.FC = () => {
  const { config } = useConfig();
  const { stockHistory, addReport, updateReport } = useReportHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to track active polls to prevent duplicates
  const pollingRef = useRef<Set<number>>(new Set());

  // Function to poll status
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

    // Stop polling after 2 minutes
    setTimeout(() => {
        if (pollingRef.current.has(itemId)) {
            clearInterval(interval);
            pollingRef.current.delete(itemId);
        }
    }, 120000);
  };

  // Resume polling for any processing items on mount
  useEffect(() => {
    stockHistory.forEach(item => {
        if (item.status === 'Processing') {
            pollStatus(item.id, item.reportId);
        }
    });
    // Cleanup not strictly necessary for the interval references as they are closure based, 
    // but in a complex app we might want to clear them.
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);

    try {
        const reportId = await queueStockReport(config);
        
        const newItem: ReportHistoryItem = {
            id: Date.now(),
            reportId: reportId,
            type: 'STATUS_WISE_STOCK_REPORT',
            date: new Date().toLocaleString(),
            status: 'Processing'
        };
        
        addReport(newItem);
        pollStatus(newItem.id, reportId);

    } catch (err: any) {
        setError(err.message || "Failed to generate report");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Stock Reports</h1>
            <p className="text-gray-500 mt-1">Status Wise Stock Report (Full Inventory)</p>
        </div>
        <button 
            onClick={handleGenerateReport}
            disabled={loading}
            className="flex items-center justify-center px-6 py-3 rounded-lg text-white font-medium shadow-lg hover:shadow-xl transition-all bg-emerald-600 hover:bg-emerald-700 active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> : <Package className="h-5 w-5 mr-2" />}
            <span>{loading ? 'Processing...' : 'Generate Stock Report'}</span>
        </button>
      </div>

       {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
            </div>
        )}

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
                        <th className="px-6 py-3 font-medium">Type</th>
                        <th className="px-6 py-3 font-medium">Created At</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {stockHistory.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center py-10 text-gray-500">
                                No stock reports generated yet.
                            </td>
                        </tr>
                    ) : (
                        stockHistory.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-sm text-gray-600">{item.reportId}</td>
                                <td className="px-6 py-4 text-sm text-gray-800 font-medium">Stock Report</td>
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
                                            Check & Download
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

export default StockReports;
