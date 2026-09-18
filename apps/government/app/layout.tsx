import type { Metadata } from "next";
import "@edupathai/design-system/tokens.css";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "EduPathAI Government",
    template: "%s · EduPathAI",
  },
  description:
    "EduPathAI Government dashboard — aggregate mobility intelligence across institutions.",
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