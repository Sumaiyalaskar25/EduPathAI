import type { Metadata } from "next";
import "@edupathai/design-system/tokens.css";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "EduPathAI Student",
    template: "%s · EduPathAI",
  },
  description:
    "EduPathAI Student portal — explainable, constraint-aware academic pathways.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}