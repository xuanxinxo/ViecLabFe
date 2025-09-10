'use client';

import { useState, useEffect } from 'react';
import { apiDebugger, ApiDebugInfo } from '@/lib/debugApi';
import { Eye, EyeOff, Trash2, RefreshCw } from 'lucide-react';

export default function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<ApiDebugInfo[]>([]);
  const [summary, setSummary] = useState(apiDebugger.getDebugSummary());

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const refreshLogs = () => {
    setLogs(apiDebugger.getLogs());
    setSummary(apiDebugger.getDebugSummary());
  };

  const clearLogs = () => {
    apiDebugger.clearLogs();
    refreshLogs();
  };

  const checkApiHealth = async () => {
    const isHealthy = await apiDebugger.checkApiHealth();
    console.log('API Health:', isHealthy ? 'OK' : 'FAILED');
  };

  useEffect(() => {
    refreshLogs();
    const interval = setInterval(refreshLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Toggle Debug Panel"
      >
        {isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">API Debug Panel</h3>
            <div className="flex gap-2">
              <button
                onClick={checkApiHealth}
                className="text-blue-600 hover:text-blue-800"
                title="Check API Health"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={clearLogs}
                className="text-red-600 hover:text-red-800"
                title="Clear Logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Total:</span>
                <span className="ml-1 font-medium">{summary.totalRequests}</span>
              </div>
              <div>
                <span className="text-gray-600">Success:</span>
                <span className="ml-1 font-medium text-green-600">{summary.successCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Errors:</span>
                <span className="ml-1 font-medium text-red-600">{summary.errorCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Avg Time:</span>
                <span className="ml-1 font-medium">{summary.averageResponseTime}ms</span>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="overflow-y-auto max-h-64">
            {logs.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No API requests yet
              </div>
            ) : (
              logs.slice(-10).reverse().map((log, index) => (
                <div
                  key={index}
                  className={`p-3 border-b border-gray-100 text-xs ${
                    log.error || (log.status && log.status >= 400)
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800">
                      {log.method} {log.url.split('/').pop()}
                    </span>
                    <span className="text-gray-500">
                      {log.responseTime}ms
                    </span>
                  </div>
                  
                  {log.status && (
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          log.status >= 200 && log.status < 300
                            ? 'bg-green-100 text-green-800'
                            : log.status >= 400
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {log.status}
                      </span>
                      {log.statusText && (
                        <span className="text-gray-600">{log.statusText}</span>
                      )}
                    </div>
                  )}
                  
                  {log.error && (
                    <div className="text-red-600 font-medium">
                      Error: {log.error}
                    </div>
                  )}
                  
                  {log.responseData && typeof log.responseData === 'object' && (
                    <div className="text-gray-600 mt-1">
                      <details>
                        <summary className="cursor-pointer">Response Data</summary>
                        <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(log.responseData, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
