import "../font-faces.css";
import "../globals.css";
import Script from "next/script";

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <body>
        <Script src="/theme-4940c847476b.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
