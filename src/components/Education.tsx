import type { Certification, Education as School, Organization } from "../../shared/types";
import { media } from "../lib/media";
import { Reveal, SectionHeading } from "./ui";

export function Education({
  education,
  organizations,
  certifications,
}: {
  education: School[];
  organizations: Organization[];
  certifications: Certification[];
}) {
  return (
    <section aria-labelledby="education-title" className="bg-studio-mist py-[90px] sm:py-32">
      <div className="page">
        <SectionHeading id="education-title" kicker="Education & recognition" title="Always learning." aside="Then leading others through it." />

        <div className="mt-12 grid gap-5 lg:mt-16 lg:grid-cols-12">
          {education.map((school) => (
            <Reveal key={school.school} className="lg:col-span-7">
              <article className="h-full rounded-card bg-gallery-white p-7 sm:p-10">
                {school.image && (
                  <img
                    src={media(school.image)}
                    alt={school.imageAlt ?? ""}
                    loading="lazy"
                    className="mb-8 aspect-[3/2] w-full rounded-[18px] object-cover object-[50%_35%]"
                  />
                )}
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div>
                    {/* DESIGN.md "Launch Status Label": bare orange text, no pill. */}
                    {school.honor && <p className="mb-2 text-control font-semibold text-launch-orange">{school.honor}</p>}
                    <p className="text-body-sm text-slate">{school.period}</p>
                    <h3 className="mt-2 text-title">{school.school}</h3>
                    <p className="mt-1.5 text-body">{school.degree}</p>
                    <p className="text-body-sm text-slate">{school.location}</p>
                  </div>
                  <p className="text-right">
                    <span className="block font-display text-[4rem] font-semibold leading-none tracking-[-0.035em]">{school.gpa}</span>
                    <span className="mt-1 block text-body-sm text-slate">GPA / 4.00</span>
                  </p>
                </div>
                <ul className="mt-8 space-y-3 border-t border-hairline-silver pt-6 text-body text-ink/80">
                  {school.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span aria-hidden className="mt-[0.62em] size-1 shrink-0 rounded-full bg-ink/40" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}

          <div className="grid gap-5 lg:col-span-5">
            {organizations.map((org, i) => (
              <Reveal key={org.name} delay={i * 90}>
                <article className="h-full rounded-card bg-gallery-white p-7 sm:p-9">
                  <p className="text-body-sm text-slate">{org.period}</p>
                  <h3 className="mt-2 text-subtitle">{org.role}</h3>
                  <p className="mt-1 text-body">{org.name}</p>
                  <p className="mt-3 text-body-sm text-slate">{org.summary}</p>
                  <ul className="mt-5 space-y-2 text-body-sm text-ink/80">
                    {org.points.map((point) => (
                      <li key={point} className="flex gap-2.5">
                        <span aria-hidden className="mt-[0.6em] size-1 shrink-0 rounded-full bg-ink/40" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        {certifications.length > 0 && (
          <Reveal className="mt-5">
            <article className="rounded-card bg-gallery-white p-7 sm:p-10">
              <h3 className="text-subtitle">Certifications</h3>
              <ul className="mt-6 grid gap-x-10 lg:grid-cols-2">
                {certifications.map((cert) => (
                  <li
                    key={`${cert.title}-${cert.issuer}`}
                    className="flex items-baseline gap-4 border-t border-hairline-silver py-3.5 text-body"
                  >
                    <span className="w-11 shrink-0 text-body-sm text-slate tabular-nums">{cert.year}</span>
                    <span className="min-w-0 flex-1 sm:flex sm:items-baseline sm:justify-between sm:gap-4">
                      <span className="block">{cert.title}</span>
                      <span className="block text-body-sm text-slate sm:shrink-0 sm:text-right">{cert.issuer}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        )}
      </div>
    </section>
  );
}
