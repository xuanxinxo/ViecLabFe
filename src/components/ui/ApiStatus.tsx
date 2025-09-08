'use client';

import { useState, useEffect } from 'react';

interface ApiStatusProps {
  apiUrl?: string;
}

export default function ApiStatus({ apiUrl = 'https://vieclabbe.onrender.com' }: ApiStatusProps) {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkApiStatus = async () => {
    try {
      setStatus('checking');
      const response = await fetch(`${apiUrl}/api/health`, {
        method: 'GET',
        mode: 'cors',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        setStatus('online');
      } else {
        setStatus('offline');
      }
    } catch (error) {
      console.error('API health check failed:', error);
      setStatus('offline');
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkApiStatus();
    // Check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'checking': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'online': return '🟢';
      case 'offline': return '🔴';
      case 'checking': return '🟡';
      default: return '⚪';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online': return 'API Online';
      case 'offline': return 'API Offline';
      case 'checking': return 'Đang kiểm tra...';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getStatusColor()}`}>
        <span>{getStatusIcon()}</span>
        <span className="font-medium">{getStatusText()}</span>
      </div>
      {lastChecked && (
        <span className="text-gray-500 text-xs">
          {lastChecked.toLocaleTimeString('vi-VN')}
        </span>
      )}
      <button
        onClick={checkApiStatus}
        className="text-blue-600 hover:text-blue-800 text-xs underline"
        disabled={status === 'checking'}
      >
        {status === 'checking' ? 'Đang kiểm tra...' : 'Kiểm tra lại'}
      </button>
    </div>
  );
}
