import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoTransitX - Predictive Traffic & Smart Transit AI",
  description: "Advanced geospatial predictive traffic management powered by Drone Photogrammetry, GeoAI, and Typhoon LLM.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-[#090d16] text-slate-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
