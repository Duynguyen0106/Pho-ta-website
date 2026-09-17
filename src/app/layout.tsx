import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Pho Ta | Fine Vietnamese Dining in London",
    template: "%s | Pho Ta",
  },
  description:
    "An elevated Vietnamese dining experience at Kentish Town and Finchley Road, London. Reserve your table for refined flavours and warm hospitality.",
  keywords: [
    "Pho Ta",
    "Vietnamese restaurant",
    "fine dining",
    "London",
    "Finchley Road",
    "Kentish Town",
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
      className={`${dmSans.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="luxury-grain min-h-full flex flex-col bg-[#0a0908] font-sans font-light text-[#f5f0e6]">
        {children}
      </body>
    </html>
  );
}
