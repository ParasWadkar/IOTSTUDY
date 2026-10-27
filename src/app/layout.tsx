import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StoreProvider } from '@/lib/store';

export const metadata: Metadata = {
  title: 'IoT Quiz',
  description: 'Personal quiz app for Introduction to Internet of Things',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const themeScript = `try{var t=localStorage.getItem('quiz-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-bg text-ink antialiased">
        <StoreProvider>
          <div className="mx-auto w-full max-w-[40rem] px-4 pb-20 pt-4 sm:px-6 sm:pt-10">{children}</div>
        </StoreProvider>
      </body>
    </html>
  );
}
