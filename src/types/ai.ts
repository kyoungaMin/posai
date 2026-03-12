// Gemini API 요청/응답 타입

export interface AIInsightRequest {
  analyticsData: {
    total_sales: number;
    total_transactions: number;
    avg_transaction_value: number;
    topProducts: string;
    peakHour: string;
    bestDay: string;
  };
}

export interface AIChatRequest {
  message: string;
  context: unknown;
}

export interface AIMarketingRequest {
  storeData: unknown;
  fileData?: { data: string; mimeType: string };
  customTopic?: string;
}

export interface AIPredictionRequest {
  historicalData: unknown;
}

export interface AIResponse {
  content: string;
}

export interface AIForecastItem {
  date: string;
  weather: string;
  temp: number;
  predictedSales: number;
  reason: string;
}
