import JSZip from 'jszip';
import Papa from 'papaparse';
import { AppConfig, ReportAnalysis } from '../types';

interface CsvRow {
  "Suborder No": string;
  "Order Invoice Amount": string;
  "Selling Price": string;
  "Item Quantity": string;
  "Product Name": string;
  "SKU": string;
  "Order Status": string;
}

const mockAnalysis = (): ReportAnalysis => ({
    totalSales: 125000.50,
    totalOrders: 45,
    averageOrderValue: 2777.79,
    skuBreakdown: [
        { name: "Tandoori Chaap", quantity: 120, revenue: 45000 },
        { name: "Malai Chaap", quantity: 90, revenue: 35000 },
        { name: "Achari Chaap", quantity: 50, revenue: 20000 },
    ]
});

export const analyzeReportUrl = async (config: AppConfig, fileUrl: string): Promise<ReportAnalysis> => {
  let blob: Blob;

  // Handle Simulation Mode or Mock URL
  if (config.simulationMode || fileUrl === '#' || fileUrl.includes('mock')) {
    return new Promise(resolve => setTimeout(() => resolve(mockAnalysis()), 1500));
  }

  try {
    // 1. Try Direct Fetch first (Best for S3/signed URLs if CORS allows)
    const response = await fetch(fileUrl, { mode: 'cors' });
    if (!response.ok) throw new Error("Direct fetch failed");
    blob = await response.blob();
  } catch (directError) {
    console.warn("Direct fetch failed/blocked, attempting via Proxy...", directError);

    // 2. Fallback to Local Proxy (Bypasses CORS)
    const proxyUrl = `${config.backendUrl.replace(/\/$/, '')}/api/proxy-file?url=${encodeURIComponent(fileUrl)}`;
    
    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) {
         const errorText = await response.text().catch(() => response.statusText);
         throw new Error(`Proxy Error ${response.status}: ${errorText}`);
      }
      blob = await response.blob();
    } catch (proxyError: any) {
      console.error("Proxy fetch failed:", proxyError);
      throw new Error(`Failed to fetch report. 1. Check if Backend is running on ${config.backendUrl}. 2. Check CORS.`);
    }
  }

  try {
    // 3. Unzip the file
    const zip = new JSZip();
    const unzipped = await zip.loadAsync(blob);
    
    // Find the first CSV file
    const csvFileName = Object.keys(unzipped.files).find(name => name.toLowerCase().endsWith('.csv'));
    
    if (!csvFileName) {
      throw new Error("No CSV file found in the downloaded report archive.");
    }

    const csvContent = await unzipped.files[csvFileName].async('string');

    // 4. Parse CSV
    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            if (results.errors && results.errors.length > 0) {
               console.warn("CSV Parse warnings:", results.errors);
            }
            const data = results.data as CsvRow[];
            resolve(calculateMetrics(data));
          } catch (e) {
            reject(e);
          }
        },
        error: (err: any) => reject(new Error(`CSV Parsing Failed: ${err.message}`))
      });
    });

  } catch (error: any) {
    console.error("Analysis processing failed:", error);
    throw new Error(`Analysis Failed: ${error.message}`);
  }
};

const calculateMetrics = (rows: CsvRow[]): ReportAnalysis => {
  const uniqueOrders = new Set<string>();
  let totalRevenue = 0;
  const productStats: Record<string, { quantity: number; revenue: number }> = {};

  rows.forEach(row => {
    // Defensive parsing
    const sellingPriceStr = row["Selling Price"] || "0";
    const quantityStr = row["Item Quantity"] || "0";
    
    const sellingPrice = parseFloat(sellingPriceStr.toString().replace(/,/g, ''));
    const quantity = parseInt(quantityStr.toString().replace(/,/g, ''), 10);
    const orderId = row["Suborder No"];
    const productName = row["Product Name"] || "Unknown Product";
    const status = row["Order Status"]?.toUpperCase() || "";

    // Filter cancelled orders
    if (status === "CANCELLED" || status === "CANCELED" || status === "RETURNED") return;

    // Aggregate
    if (!isNaN(sellingPrice)) {
      totalRevenue += sellingPrice;
    }

    if (orderId) {
      uniqueOrders.add(orderId);
    }

    if (!productStats[productName]) {
      productStats[productName] = { quantity: 0, revenue: 0 };
    }
    
    if (!isNaN(quantity)) productStats[productName].quantity += quantity;
    if (!isNaN(sellingPrice)) productStats[productName].revenue += sellingPrice;
  });

  const totalOrders = uniqueOrders.size;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Sort top products
  const skuBreakdown = Object.entries(productStats)
    .map(([name, stats]) => ({
      name,
      quantity: stats.quantity,
      revenue: stats.revenue
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    totalSales: totalRevenue,
    totalOrders,
    averageOrderValue,
    skuBreakdown
  };
};
