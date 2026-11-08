type Topic = { href: string; title: string };

function TopicLinks({ topics }: { topics: Topic[] }) {
  return (
    <ul className="mt-2 space-y-1">
      {topics.map((topic) => (
        <li key={topic.href}>
          <a
            href={topic.href}
            className="flex min-h-11 items-center rounded-lg px-3 py-2 font-sans text-base leading-6 font-medium text-forest transition-colors duration-150 hover:bg-forest/8 focus-visible:bg-forest/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest motion-reduce:transition-none dark:text-[#8bd69a] dark:hover:bg-white/5 dark:hover:text-white dark:focus-visible:bg-white/5"
          >
            {topic.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function TopicNavigation({ label, topics }: { label: string; topics: Topic[] }) {
  return (
    <>
      <details className="group mb-6 rounded-xl border border-forest/15 bg-surface p-3 lg:hidden print:hidden">
        <summary className="cursor-pointer border-b border-transparent px-3 pb-2 font-sans text-base font-semibold text-forest transition-[color,border-color] duration-150 group-open:border-forest/15 group-open:pb-3 hover:text-forest/80 motion-reduce:transition-none dark:text-[#8bd69a] dark:hover:text-white">
          {label}
        </summary>
        <nav aria-label={label} className="pt-1">
          <TopicLinks topics={topics} />
        </nav>
      </details>
      <aside className="hidden h-fit overscroll-contain rounded-xl border border-forest/15 bg-surface p-3 lg:sticky lg:top-20 lg:block lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto print:hidden">
        <nav aria-label={label}>
          <p className="mb-2 border-b border-forest/15 px-3 pb-3 font-sans text-base font-semibold text-forest dark:text-[#8bd69a]">
            {label}
          </p>
          <TopicLinks topics={topics} />
        </nav>
      </aside>
    </>
  );
}
