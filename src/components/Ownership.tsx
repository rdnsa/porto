import { Compass, SquareKanban, TrendingUp } from "lucide-react";
import type { SkillGroup } from "../../shared/types";
import { useT } from "../lib/prefs";
import { Reveal, SectionHeading } from "./ui";

const ICONS = [SquareKanban, Compass, TrendingUp];

export function Ownership({ skills, role, tagline }: { skills: SkillGroup[]; role: string; tagline: string }) {
  const t = useT();
  const core = skills.filter((group) => group.kind === "core");
  const tools = skills.filter((group) => group.kind === "tools");

  return (
    <section aria-labelledby="ownership-title" className="bg-gallery-white py-[90px] sm:py-32">
      <div className="page">
        <SectionHeading id="ownership-title" kicker={t("ownership.kicker")} title={`${role}.`} aside={tagline} />

        <div className="mt-12 grid gap-5 md:grid-cols-3 lg:mt-16">
          {core.map((group, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Reveal key={group.title} delay={i * 90} className="h-full">
                <article className="flex h-full flex-col rounded-card bg-studio-mist p-7 sm:p-8">
                  <Icon aria-hidden size={30} strokeWidth={1.5} className="text-ink" />
                  <h3 className="mt-8 text-subtitle">{group.title}</h3>
                  <ul className="mt-5 space-y-2.5 text-body text-ink/80">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>

        {tools.map((group) => (
          <Reveal key={group.title} className="mt-10 border-t border-hairline-silver pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-10">
              <h3 className="text-body font-semibold">{group.title}</h3>
              <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-body text-slate">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
