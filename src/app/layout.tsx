import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Josefin_Sans,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Pho Ta | Fine Vietnamese Dining in London",
    template: "%s | Pho Ta",
  },
  description:
    "An elevated Vietnamese dining experience at Pho Ta Finchley Road, London. Reserve your table for refined flavours and warm hospitality.",
  keywords: [
    "Pho Ta",
    "Vietnamese restaurant",
    "fine dining",
    "London",
    "Finchley Road",
    "South Hampstead",
  ],
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${josefin.variable} ${cormorant.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="luxury-grain min-h-full flex flex-col bg-background font-sans text-lg font-light text-foreground">
        {children}
      </body>
    </html>
  );
}
