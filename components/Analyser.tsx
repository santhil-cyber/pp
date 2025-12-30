
import React, { useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, X, TrendingUp, Package, AlertCircle, DollarSign, XCircle, Truck, Info } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface CsvRow {
  "Order Date"?: string;
  "Suborder No"?: string;
  "Selling Price"?: string;
  "Item Quantity"?: string;
  "Shipping Status"?: string;
  "Order Status"?: string;
  [key: string]: any;
}

interface AnalysisMetrics {
  totalSales: number;
  totalOrders: number;
  cancelledOrdersCount: number;
  deliveredOrdersCount: number;
  pickedUpOrdersCount: number;
  statusBreakdown: { name: string; value: number }[];
  dailySales: { date: string; sales: number; orders: number }[];
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

const Analyser: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AnalysisMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setMetrics(null);
    }
  };

  const processData = (data: CsvRow[]) => {
    let totalSales = 0;
    const uniqueOrders = new Set<string>();
    const statusCounts: Record<string, number> = {};
    const dailySalesMap: Record<string, { sales: number; orders: Set<string> }> = {};

    let cancelled = 0;
    let delivered = 0;
    let pickedUp = 0;

    // 1. Find which column contains the Order ID (looking for 'ppy' prefix)
    let detectedOrderIdKey = "Suborder No";
    if (data.length > 0) {
      const firstFewRows = data.slice(0, 10);
      const keys = Object.keys(data[0]);
      
      for (const k of keys) {
        const hasPpy = firstFewRows.some(row => 
          String(row[k] || "").toLowerCase().includes('ppy')
        );
        if (hasPpy) {
          detectedOrderIdKey = k;
          break;
        }
      }
    }

    data.forEach(row => {
      const orderId = String(row[detectedOrderIdKey] || "").trim();
      if (!orderId) return;

      const priceStr = row["Selling Price"];
      const price = priceStr ? parseFloat(priceStr.toString().replace(/,/g, '')) : 0;
      const orderDateRaw = row["Order Date"];
      
      let status = "Unknown";
      const orderStatus = (row["Order Status"] || "").toUpperCase();
      const shippingStatus = (row["Shipping Status"] || "").toUpperCase();

      if (orderStatus.includes("CANCEL")) {
        status = "Cancelled";
      } else if (shippingStatus) {
        status = shippingStatus.charAt(0).toUpperCase() + shippingStatus.slice(1).toLowerCase();
      }

      uniqueOrders.add(orderId);
      
      // Keep logic: sum all rows but count unique IDs
      if (status !== "Cancelled" && !isNaN(price)) {
        totalSales += price;

        if (orderDateRaw) {
          const dateObj = new Date(orderDateRaw);
          if (!isNaN(dateObj.getTime())) {
             const dateKey = dateObj.toISOString().split('T')[0];
             if (!dailySalesMap[dateKey]) {
                dailySalesMap[dateKey] = { sales: 0, orders: new Set() };
             }
             dailySalesMap[dateKey].sales += price;
             dailySalesMap[dateKey].orders.add(orderId);
          }
        }
      }

      statusCounts[status] = (statusCounts[status] || 0) + 1;
      if (status === "Cancelled") cancelled++;
      else if (status.includes("Delivered")) delivered++;
      else if (status.includes("Picked") || status.includes("Pickup")) pickedUp++;
    });

    const statusBreakdown = Object.keys(statusCounts).map(key => ({
      name: key,
      value: statusCounts[key]
    })).sort((a, b) => b.value - a.value);

    const dailySales = Object.keys(dailySalesMap).map(date => ({
      date,
      sales: dailySalesMap[date].sales,
      orders: dailySalesMap[date].orders.size
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      totalSales,
      totalOrders: uniqueOrders.size,
      cancelledOrdersCount: cancelled,
      deliveredOrdersCount: delivered,
      pickedUpOrdersCount: pickedUp,
      statusBreakdown,
      dailySales
    };
  };

  const handleAnalyze = () => {
    if (!file) return;
    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const analyzedData = processData(results.data as CsvRow[]);
          setMetrics(analyzedData);
        } catch (err) {
          setError("Failed to parse CSV data. Please check the file format.");
        } finally {
          setLoading(false);
        }
      },
      error: (err) => {
        setError(`Error reading file: ${err.message}`);
        setLoading(false);
      }
    });
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start">
        <div>
           <h1 className="text-3xl font-bold text-gray-800">Report Analyser</h1>
           <p className="text-gray-500 mt-1">Advanced analysis using Order ID patterns (ppy).</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 hover:bg-gray-50 transition-colors relative">
                <input 
                    type="file" 
                    accept=".csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full mb-4">
                        <Upload size={32} />
                    </div>
                    <p className="text-lg font-medium text-gray-700">Click or Drag CSV file here</p>
                </div>
            </div>
        ) : (
            <div className="flex flex-col items-center animate-in zoom-in-50 duration-300">
                <div className="flex items-center space-x-4 bg-emerald-50 px-6 py-4 rounded-lg border border-emerald-100 mb-6">
                    <FileText className="text-emerald-600" size={24} />
                    <div className="text-left">
                        <p className="font-medium text-gray-800">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button 
                        onClick={() => { setFile(null); setMetrics(null); }}
                        className="p-1 hover:bg-emerald-200 rounded-full text-emerald-700 ml-4"
                    >
                        <X size={16} />
                    </button>
                </div>
                
                {!metrics && (
                  <button 
                      onClick={handleAnalyze}
                      disabled={loading}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all active:translate-y-0.5 flex items-center"
                  >
                      {loading ? (
                          <><span>Processing...</span></>
                      ) : (
                          <>
                            <TrendingUp size={20} className="mr-2" />
                            <span>Run Smart Analysis</span>
                          </>
                      )}
                  </button>
                )}
            </div>
        )}
        
        {error && (
            <div className="mt-4 flex items-center justify-center text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                <AlertCircle size={16} className="mr-2" />
                {error}
            </div>
        )}
      </div>

      {metrics && (
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500">
                      <div className="flex justify-between items-start">
                          <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sales (Net)</p>
                              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                  ₹{metrics.totalSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </h3>
                          </div>
                          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                              <DollarSign size={20} />
                          </div>
                      </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                      <div className="flex justify-between items-start">
                          <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unique Orders</p>
                              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                  {metrics.totalOrders}
                              </h3>
                              <p className="text-[10px] text-blue-600 font-medium mt-1 uppercase">Deduplicated IDs</p>
                          </div>
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                              <Package size={20} />
                          </div>
                      </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
                      <div className="flex justify-between items-start">
                          <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cancelled (Rows)</p>
                              <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                  {metrics.cancelledOrdersCount}
                              </h3>
                              <p className="text-[10px] text-red-400 mt-1">Excluded from Sales</p>
                          </div>
                          <div className="p-2 bg-red-50 rounded-lg text-red-600">
                              <XCircle size={20} />
                          </div>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <h4 className="text-lg font-bold text-gray-800 mb-6">Status Breakdown (Row Level)</h4>
                      <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                  <Pie
                                      data={metrics.statusBreakdown}
                                      cx="50%"
                                      cy="50%"
                                      labelLine={false}
                                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                      outerRadius={100}
                                      fill="#8884d8"
                                      dataKey="value"
                                  >
                                      {metrics.statusBreakdown.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                  </Pie>
                                  <Tooltip />
                                  <Legend verticalAlign="bottom" height={36}/>
                              </PieChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <h4 className="text-lg font-bold text-gray-800 mb-6">Sales Trend (Unique Net Revenue)</h4>
                      <div className="h-80">
                         {metrics.dailySales.length > 0 ? (
                             <ResponsiveContainer width="100%" height="100%">
                                 <BarChart data={metrics.dailySales}>
                                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                     <XAxis 
                                        dataKey="date" 
                                        tick={{fontSize: 12}} 
                                        tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                     />
                                     <YAxis tick={{fontSize: 12}} />
                                     <Tooltip 
                                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Net Revenue']}
                                        labelFormatter={(label) => new Date(label).toDateString()}
                                     />
                                     <Bar dataKey="sales" fill="#10B981" radius={[4, 4, 0, 0]} name="Revenue" />
                                 </BarChart>
                             </ResponsiveContainer>
                         ) : (
                             <div className="flex items-center justify-center h-full text-gray-400">
                                 No date-wise data available
                             </div>
                         )}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Analyser;
