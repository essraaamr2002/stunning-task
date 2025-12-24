// src/app/layout.tsx
import type { Metadata } from "next";
import Providers from "./providers";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

export const metadata: Metadata = {
  title: "Prompt Improver",
  description: "Turn your rough idea into a website-ready AI prompt",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
