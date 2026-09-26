import { useT } from "../lib/prefs";
import { Reveal } from "./ui";

/** A single line to carry into the contact section. */
export function Quote() {
  const t = useT();
  return (
    <section aria-label={t("quote.by")} className="bg-gallery-white pt-[90px] sm:pt-32">
      <Reveal stagger className="page text-center">
        <blockquote className="mx-auto max-w-[22ch] font-display text-headline text-balance">
          <p>&ldquo;{t("quote.text")}&rdquo;</p>
        </blockquote>
        <p className="mt-6 text-body text-slate">— {t("quote.by")}</p>
      </Reveal>
    </section>
  );
}
