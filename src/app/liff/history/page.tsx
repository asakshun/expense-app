'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLiff } from '../context/LiffContext';

interface ExpenseItem {
  id: string;
  amount: number;
  date: string;
  category?: string;
}

interface ExpensesData {
  expenses: ExpenseItem[];
  periodText: string;
}

interface CategoriesData {
  allCategories: { id: string; label: string }[];
}

export default function HistoryPage() {
  const router = useRouter();
  const { liffReady } = useLiff();

  const [data, setData] = useState<ExpensesData | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState<0 | -1>(0);

  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!liffReady) return;
    fetchExpenses();
    fetchCategories();
  }, [liffReady, monthOffset]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/expenses${monthOffset !== 0 ? `?monthOffset=${monthOffset}` : ''}`);
      if (!res.ok) throw new Error('fetch failed');
      setData(await res.json());
    } catch {
      setError('データの読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) return;
      const json: CategoriesData = await res.json();
      setCategories(json.allCategories.map(c => c.label));
    } catch {
      // カテゴリ取得失敗は無視（テキスト入力にフォールバック）
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEditOpen = (expense: ExpenseItem) => {
    setEditingExpense(expense);
    setEditAmount(String(expense.amount));
    setEditDate(expense.date);
    setEditCategory(expense.category ?? '');
  };

  const handleEditSave = async () => {
    if (!editingExpense) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: editAmount,
          date: editDate,
          category: editCategory || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      showToast('更新しました');
      setEditingExpense(null);
      await fetchExpenses();
    } catch {
      showToast('更新に失敗しました。', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/expenses/${deletingId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('削除しました');
      setDeletingId(null);
      await fetchExpenses();
    } catch {
      showToast('削除に失敗しました。', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatAmount = (amount: number) => `¥${amount.toLocaleString()}`;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md mx-auto p-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pt-8">
          <button
            onClick={() => router.push('/liff')}
            className="text-blue-600 dark:text-blue-400 font-medium text-sm"
          >
            ← 戻る
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">支出履歴</h1>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setMonthOffset(-1)}
            disabled={monthOffset === -1 || loading}
            className="text-sm text-blue-600 dark:text-blue-400 font-medium disabled:opacity-0 disabled:pointer-events-none"
          >
            ＜ 先月
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {data?.periodText ?? (monthOffset === -1 ? '先月' : '今月')}
          </span>
          <button
            onClick={() => setMonthOffset(0)}
            disabled={monthOffset === 0 || loading}
            className="text-sm text-blue-600 dark:text-blue-400 font-medium disabled:opacity-0 disabled:pointer-events-none"
          >
            今月 ＞
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">読み込み中...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
            <p className="text-sm text-red-800 dark:text-red-200 text-center">{error}</p>
            <button
              onClick={fetchExpenses}
              className="mt-3 w-full text-sm bg-red-600 text-white py-2 rounded-lg"
            >
              再試行
            </button>
          </div>
        )}

        {/* Expense List */}
        {!loading && data && (
          <div className="space-y-3">
            {data.expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-600">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm">この期間の支出はありません</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
                  {data.expenses.length}件
                </p>
                {data.expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center gap-3"
                  >
                    {/* Date */}
                    <div className="w-10 text-center flex-shrink-0">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {formatDate(expense.date)}
                      </span>
                    </div>

                    {/* Category + Amount */}
                    <div className="flex-1 min-w-0">
                      {expense.category ? (
                        <span className="inline-block text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full mb-1">
                          {expense.category}
                        </span>
                      ) : (
                        <span className="inline-block text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-full mb-1">
                          未分類
                        </span>
                      )}
                      <p className="text-base font-bold text-gray-900 dark:text-white">
                        {formatAmount(expense.amount)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEditOpen(expense)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        aria-label="編集"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingId(expense.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        aria-label="削除"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal (bottom sheet) */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !actionLoading && setEditingExpense(null)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-t-2xl p-6 pb-8">
            <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4" />
            <h2 className="text-base font-bold text-gray-800 dark:text-white mb-5">支出を編集</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  金額
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">¥</span>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full text-sm pl-7 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  日付
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  カテゴリ
                </label>
                {categories.length > 0 ? (
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">未分類</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="カテゴリ名（任意）"
                    className="w-full text-sm px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingExpense(null)}
                disabled={actionLoading}
                className="flex-1 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleEditSave}
                disabled={actionLoading || !editAmount || !editDate}
                className="flex-1 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 transition-colors"
              >
                {actionLoading ? '更新中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !actionLoading && setDeletingId(null)}
          />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-6">
            <h2 className="text-base font-bold text-gray-800 dark:text-white mb-2">削除しますか？</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              この操作は取り消せません。Notionのゴミ箱から30日以内であれば復元できます。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                disabled={actionLoading}
                className="flex-1 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="flex-1 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-50 transition-colors"
              >
                {actionLoading ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 text-white text-sm px-5 py-2.5 rounded-full shadow-lg z-50 transition-all ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-gray-800'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
