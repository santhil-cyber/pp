export enum ReportStatus {
  IDLE = 'IDLE',
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface EasyEcomReportResponse {
  data: {
    reportId: string;
  };
  message: string | null;
}

export interface EasyEcomDownloadResponse {
  data: {
    reportStatus: string; // "COMPLETED", "PENDING", etc.
    downloadUrl?: string;
  };
  message: string | null;
}

export interface AppConfig {
  easyEcomBaseUrl: string;
  easyEcomJwt: string;
  easyEcomApiKey: string;
  warehouseId: string;
  backendUrl: string; // Local Express Backend URL
  simulationMode: boolean;
}

export interface ReportAnalysis {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  skuBreakdown: { name: string; quantity: number; revenue: number }[];
}

export interface ReportHistoryItem {
  id: number;
  reportId: string;
  type: 'STATUS_WISE_STOCK_REPORT' | 'MINI_SALES_REPORT';
  date: string;
  status: 'Processing' | 'Ready' | 'Failed';
  downloadUrl?: string;
  dateRange?: string;
  analysis?: ReportAnalysis; // Field to store the analyzed data
}
