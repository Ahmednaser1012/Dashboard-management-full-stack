import type { Metadata } from "next";
import { Providers } from "./providers";
import "@/index.css";

export const metadata: Metadata = {
  title: "Project Management Dashboard",
  description: "A powerful project management application to organize, track, and collaborate on projects",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none'><defs><linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%233b82f6;stop-opacity:1' /><stop offset='100%' style='stop-color:%231e40af;stop-opacity:1' /></linearGradient></defs><rect width='32' height='32' rx='8' fill='url(%23grad)'/><path d='M6 10H14L16 8H26C27.1 8 28 8.9 28 10V24C28 25.1 27.1 26 26 26H6C4.9 26 4 25.1 4 24V10C4 8.9 4.9 8 6 8Z' fill='white' opacity='0.9'/><path d='M12 18L14 20L20 14' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='none'/></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
