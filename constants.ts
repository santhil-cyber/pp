
// Default Configuration Values
// Prioritize Environment Variables for security
export const DEFAULT_CONFIG = {
  easyEcomBaseUrl: process.env.EASYECOM_BASE_URL || 'https://api.easyecom.io',
  easyEcomJwt: process.env.EASYECOM_JWT || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvbG9hZGJhbGFuY2VyLW0uZWFzeWVjb20uaW9cL2FjY2Vzc1wvdG9rZW4iLCJpYXQiOjE3NjE3NDA0NDEsImV4cCI6MTc2OTYyNDQ0MSwibmJmIjoxNzYxNzQwNDQxLCJqdGkiOiJQTnlTeVA3UjhMdkQ1VWNHIiwic3ViIjoyNTEzNjEsInBydiI6ImE4NGRlZjY0YWQwMTE1ZDVlY2NjMWY4ODQ1YmNkMGU3ZmU2YzRiNjAiLCJ1c2VyX2lkIjoyNTEzNjEsImNvbXBhbnlfaWQiOjIyOTIyNSwicm9sZV90eXBlX2lkIjoyLCJwaWlfYWNjZXNzIjowLCJwaWlfcmVwb3J0X2FjY2VzcyI6MCwicm9sZXMiOm51bGwsImNfaWQiOjIyOTIyNSwidV9pZCI6MjUxMzYxLCJsb2NhdGlvbl9yZXF1ZXN0ZWRfZm9yIjoyMjkyMjV9.9PBHIzc5DnJXhhp9KnnPmcyKL7molaR7vth86JVezjc',
  easyEcomApiKey: process.env.EASYECOM_API_KEY || 'b83c128484fb8c7039c9f407347f41a68db6a927',
  warehouseId: process.env.EASYECOM_WAREHOUSE_ID || 'ix52544559076',
  
  // Backend Configuration
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
  
  simulationMode: false
};
