import type { Metadata } from "next";
import localFont from "next/font/local";
import { Baskervville, Inter, Manrope } from "next/font/google";
import { SiteChrome } from "@/components/layout/SiteChrome";
import "./tailwind.css";
import "./legacy/base.css";
import "./legacy/home.css";
import "./legacy/classes.css";
import "./legacy/shop.css";
import "./legacy/blog.css";
import "./legacy/cart.css";
import "./legacy/studio.css";
import "./legacy/promo-entry.css";
import "./legacy/footer.css";
import "./legacy/cookiebar.css";
import "./legacy/site.css";
import "./globals.css";
import "./responsive-tuning.css";

const baskervville = Baskervville({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-baskervville",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap"
});

const nunito = localFont({
  src: [
    {
      path: "../../public/fonts/Nunito-VariableFont_wght.ttf",
      style: "normal"
    },
    {
      path: "../../public/fonts/Nunito-Italic-VariableFont_wght.ttf",
      style: "italic"
    }
  ],
  variable: "--font-nunito",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://casarosierceramica.com"),
  title: {
    default: "Casa Rosier",
    template: "%s | Casa Rosier"
  },
  description: "Studio de ceramica en Barcelona"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body
        className={`${baskervville.variable} ${inter.variable} ${manrope.variable} ${nunito.variable}`}
      >
        {children}
        <SiteChrome />
      </body>
    </html>
  );
}
