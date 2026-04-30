import Script from 'next/script';
import { LiffProvider } from './context/LiffContext';

export const metadata = {
  title: '支出管理 - LIFF',
  description: 'LINE支出管理アプリ',
};

export default function LIFFLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        src="https://static.line-scdn.net/liff/edge/2/sdk.js"
        strategy="beforeInteractive"
      />
      <LiffProvider>
        {children}
      </LiffProvider>
    </>
  );
}
