import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'TrendIQ - Instagram Content Intelligence',
  description: 'Turn Instagram Data Into Your Next Best Content',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
