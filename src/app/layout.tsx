import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { db } from "@/lib/db";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DEFAULT_COMPANY = "Bandung Raya Residence";

export async function generateMetadata(): Promise<Metadata> {
  let companyName = DEFAULT_COMPANY;
  let logoUrl = "";
  try {
    const rows = await db.setting.findMany({ where: { key: { in: ["company_name", "logo_url"] } } });
    for (const r of rows) {
      if (r.key === "company_name" && r.value) companyName = r.value;
      if (r.key === "logo_url" && r.value) logoUrl = r.value;
    }
  } catch { /* fallback to default */ }

  return {
    title: `${companyName} | Perumahan KPR & Syariah`,
    description:
      `${companyName} — Hunian modern dengan skema KPR & Syariah. Cicilan mulai Rp 999k/bulan. Lokasi strategis, lingkungan asri.`,
    keywords: [
      "perumahan",
      "rumah syariah",
      "KPR",
      "rumah murah",
      "properti",
      companyName.toLowerCase(),
    ],
    authors: [{ name: companyName }],
    icons: logoUrl
      ? {
          icon: { url: logoUrl, sizes: "32x32", type: "image/png" },
          apple: logoUrl,
        }
      : {
          icon: { url: "/favicon.ico", sizes: "32x32" },
          apple: "/images/apple-touch-icon.png",
        },
    openGraph: {
      title: `${companyName} | Perumahan KPR & Syariah`,
      description:
        "Hunian modern dengan skema KPR & Syariah. Cicilan mulai Rp 999k/bulan. Lokasi strategis, lingkungan asri.",
      type: "website",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <div className="min-h-screen overflow-x-clip relative">
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  );
}
