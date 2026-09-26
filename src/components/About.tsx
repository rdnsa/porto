import { Download } from "lucide-react";
import type { Profile } from "../../shared/types";
import { media } from "../lib/media";
import { useT } from "../lib/prefs";
import { Reveal, ScrollWords } from "./ui";

/** DESIGN.md "Editorial Feature Block": kicker, statement, body copy, and a photo entering from the side. */
export function About({ profile }: { profile: Profile }) {
  const t = useT();
  const [lead, ...rest] = profile.intro.split(/(?<=\.)\s+/);

  return (
    <section id="about" aria-labelledby="about-title" className="overflow-hidden bg-gallery-white py-[90px] sm:py-32">
      <div className="page">
        <Reveal stagger>
          <p className="text-kicker text-slate">{t("about.kicker")}</p>
          <ScrollWords id="about-title" lead={lead} muted={rest.join(" ")} className="mt-3 max-w-[19ch] text-display" />
        </Reveal>

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-5">
            <p className="text-lead text-ink/85">{profile.summary}</p>
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-hairline-silver pt-6">
              <div>
                <dt className="text-control text-slate">{t("about.role")}</dt>
                <dd className="mt-1 text-body">{profile.role}</dd>
              </div>
              <div>
                <dt className="text-control text-slate">{t("about.basedIn")}</dt>
                <dd className="mt-1 text-body">{profile.location}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-control text-slate">{t("about.currently")}</dt>
                <dd className="mt-1 text-body">{profile.currentCompany}</dd>
              </div>
            </dl>
            {profile.resume && (
              <a
                href={media(profile.resume)}
                download
                className="mt-8 inline-flex items-center gap-1.5 text-body text-apple-blue hover:underline"
              >
                {t("about.downloadCv")} <Download size={16} strokeWidth={1.75} />
              </a>
            )}
          </Reveal>

          {profile.aboutImage && (
            <Reveal className="lg:col-span-7" delay={120}>
              <figure className="lg:-mr-[max(var(--gutter),calc((100vw-var(--content))/2))]">
                <img
                  src={media(profile.aboutImage)}
                  alt={profile.aboutImageCaption ?? ""}
                  loading="lazy"
                  className="scroll-zoom aspect-[16/10] w-full rounded-card object-cover lg:rounded-r-none"
                />
                {profile.aboutImageCaption && (
                  <figcaption className="mt-3 max-w-[60ch] text-control text-slate">{profile.aboutImageCaption}</figcaption>
                )}
              </figure>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
