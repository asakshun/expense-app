'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface LiffContextType {
  liffReady: boolean;
  liffError: string | null;
}

const LiffContext = createContext<LiffContextType>({
  liffReady: false,
  liffError: null,
});

export function LiffProvider({ children }: { children: ReactNode }) {
  const [liffReady, setLiffReady] = useState(false);
  const [liffError, setLiffError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        if (typeof window === 'undefined') return;
        const liff = (window as any).liff;
        if (!liff) {
          console.warn('LIFF SDK not loaded');
          setLiffReady(true);
          return;
        }
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) {
          console.warn('LIFF ID not configured');
          setLiffReady(true);
          return;
        }
        await liff.init({ liffId });
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }
        setLiffReady(true);
      } catch (err) {
        console.error('LIFF initialization failed:', err);
        setLiffError('LIFFの初期化に失敗しました。');
        setLiffReady(true);
      }
    };
    init();
  }, []);

  return (
    <LiffContext.Provider value={{ liffReady, liffError }}>
      {children}
    </LiffContext.Provider>
  );
}

export function useLiff() {
  return useContext(LiffContext);
}
