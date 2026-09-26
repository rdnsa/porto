import { ArrowUpRight, FileText } from "lucide-react";
import type { Publication } from "../../shared/types";
import { useT } from "../lib/prefs";
import { Reveal, SectionHeading } from "./ui";

/** Peer-reviewed papers, newest first, with a link to the full Google Scholar profile. */
export function Research({
  publications,
  owner,
  profileUrl,
}: {
  publications: Publication[];
  /** Full name as it appears in author lists, set in bold there. */
  owner: string;
  profileUrl: string | null;
}) {
  const t = useT();
  if (!publications.length) return null;

  return (
    <section id="research" aria-labelledby="research-title" className="bg-gallery-white py-[90px] sm:py-32">
      <div className="page">
        <div className="flex items-end justify-between gap-8">
          <SectionHeading id="research-title" kicker={t("research.kicker")} title={t("research.title")} aside={t("research.aside")} />
          {profileUrl && (
            <a
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
              className="mb-2 hidden shrink-0 text-body text-apple-blue hover:underline md:inline"
            >
              {t("research.profile")}
            </a>
          )}
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:mt-16">
          {publications.map((paper, i) => (
            <Reveal key={paper.url} delay={i * 90} className="h-full">
              <article className="flex h-full flex-col rounded-card bg-studio-mist p-7 sm:p-9">
                <p className="text-control font-semibold text-slate">
                  {paper.year} · {paper.venue}
                  {paper.details && ` · ${paper.details}`}
                </p>
                <h3 className="mt-3 text-subtitle">{paper.title}</h3>
                <p className="mt-3 text-body-sm text-slate">
                  {paper.authors.map((author, a) => (
                    <span key={author}>
                      {a > 0 && ", "}
                      {author === owner ? <strong className="font-semibold text-ink">{author}</strong> : author}
                    </span>
                  ))}
                </p>
                <p className="mt-5 text-body text-ink/80">{paper.summary}</p>
                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-7 text-body">
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-apple-blue hover:underline"
                  >
                    {t("research.read")}
                    <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden />
                  </a>
                  {paper.pdfUrl && (
                    <a
                      href={paper.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-apple-blue hover:underline"
                    >
                      <FileText size={15} strokeWidth={1.75} aria-hidden />
                      {t("research.pdf")}
                    </a>
                  )}
                  {paper.citations > 0 && (
                    <span className="text-body-sm text-slate">{t("research.citedBy", { count: paper.citations })}</span>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {profileUrl && (
          <a href={profileUrl} target="_blank" rel="noreferrer" className="mt-8 inline-block text-body text-apple-blue hover:underline md:hidden">
            {t("research.profile")}
          </a>
        )}
      </div>
    </section>
  );
}
