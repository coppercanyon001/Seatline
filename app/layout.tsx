import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://grandmas-grocery-trip.mrpopper.chatgpt.site"),
  title: "Grandma’s Grocery Trip",
  description: "A funny third-person grocery dash through a colorful supermarket maze.",
  icons: {
    icon: "/mint-assets/og.png",
    shortcut: "/mint-assets/og.png",
  },
  openGraph: {
    title: "Grandma’s Grocery Trip",
    description: "Grab the groceries, push to checkout, and beat the clock.",
    images: [{ url: "/mint-assets/og.png", width: 1424, height: 752, alt: "Grandma pushing her grocery cart toward checkout" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grandma’s Grocery Trip",
    description: "Grab the groceries, push to checkout, and beat the clock.",
    images: ["/mint-assets/og.png"],
  },
};

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
      </body>
    </html>
  );
}
