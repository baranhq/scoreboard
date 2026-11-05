import {
  ChartNoAxesColumn,
  Check,
  Gamepad2,
  Goal,
  GraduationCap,
  Palette,
  Share2,
  Star,
  Timer,
  ArrowRight,
} from "lucide-react";
import type { LandingContent } from "@/lib/landing-content";
import { repo } from "@/lib/site";

const featureIcons = [ChartNoAxesColumn, Palette, Timer, Share2];
const useCaseIcons = [GraduationCap, Goal, Gamepad2];

export function LandingFeatures({ copy }: { copy: LandingContent["features"] }) {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="scroll-mt-24 border-b border-forest/15 py-7 sm:py-9"
    >
      <header className="mb-6 max-w-3xl">
        <h2
          id="features-title"
          className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl"
        >
          {copy.title}
        </h2>
      </header>
      <div className="grid border-t border-forest/15 sm:grid-cols-2">
        {copy.items.map((feature, index) => {
          const Icon = featureIcons[index] ?? Check;
          return (
            <article key={feature.title} className="border-b border-forest/15 py-4 sm:px-5 sm:py-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-forest/5 text-forest">
                <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <h3 className="font-display text-lg font-semibold text-ink">{feature.title}</h3>
              <p className="mt-2 text-base leading-7 text-ink/80">{feature.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function LandingSteps({ copy }: { copy: LandingContent["steps"] }) {
  return (
    <section aria-labelledby="steps-title" className="border-b border-forest/15 py-7 sm:py-9">
      <h2
        id="steps-title"
        className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl"
      >
        {copy.title}
      </h2>
      <ol className="mt-6 grid gap-x-8 md:grid-cols-3">
        {copy.items.map((step, index) => (
          <li key={step.title} className="border-t border-forest/20 py-4 sm:py-5">
            <p className="font-display text-sm font-bold tracking-[0.12em] text-forest">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-2 font-display text-lg font-semibold text-ink">{step.title}</h3>
            <p className="mt-2 text-base leading-7 text-ink/80">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function LandingUseCases({ copy }: { copy: LandingContent["useCases"] }) {
  return (
    <section aria-labelledby="use-cases-title" className="border-b border-forest/15 py-7 sm:py-9">
      <header className="mb-6 max-w-3xl">
        <h2
          id="use-cases-title"
          className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl"
        >
          {copy.title}
        </h2>
      </header>
      <div className="grid gap-x-7 lg:grid-cols-3">
        {copy.items.map((useCase, index) => {
          const Icon = useCaseIcons[index] ?? Check;
          return (
            <article
              key={useCase.title}
              className="flex gap-3 border-t border-forest/15 py-4 sm:py-5"
            >
              <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-forest" />
              <div>
                <h3 className="font-display text-lg font-semibold text-ink">{useCase.title}</h3>
                <p className="mt-2 text-base leading-7 text-ink/80">{useCase.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function OpenSourceSection({ copy }: { copy: LandingContent["openSource"] }) {
  return (
    <section
      aria-labelledby="open-source-title"
      className="my-7 flex flex-col gap-3 rounded-xl border border-forest/15 bg-forest/5 p-4 sm:my-9 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-5"
    >
      <div className="max-w-3xl">
        <h2
          id="open-source-title"
          className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl"
        >
          {copy.title}
        </h2>
        <p className="mt-2 text-base leading-7 text-ink/80">{copy.description}</p>
        <p className="mt-2 text-base leading-7 text-ink/80">
          <a
            href={repo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm text-forest transition-colors duration-150 hover:text-forest/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest motion-reduce:transition-none"
          >
            <Star aria-hidden="true" className="h-4 w-4 shrink-0" />
            {copy.starNote}
          </a>
        </p>
      </div>
      <a
        href={repo}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 shrink-0 items-center gap-2 font-semibold text-forest transition-colors duration-150 hover:text-forest/75 focus-visible:text-forest/75 motion-reduce:transition-none"
      >
        {copy.link}
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </a>
    </section>
  );
}
