import { AppConfig, EasyEcomReportResponse, EasyEcomDownloadResponse } from '../types';

const getHeaders = (config: AppConfig) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${config.easyEcomJwt}`,
  'x-api-key': config.easyEcomApiKey,
});

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const text = await response.text();
      try {
        const json = JSON.parse(text);
        errorMessage = json.message || json.error || text;
      } catch {
        errorMessage = text || `HTTP ${response.status}`;
      }
    } catch (e) {
      errorMessage = `HTTP ${response.status}`;
    }
    throw new Error(`EasyEcom API Error: ${errorMessage}`);
  }
  return response.json();
};

export const queueStockReport = async (config: AppConfig): Promise<string> => {
  if (config.simulationMode) {
    return new Promise(resolve => setTimeout(() => resolve(`SIM-STK-${Date.now()}`), 1000));
  }

  try {
    const response = await fetch(`${config.easyEcomBaseUrl}/reports/queue`, {
      method: 'POST',
      headers: getHeaders(config),
      body: JSON.stringify({
        reportType: 'STATUS_WISE_STOCK_REPORT'
      })
    });

    const data: EasyEcomReportResponse = await handleResponse(response);
    return data.data.reportId;
  } catch (error) {
    console.error("Failed to queue stock report:", error);
    throw error;
  }
};

export const queueSalesReport = async (config: AppConfig, startDate: string, endDate: string): Promise<string> => {
  if (config.simulationMode) {
    return new Promise(resolve => setTimeout(() => resolve(`SIM-SLS-${Date.now()}`), 1000));
  }

  try {
    const response = await fetch(`${config.easyEcomBaseUrl}/reports/queue`, {
      method: 'POST',
      headers: getHeaders(config),
      body: JSON.stringify({
        reportType: 'MINI_SALES_REPORT',
        params: {
          invoiceType: "ALL",
          dateType: "ORDER_DATE",
          startDate: startDate,
          endDate: endDate,
          warehouseIds: config.warehouseId
        }
      })
    });

    const data: EasyEcomReportResponse = await handleResponse(response);
    return data.data.reportId;
  } catch (error) {
    console.error("Failed to queue sales report:", error);
    throw error;
  }
};

export const checkReportStatus = async (config: AppConfig, reportId: string): Promise<EasyEcomDownloadResponse['data']> => {
  if (config.simulationMode || reportId.startsWith('SIM-')) {
    return new Promise(resolve => {
       setTimeout(() => {
         resolve({
           reportStatus: 'COMPLETED',
           downloadUrl: '#'
         });
       }, 3000);
    });
  }

  try {
    const response = await fetch(`${config.easyEcomBaseUrl}/reports/download?reportId=${reportId}`, {
      method: 'GET',
      headers: getHeaders(config),
    });

    const json: EasyEcomDownloadResponse = await handleResponse(response);
    return json.data;
  } catch (error) {
    console.error("Failed to check report status:", error);
    throw error;
  }
};
