import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Meeting Summarizer - Know exactly who said what",
  description: "Automate meeting attendance and speaker tags with hybrid AI visual recognition and NLP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} ${outfit.className} antialiased bg-[#050505] text-white min-h-screen selection:bg-purple-500/30 selection:text-white`} >
        {children}
      </body>
    </html>
  );
}
