import { useT } from "../lib/prefs";
import { Reveal } from "./ui";

/** A chapter of its own: one line, set large in cream on black, between Education and Contact. */
export function Quote() {
  const t = useT();
  return (
    <section aria-label={t("quote.by")} className="bg-black py-[120px] text-cream sm:py-40 dark:bg-studio-mist">
      <Reveal stagger className="page text-center">
        <blockquote className="mx-auto max-w-[22ch] font-display text-headline text-balance">
          <p>&ldquo;{t("quote.text")}&rdquo;</p>
        </blockquote>
        <p className="mt-6 text-body text-cream/55">— {t("quote.by")}</p>
      </Reveal>
    </section>
  );
}
