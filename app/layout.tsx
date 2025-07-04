import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Mi'raj Scouts Academy Portal",
  description: "Assalamu Alaikum! Welcome to Mi'raj Scouts Academy Portal - A comprehensive Islamic scouting platform for managing scout groups, activities, and community communication with Islamic values.",
  keywords: ["Islamic scouting", "Mi'raj Scouts Academy", "Muslim scouts", "scout management", "Islamic values", "community", "youth development"],
  authors: [{ name: "Mi'raj Scouts Academy" }],
  creator: "Mi'raj Scouts Academy",
  publisher: "Mi'raj Scouts Academy",
  metadataBase: new URL('https://msa-portal.org'),
  openGraph: {
    title: "Mi'raj Scouts Academy Portal",
    description: "Islamic scouting platform for managing scout groups and community activities with Islamic values",
    url: 'https://msa-portal.org',
    siteName: "Mi'raj Scouts Academy Portal",
    images: [
      {
        url: '/images/msa-logo-large.png',
        width: 1200,
        height: 630,
        alt: 'Mi\'raj Scouts Academy Logo',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Mi'raj Scouts Academy Portal",
    description: "Islamic scouting platform for managing scout groups and community activities",
    images: ['/images/msa-logo-large.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/images/msa-logo-icon.jpg',
    shortcut: '/images/msa-logo-icon.jpg',
    apple: '/images/msa-logo-icon.jpg',
  },
};

import ClientWrapper from "@/components/layout/ClientWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#5F8A8B" />
        <meta name="msapplication-TileColor" content="#5F8A8B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MSA Portal" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-msa-cream text-msa-charcoal`}
        suppressHydrationWarning
      >
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
