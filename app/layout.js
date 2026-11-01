import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'Wayline — AI travel planner',
  description: 'Pick a destination and a budget. Get a day-by-day trip with places, restaurants and a map.',
};

export const viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Figtree:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <header className="topbar">
          <Link href="/" className="brand" aria-label="Wayline home">
            <span className="brand-dot" aria-hidden="true" />
            Wayline
          </Link>
          <nav>
            <Link href="/">Plan a trip</Link>
            <Link href="/trips">Saved trips</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
