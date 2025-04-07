import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | HelpConnect',
    default: 'HelpConnect - Community Support Network'
  },
  description: "Connect with your community for mutual support and assistance. Give and receive help when needed.",
  keywords: ['community support', 'mutual aid', 'help network', 'social support', 'community assistance'],
  authors: [{ name: 'HelpConnect Team' }],
  openGraph: {
    title: 'HelpConnect - Community Support Network',
    description: 'Connect with your community for mutual support and assistance.',
    type: 'website',
    siteName: 'HelpConnect',
    url: 'https://help-connect-amber.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HelpConnect - Community Support Network',
    description: 'Connect with your community for mutual support and assistance.',
    site: '@helpconnect',
  },
  metadataBase: new URL('https://help-connect-amber.vercel.app'),
};

/**
 * Renders the root HTML layout of the application.
 *
 * This component creates an HTML document with the language attribute set to "en" and a body that applies global font styles and antialiased rendering. It wraps the provided children and integrates a toast notification system positioned at the bottom-right of the screen.
 *
 * @param children - The content to be rendered within the layout.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
