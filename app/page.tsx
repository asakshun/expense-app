'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // LIFFログイン後のリダイレクトの場合、/liffにリダイレクト
    const code = searchParams.get('code');
    const liffClientId = searchParams.get('liffClientId');
    
    if (code && liffClientId) {
      // LIFFログイン後のコールバック
      router.push('/liff');
    } else {
      // 通常のアクセスの場合もLIFFページにリダイレクト
      router.push('/liff');
    }
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">リダイレクト中...</p>
      </div>
    </div>
  );
}
