import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClauseWise AI — Legal Document Navigator',
  description:
    'Understand the document before you sign it. Plain-language summaries, clause breakdown, grounded Q&A, version diffs, and lawyer preparation checklists.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/logo-symbol.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
