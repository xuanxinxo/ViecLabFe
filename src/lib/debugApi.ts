// Debug utility for API issues in production
export interface ApiDebugInfo {
  url: string;
  method: string;
  status?: number;
  statusText?: string;
  responseTime?: number;
  error?: string;
  responseData?: any;
  headers?: Record<string, string>;
}

export class ApiDebugger {
  private static instance: ApiDebugger;
  private debugLogs: ApiDebugInfo[] = [];

  static getInstance(): ApiDebugger {
    if (!ApiDebugger.instance) {
      ApiDebugger.instance = new ApiDebugger();
    }
    return ApiDebugger.instance;
  }

  log(info: ApiDebugInfo) {
    this.debugLogs.push(info);
    console.log('[API DEBUG]', info);
    
    // Keep only last 50 logs
    if (this.debugLogs.length > 50) {
      this.debugLogs = this.debugLogs.slice(-50);
    }
  }

  getLogs(): ApiDebugInfo[] {
    return [...this.debugLogs];
  }

  clearLogs() {
    this.debugLogs = [];
  }

  // Enhanced fetch with debugging
  async debugFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const startTime = Date.now();
    const debugInfo: ApiDebugInfo = {
      url,
      method: options.method || 'GET',
      headers: options.headers as Record<string, string> || {}
    };

    try {
      console.log(`[API DEBUG] Starting request to ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers
        }
      });

      const responseTime = Date.now() - startTime;
      
      debugInfo.status = response.status;
      debugInfo.statusText = response.statusText;
      debugInfo.responseTime = responseTime;

      // Log response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      debugInfo.headers = responseHeaders;

      // Try to get response data for debugging
      try {
        const responseData = await response.clone().json();
        debugInfo.responseData = responseData;
      } catch (e) {
        // Response might not be JSON
        debugInfo.responseData = 'Non-JSON response';
      }

      this.log(debugInfo);

      if (!response.ok) {
        console.error(`[API DEBUG] Request failed: ${response.status} ${response.statusText}`);
      } else {
        console.log(`[API DEBUG] Request successful: ${responseTime}ms`);
      }

      return response;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      debugInfo.error = error.message;
      debugInfo.responseTime = responseTime;
      
      this.log(debugInfo);
      console.error(`[API DEBUG] Request error:`, error);
      
      throw error;
    }
  }

  // Check if API is reachable
  async checkApiHealth(baseUrl: string = 'https://vieclabbe.onrender.com'): Promise<boolean> {
    try {
      const response = await this.debugFetch(`${baseUrl}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      return response.ok;
    } catch (error) {
      console.error('[API DEBUG] Health check failed:', error);
      return false;
    }
  }

  // Get debug summary
  getDebugSummary(): {
    totalRequests: number;
    successCount: number;
    errorCount: number;
    averageResponseTime: number;
    recentErrors: ApiDebugInfo[];
  } {
    const logs = this.getLogs();
    const successCount = logs.filter(log => log.status && log.status >= 200 && log.status < 300).length;
    const errorCount = logs.filter(log => log.error || (log.status && log.status >= 400)).length;
    const responseTimes = logs.filter(log => log.responseTime).map(log => log.responseTime!);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;
    
    const recentErrors = logs
      .filter(log => log.error || (log.status && log.status >= 400))
      .slice(-5);

    return {
      totalRequests: logs.length,
      successCount,
      errorCount,
      averageResponseTime: Math.round(averageResponseTime),
      recentErrors
    };
  }
}

// Export singleton instance
export const apiDebugger = ApiDebugger.getInstance();

// Helper function to create debug-friendly fetch
export const debugFetch = (url: string, options: RequestInit = {}) => {
  return apiDebugger.debugFetch(url, options);
};
