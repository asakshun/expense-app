'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLiff } from './context/LiffContext';

interface SummaryData {
  totalAmount: string;
  periodText: string;
  budgetLimit: string | null;
  remainingBudget: string | null;
  usageRate: number | null;
  isOverBudget: boolean | null;
}

interface CategoriesData {
  defaultCategories: { id: string; label: string }[];
  customCategories: string[];
  allCategories: { id: string; label: string }[];
}

const MAX_TOTAL_CATEGORIES = 13;

export default function LIFFPage() {
  const router = useRouter();
  const { liffReady, liffError } = useLiff();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [startDay, setStartDay] = useState<1 | 25>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState<0 | -1>(0);
  const [categories, setCategories] = useState<CategoriesData>({
    defaultCategories: [],
    customCategories: [],
    allCategories: [],
  });
  const [categoriesReady, setCategoriesReady] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    if (liffError) setError(liffError);
  }, [liffError]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setCategoriesReady(true);
    }
  };

  useEffect(() => {
    if (!liffReady) return;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/summary${monthOffset !== 0 ? `?monthOffset=${monthOffset}` : ''}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(`Failed to fetch summary: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        setSummary(data);

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
    fetchCategories();
  }, [liffReady, monthOffset]);

  const handleStartDayToggle = async (newStartDay: 1 | 25) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDay: newStartDay }),
      });

      if (!response.ok) throw new Error('Failed to update settings');

      setStartDay(newStartDay);

      const summaryResponse = await fetch('/api/summary');
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

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setCategoryLoading(true);
    setCategoryError(null);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryName: name }),
      });
      const data = await response.json();
      if (data.success) {
        setNewCategoryName('');
        await fetchCategories();
      } else {
        setCategoryError(data.error ?? '追加に失敗しました。');
      }
    } catch {
      setCategoryError('追加に失敗しました。');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleRemoveCategory = async (categoryName: string) => {
    setCategoryLoading(true);
    setCategoryError(null);
    try {
      const response = await fetch('/api/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryName }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchCategories();
      } else {
        setCategoryError(data.error ?? '削除に失敗しました。');
      }
    } catch {
      setCategoryError('削除に失敗しました。');
    } finally {
      setCategoryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            支出管理
          </h1>
          <button
            onClick={() => router.push('/liff/history')}
            className="text-sm text-blue-600 dark:text-blue-400 font-medium"
          >
            支出履歴 ＞
          </button>
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
              onClick={() => window.location.reload()}
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
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setMonthOffset(-1)}
                  disabled={monthOffset === -1 || loading}
                  className="text-sm text-blue-600 dark:text-blue-400 font-medium disabled:opacity-0 disabled:pointer-events-none"
                >
                  ＜ 先月
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {monthOffset === -1 ? '先月' : '今月'}
                </span>
                <button
                  onClick={() => setMonthOffset(0)}
                  disabled={monthOffset === 0 || loading}
                  className="text-sm text-blue-600 dark:text-blue-400 font-medium disabled:opacity-0 disabled:pointer-events-none"
                >
                  今月 ＞
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                合計支出額
              </p>
              <p className={`text-4xl font-bold mb-4 ${summary.isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                {summary.totalAmount}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                期間: {summary.periodText}
              </p>
            </div>

            {/* Budget Card - 今月のみ表示 */}
            {monthOffset === 0 && summary.budgetLimit !== null && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">支出限度額</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{summary.budgetLimit}</p>
                </div>

                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      summary.isOverBudget
                        ? 'bg-red-500'
                        : (summary.usageRate ?? 0) >= 70
                        ? 'bg-yellow-400'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(summary.usageRate ?? 0, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${
                    summary.isOverBudget
                      ? 'text-red-600 dark:text-red-400'
                      : (summary.usageRate ?? 0) >= 70
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    {summary.usageRate}%
                  </p>
                  <p className={`text-sm font-medium ${summary.isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {summary.isOverBudget ? `${summary.remainingBudget} 超過` : `残り ${summary.remainingBudget}`}
                  </p>
                </div>
              </div>
            )}

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

            {/* Category Management */}
            {categoriesReady && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    カテゴリ管理
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {categories.allCategories.length} / {MAX_TOTAL_CATEGORIES}
                  </span>
                </div>

                {categoryError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mb-3">{categoryError}</p>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">デフォルト</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.defaultCategories.map(cat => (
                    <span
                      key={cat.id}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                    >
                      {cat.label}
                    </span>
                  ))}
                </div>

                {categories.customCategories.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">カスタム</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {categories.customCategories.map(name => (
                        <span
                          key={name}
                          className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                        >
                          {name}
                          <button
                            onClick={() => handleRemoveCategory(name)}
                            disabled={categoryLoading}
                            className="ml-1 text-blue-400 hover:text-red-500 disabled:opacity-50"
                            aria-label={`${name}を削除`}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {categories.allCategories.length < MAX_TOTAL_CATEGORIES ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={e => setNewCategoryName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                      placeholder="新しいカテゴリ名"
                      maxLength={50}
                      disabled={categoryLoading}
                      className="flex-1 text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button
                      onClick={handleAddCategory}
                      disabled={categoryLoading || !newCategoryName.trim()}
                      className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      追加
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                    カテゴリは最大{MAX_TOTAL_CATEGORIES}個まで登録できます
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
