import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="bg" suppressHydrationWarning>
      <head>
        <meta name="robots" content="noindex,nofollow" />
        <title>Страницата не е намерена | Baran’s Scoreboard</title>
        <script src="/theme-4940c847476b.js" />
      </head>
      <body>
        <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-12">
          <h1 className="font-display text-4xl font-bold tracking-tight">
            Тази страница не е намерена.
          </h1>
          <p className="mt-5 text-lg leading-8">
            Връзката може да е променена. Запазените ви табла остават в този браузър.
          </p>
          <Link
            href="/bg/"
            className="mt-6 inline-flex min-h-12 w-fit items-center rounded-lg bg-action px-5 py-2 text-lg font-medium text-on-action"
          >
            Към таблото
          </Link>
          <p className="mt-8 flex gap-5">
            <Link className="underline" href="/en/">
              English
            </Link>
            <Link className="underline" href="/tr/">
              Türkçe
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
