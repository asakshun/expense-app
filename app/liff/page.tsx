'use client';

import { useEffect, useState } from 'react';

interface SummaryData {
  totalAmount: string;
  periodText: string;
}

export default function LIFFPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [startDay, setStartDay] = useState<1 | 25>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liffInitialized, setLiffInitialized] = useState(false);

  // Initialize LIFF
  useEffect(() => {
    const initializeLiff = async () => {
      try {
        // Check if LIFF SDK is available
        if (typeof window !== 'undefined' && (window as any).liff) {
          const liff = (window as any).liff;
          
          // Initialize LIFF with your LIFF ID
          const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
          if (!liffId) {
            console.warn('LIFF ID not configured');
            setLiffInitialized(true);
            return;
          }

          await liff.init({ liffId });
          
          if (!liff.isLoggedIn()) {
            liff.login();
            return;
          }
          
          setLiffInitialized(true);
        } else {
          // LIFF SDK not loaded, continue anyway for development
          console.warn('LIFF SDK not loaded');
          setLiffInitialized(true);
        }
      } catch (err) {
        console.error('LIFF initialization failed:', err);
        setError('LIFFの初期化に失敗しました。');
        setLiffInitialized(true);
      }
    };

    initializeLiff();
  }, []);

  // Fetch summary data
  useEffect(() => {
    if (!liffInitialized) return;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/liff/summary');
        
        if (!response.ok) {
          // 詳細なエラー情報を取得
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          throw new Error(`Failed to fetch summary: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log('Summary data:', data);
        setSummary(data);
        
        // Extract start day from period (simple heuristic)
        // If period starts on 25th, set startDay to 25, otherwise 1
        const periodStart = data.periodText.split(' - ')[0];
        const day = parseInt(periodStart.split('/')[2]);
        setStartDay(day === 25 ? 25 : 1);
      } catch (err) {
        console.error('Failed to fetch summary:', err);
        setError(`データの読み込みに失敗しました。\n${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [liffInitialized]);

  // Handle start day toggle
  const handleStartDayToggle = async (newStartDay: 1 | 25) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/liff/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startDay: newStartDay }),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      setStartDay(newStartDay);

      // Refresh summary
      const summaryResponse = await fetch('/api/liff/summary');
      if (summaryResponse.ok) {
        const data = await summaryResponse.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError('設定の更新に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            支出管理
          </h1>
        </div>

        {/* Loading State */}
        {loading && !summary && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">読み込み中...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200 text-center whitespace-pre-line">
              {error}
            </p>
            <button
              onClick={handleRetry}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              再試行
            </button>
          </div>
        )}

        {/* Summary Display */}
        {summary && !loading && (
          <div className="space-y-6">
            {/* Total Amount Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                合計支出額
              </p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                {summary.totalAmount}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                期間: {summary.periodText}
              </p>
            </div>

            {/* Start Day Toggle */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                始まり日設定
              </p>
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleStartDayToggle(1)}
                    disabled={loading}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      startDay === 1
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    1日
                  </button>
                  <button
                    onClick={() => handleStartDayToggle(25)}
                    disabled={loading}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      startDay === 25
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    25日
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                給与支払いスケジュールに合わせて期間の開始日を設定できます
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
