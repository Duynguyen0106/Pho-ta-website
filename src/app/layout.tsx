import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Pho Ta | Authentic Vietnamese Restaurant in London",
    template: "%s | Pho Ta Restaurant",
  },
  description:
    "Pho Ta serves authentic Vietnamese cuisine at Kentish Town and Finchley Road, London. Book a table online for pho, bun cha, and fresh flavours.",
  keywords: [
    "Pho Ta",
    "Vietnamese restaurant",
    "London",
    "Finchley Road",
    "Kentish Town",
    "Pho",
    "Bun Cha",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
