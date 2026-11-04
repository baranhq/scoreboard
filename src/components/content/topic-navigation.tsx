type Topic = {href:string;title:string};

function TopicLinks({topics}:{topics:Topic[]}){
 return <ul className="mt-2 space-y-1">
  {topics.map(topic=><li key={topic.href}><a href={topic.href} className="flex min-h-11 items-center rounded-lg px-3 py-2 font-sans text-base font-medium leading-6 text-forest transition-colors duration-150 hover:text-forest/80 dark:text-[#8bd69a] dark:hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest motion-reduce:transition-none">{topic.title}</a></li>)}
 </ul>;
}

export function TopicNavigation({label,topics}:{label:string;topics:Topic[]}){
 return <>
  <details className="mb-6 lg:hidden">
   <summary className="cursor-pointer font-sans text-base font-semibold text-forest transition-colors duration-150 hover:text-forest/80 dark:text-[#8bd69a] dark:hover:text-white motion-reduce:transition-none">{label}</summary>
   <nav aria-label={label}><TopicLinks topics={topics}/></nav>
  </details>
  <aside className="hidden h-fit lg:sticky lg:top-20 lg:block lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto">
   <nav aria-label={label}>
    <p className="px-3 font-sans text-base font-semibold text-forest dark:text-[#8bd69a]">{label}</p>
    <TopicLinks topics={topics}/>
   </nav>
  </aside>
 </>;
}
