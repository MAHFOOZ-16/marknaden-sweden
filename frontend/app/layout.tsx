import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Background3D from "@/components/Background3D";
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { AuthTokenProvider } from "@/components/AuthTokenProvider";
import { Toaster } from "react-hot-toast";
import { ChatNotifier } from "@/app/chat/ChatNotifier";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Marknaden - Sweden's Next-Gen Marketplace",
  description: "Buy and sell with trust, speed, and delight. A premium marketplace experience built for Sweden.",
  keywords: ["marketplace", "buy", "sell", "Sweden", "second-hand", "used items"],
  metadataBase: new URL("https://marknaden-sweden.azurewebsites.net"),
  openGraph: {
    title: "Marknaden - Sweden's Next-Gen Marketplace",
    description: "Buy and sell with trust, speed, and delight. A premium marketplace experience built for Sweden.",
    url: "https://marknaden-sweden.azurewebsites.net",
    siteName: "Marknaden",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Marknaden - Sweden's Next-Gen Marketplace",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marknaden - Sweden's Next-Gen Marketplace",
    description: "Buy and sell with trust, speed, and delight. A premium marketplace experience built for Sweden.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-transparent`}>
        <Auth0Provider>
          <AuthTokenProvider>
            <Background3D />
            <FavoritesProvider>
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Toaster />
              <ChatNotifier />
            </FavoritesProvider>
            <Footer />
          </AuthTokenProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}

