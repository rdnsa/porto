import { ArrowRight, ArrowUpRight, X } from "lucide-react";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import type { Project, Story } from "../../shared/types";
import { media } from "../lib/media";
import { useBodyScrollLock } from "../lib/useBodyScrollLock";
import { useT } from "../lib/prefs";
import { useDialog } from "../lib/useDialog";
import { Preferences } from "./Preferences";
import { Rich } from "./ui";

const METRIC_COLUMNS = ["", "md:grid-cols-1", "md:grid-cols-2", "md:grid-cols-3", "md:grid-cols-4"];

const host = (url: string) => new URL(url).host.replace(/^www\./, "");

/** Full-screen case study sheet for /work/:slug. Keeps the home page mounted underneath. */
export function CaseStudy({
  project,
  projects,
  owner,
  onClose,
  onNavigate,
}: {
  project: Project | null;
  projects: Project[];
  owner: string;
  onClose: () => void;
  onNavigate: (slug: string) => void;
}) {
  const t = useT();
  const [current, setCurrent] = useState(project);
  const dialog = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const open = project !== null;

  useBodyScrollLock(open);
  useDialog(dialog, open, onClose);

  useEffect(() => {
    if (!project) return;
    setCurrent(project);
    scroller.current?.scrollTo({ top: 0 });
    const previous = document.title;
    document.title = `${project.name} — ${owner}`;
    return () => {
      document.title = previous;
    };
  }, [project, owner]);

  if (!current) return null;

  const next = projects[(projects.findIndex((p) => p.slug === current.slug) + 1) % projects.length];
  const goNext = (event: MouseEvent) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    onNavigate(next.slug);
  };

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-title"
      inert={!open}
      className={`fixed inset-0 z-[60] transition-[opacity,visibility] duration-500 ${open ? "visible opacity-100" : "invisible opacity-0"}`}
    >
      <div
        ref={scroller}
        className={`h-full overflow-y-auto overscroll-contain bg-gallery-white transition-transform duration-700 ease-out-quint ${open ? "translate-y-0" : "translate-y-10"}`}
      >
        <div className="sticky top-0 z-10 border-b border-black/10 bg-paper-frost/80 backdrop-blur-xl dark:border-white/10 backdrop-saturate-150">
          <div className="page flex h-13 items-center justify-between gap-4">
            <p className="truncate font-display text-nav-title">{current.name}</p>
            <div className="flex shrink-0 items-center gap-3">
              <Preferences />
              <button
                type="button"
                onClick={onClose}
                data-autofocus
                aria-label={t("case.close")}
                className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e8e8ed] text-ink/70 transition-colors duration-300 hover:bg-[#dcdce0] hover:text-ink dark:bg-[#333336] dark:hover:bg-[#424245]"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        <article>
          <header className="page pt-14 sm:pt-20">
            <p className="text-kicker text-slate">{current.category}</p>
            <h1 id="case-title" className="mt-3 text-display">
              {current.name}
            </h1>
            <p className="mt-3 max-w-[28ch] font-display text-[clamp(1.5rem,1.2rem+1.3vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.01em] text-steel">
              {current.tagline}
            </p>
            <p className="mt-8 max-w-[60ch] text-lead text-ink/85">{current.description}</p>

            <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-hairline-silver pt-6 md:grid-cols-4">
              <Meta label={t("case.role")} value={current.role} />
              {current.company && <Meta label={t("case.company")} value={current.company} />}
              {current.year && <Meta label={t("case.year")} value={current.year} />}
              {current.url && (
                <div>
                  <dt className="text-control text-slate">{t("case.live")}</dt>
                  <dd className="mt-1 text-body">
                    <a
                      href={current.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-0.5 text-apple-blue hover:underline"
                    >
                      {host(current.url)}
                      <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden />
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            <p className="mt-6 max-w-[60ch] text-body text-slate">{current.roleDetail}</p>
          </header>

          <figure className="page mt-12 sm:mt-16">
            <img
              src={media(current.cover)}
              alt={current.coverAlt}
              className="scroll-zoom w-full rounded-card ring-1 ring-black/5 dark:ring-white/10"
            />
          </figure>

          {current.metrics.length > 0 && (
            <section aria-label={t("case.results")} className="page mt-16 sm:mt-24">
              <div className={`grid grid-cols-2 gap-x-8 gap-y-10 ${METRIC_COLUMNS[Math.min(current.metrics.length, 4)]}`}>
                {current.metrics.map((metric) => (
                  <div key={metric.label} className="border-t border-hairline-silver pt-5">
                    <p className="font-display text-[clamp(2.5rem,1.9rem+2.4vw,4rem)] font-semibold leading-none tracking-[-0.03em]">
                      {metric.value}
                    </p>
                    <p className="mt-3 text-body-sm text-slate">{metric.label}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {current.modules.length > 0 && (
            <section aria-labelledby="modules-title" className="mt-16 bg-studio-mist py-[90px] sm:mt-24">
              <div className="page">
                <h2 id="modules-title" className="text-headline">
                  {t("case.whatItDoes")}
                </h2>
                <div className="mt-10 grid gap-5 md:grid-cols-2">
                  {current.modules.map((module, i) => (
                    <article key={module.title} className="rounded-card bg-gallery-white p-7 sm:p-9">
                      <p className="text-control text-slate">{String(i + 1).padStart(2, "0")}</p>
                      <h3 className="mt-3 text-subtitle">{module.title}</h3>
                      <p className="mt-3 text-body text-ink/75">{module.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {current.flows.length > 0 && (
            <section aria-label={t("case.howItConnects")} className="page space-y-12 py-16 sm:py-24">
              {current.flows.map((flow) => (
                <div key={flow.title}>
                  <h2 className="text-kicker">{flow.title}</h2>
                  <ol className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-3">
                    {flow.steps.map((step, i) => (
                      <li key={step} className="flex items-center gap-2">
                        <span className="rounded-full border border-steel px-4 py-2 text-body-sm">{step}</span>
                        {i < flow.steps.length - 1 && (
                          <ArrowRight aria-hidden size={16} strokeWidth={1.75} className="text-steel" />
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </section>
          )}

          {current.stories.map((story, s) => (
            <StoryChapter
              key={story.title}
              story={story}
              id={`story-${s}`}
              label={current.stories.length > 1 ? t("case.chapter", { n: s + 1 }) : t("case.theStory")}
              divided={s > 0 || current.flows.length > 0}
            />
          ))}

          {current.gallery.length > 0 && (
            <section aria-labelledby="gallery-title" className="bg-studio-mist py-[90px]">
              <div className="page">
                <h2 id="gallery-title" className="text-headline">
                  {t("case.behindTheWork")}
                </h2>
                <div className="mt-10 grid gap-5 md:grid-cols-2">
                  {current.gallery.map((image) => (
                    <figure key={image.src} className="rounded-card bg-gallery-white p-3 sm:p-4">
                      <img
                        src={media(image.src)}
                        alt={image.alt}
                        loading="lazy"
                        className="aspect-[2/1] w-full rounded-[18px] object-cover object-[50%_30%]"
                      />
                      {image.caption && (
                        <figcaption className="px-2 pb-1 pt-4 text-body-sm text-slate">{image.caption}</figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </div>
            </section>
          )}

          {next && next.slug !== current.slug && (
            <footer className="page py-16 sm:py-24">
              <a
                href={`/work/${next.slug}`}
                onClick={goNext}
                className="group block rounded-card bg-studio-mist p-7 transition-colors duration-300 hover:bg-control-gray sm:p-10"
              >
                <p className="text-control text-slate">{t("case.nextProject")}</p>
                <p className="mt-2 max-w-[26ch] text-headline">
                  {next.name}. <span className="text-steel">{next.tagline}</span>
                </p>
                <span className="mt-6 inline-flex items-center gap-1 text-body text-apple-blue group-hover:underline">
                  {t("work.viewCase")} <span aria-hidden>›</span>
                </span>
              </a>
            </footer>
          )}
        </article>
      </div>
    </div>
  );
}

/** One challenge → work → impact story, set under a kicker ("The story" or "Chapter n"). */
function StoryChapter({ story, id, label, divided }: { story: Story; id: string; label: string; divided: boolean }) {
  const t = useT();
  return (
    <section aria-labelledby={id} className="page">
      <div className={`py-16 sm:py-24 ${divided ? "border-t border-hairline-silver" : ""}`}>
        <p className="text-kicker text-slate">{label}</p>
        <h2 id={id} className="mt-3 text-headline">
          {story.title}.
        </h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          <Column title={t("case.challenge")} items={story.challenge} />
          <Column title={t("case.responsibilities")} items={story.responsibilities} />
          <Column title={t("case.initiatives")} items={story.initiatives} />
        </div>
        <div className="mt-12 rounded-card bg-studio-mist p-7 sm:p-10">
          <h3 className="text-subtitle">{t("case.impact")}</h3>
          <ol className="mt-6 grid gap-x-8 gap-y-6 md:grid-cols-3">
            {story.impact.map((item, i) => (
              <li key={item} className="flex gap-4">
                <span aria-hidden className="font-display text-title text-steel">
                  {i + 1}
                </span>
                <p className="text-body text-ink/80">
                  <Rich text={item} />
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-control text-slate">{label}</dt>
      <dd className="mt-1 text-body">{value}</dd>
    </div>
  );
}

function Column({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-body font-semibold">{title}</h3>
      <ul className="mt-4 space-y-3 text-body text-ink/75">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span aria-hidden className="mt-[0.62em] size-1 shrink-0 rounded-full bg-ink/40" />
            <span>
              <Rich text={item} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
