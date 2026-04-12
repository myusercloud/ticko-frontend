import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';
import { MainContent } from '@/components/MainContent';

export const metadata: Metadata = {
  title: 'Ticko - Event Ticketing',
  description: 'Discover and book events. Your tickets, one place.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <MainContent>{children}</MainContent>
        </Providers>
      </body>
    </html>
  );
}
