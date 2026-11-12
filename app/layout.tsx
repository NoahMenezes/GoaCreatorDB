import type { Metadata } from "next";
import { Zilla_Slab, Rethink_Sans } from "next/font/google";
import "./globals.css";

const zillaSlab = Zilla_Slab({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const rethinkSans = Rethink_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Goa Creator — Creator discovery and collaboration for Goan hospitality",
  description:
    "Goa Creator connects hotels, resorts, cafés and brands with verified Goan creators for reels, photo carousels and story campaigns. Escrow-held budgets, verified reviews, direct booking.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${zillaSlab.variable} ${rethinkSans.variable} h-full antialiased`}
      data-type="service"
      data-radius="sharp"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
