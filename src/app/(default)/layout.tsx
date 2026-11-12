import "../font-faces.css";
import "../globals.css";
import Script from "next/script";

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <body>
        <Script src="/theme-0f9a1b76655f.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
