import { type CSSProperties, useRef } from "react";
import type { Profile, Social } from "../../shared/types";
import { media } from "../lib/media";
import { NAV } from "../lib/nav";
import { useT } from "../lib/prefs";
import { useScrollVar } from "../lib/scroll";
import { Preferences } from "./Preferences";
import { BluePill } from "./ui";

const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

// 0 while the hero fills the screen, 1 once it has scrolled away.
const heroProgress = (rect: DOMRect) => -rect.top / rect.height;

// Scroll-out choreography: the name drifts up and fades, the portrait settles back, chrome fades first.
const nameExit: CSSProperties = {
  transform: "translate3d(0, calc(var(--hp, 0) * -16vh), 0)",
  opacity: "calc(1 - var(--hp, 0) * 0.9)",
};
const portraitExit: CSSProperties = {
  transform: "translate3d(0, calc(var(--hp, 0) * 6vh), 0) scale(calc(1 - var(--hp, 0) * 0.08))",
  transformOrigin: "50% 100%",
};
const chromeExit: CSSProperties = { opacity: "calc(1 - var(--hp, 0) * 2)" };

/**
 * One full-viewport composition: gallery canvas, the name scrolling behind a cut-out portrait,
 * index/social chrome up top and a short blurb under a hairline. Layer order:
 * canvas → name + rule (z-10) → portrait (z-20) → header, mobile footer (z-30).
 */
export function Hero({ profile, socials }: { profile: Profile; socials: Social[] }) {
  const year = new Date().getFullYear();
  const name = `${profile.firstName} ${profile.lastName} — `;
  const section = useRef<HTMLElement>(null);
  const t = useT();
  useScrollVar(section, heroProgress, "--hp");

  return (
    <section
      ref={section}
      id="top"
      aria-labelledby="hero-title"
      className="relative h-[100dvh] min-h-[320px] w-full overflow-hidden"
    >
      <h1 id="hero-title" className="sr-only">
        {profile.firstName} {profile.lastName} — {profile.role}
      </h1>

      <div aria-hidden className="anim-fade-in absolute inset-0 bg-studio-mist" />

      <div
        aria-hidden
        className="anim-fade-up absolute inset-x-0 top-[28vh] z-10 overflow-hidden sm:top-[14vh]"
        style={delay(500)}
      >
        {/* Two identical halves (two names each, so ultra-wide screens never show a gap). */}
        <div style={nameExit} className="will-change-transform">
          <div className="marquee flex w-max whitespace-nowrap font-display text-[16vh] font-semibold leading-none tracking-[-0.045em] text-ink sm:text-[26vh]">
            {[0, 1, 2, 3].map((i) => (
              <span key={i}>{name}</span>
            ))}
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="anim-line absolute inset-x-6 bottom-[6.5rem] z-10 h-px bg-ink sm:inset-x-10 lg:hidden short:!block"
        style={delay(1200)}
      />

      {/* Phones size the figure by height (like the name above it), so the head always tucks just
          under the bottom of the name whatever the screen's shape; wider screens fit it whole. */}
      <div
        className="anim-rise-in pointer-events-none absolute inset-x-0 bottom-0 top-[34vh] z-20 flex justify-center sm:top-[8vh]"
        style={delay(300)}
      >
        <img
          src={media(profile.portraitCutout)}
          alt={t("hero.portraitAlt", { name: profile.fullName })}
          fetchPriority="high"
          style={portraitExit}
          className="h-full w-auto max-w-none object-contain object-bottom will-change-transform sm:w-full"
        />
      </div>

      <header id="hero-nav" style={chromeExit} className="absolute inset-x-0 top-0 z-30 flex items-start justify-between px-6 pt-6 sm:px-10 sm:pt-8 short:pt-5">
        <a href="#top" className="anim-fade-up font-display text-nav-title" style={delay(800)}>
          {profile.lastName}
        </a>
        {/* Phones: language/theme sit beside the name, clear of the menu button in the corner. */}
        <Preferences className="anim-fade-up -mt-1 mr-10 sm:hidden short:!flex" style={delay(900)} />
        <div className="hidden items-start gap-10 text-body-sm sm:flex md:gap-16 lg:gap-24 short:!hidden">
          <span className="anim-fade-up text-ink/55" style={delay(900)}>
            {year}
          </span>
          <nav aria-label={t("nav.siteIndex")} className="flex flex-col gap-0.5">
            {NAV.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                className="anim-fade-up transition-opacity duration-300 hover:opacity-60"
                style={delay(1000 + i * 80)}
              >
                {t(item.key)}
              </a>
            ))}
          </nav>
          <nav aria-label={t("nav.findMe")} className="flex flex-col gap-0.5">
            {socials.map((social, i) => (
              <a
                key={social.url}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="anim-fade-up transition-opacity duration-300 hover:opacity-60"
                style={delay(1150 + i * 80)}
              >
                {social.label}
              </a>
            ))}
          </nav>
          <div className="anim-fade-up -mt-1.5 flex flex-col items-end gap-2" style={delay(1150 + socials.length * 80)}>
            <BluePill href="#contact">{t("nav.letsTalk")}</BluePill>
            <Preferences className="-mr-1.5" />
          </div>
        </div>
      </header>

      {/* Desktop blurb sits under the portrait's layer (z-10), in the corner the figure leaves free —
          only from lg up; on tablets the figure spans that corner, so they get the capsule below.
          The hairline is stacked in the same column, so however the text wraps it never runs into it. */}
      <div style={chromeExit} className="absolute inset-x-0 bottom-0 z-10 hidden flex-col gap-5 px-10 pb-8 text-sm leading-relaxed lg:flex short:!hidden">
        <div aria-hidden className="anim-line h-px bg-ink" style={delay(1200)} />
        <p className="anim-fade-up max-w-[55%]" style={delay(1400)}>
          {profile.role}
          <br />
          {profile.tagline}
          <br />
          <span className="text-slate">{profile.location}</span>
        </p>
      </div>

      {/* Phones and tablets: the figure covers the bottom corners, so the blurb floats over it as a
          DESIGN.md "Floating Pricing Callout" — white 28px capsule with the blue pill inside. */}
      <div
        className="anim-fade-up absolute inset-x-4 bottom-4 z-30 mx-auto flex max-w-md items-center justify-between gap-4 rounded-[28px] bg-white/90 py-3 dark:bg-[#1d1d1f]/85 pl-5 pr-3 backdrop-blur-xl lg:hidden short:!flex"
        style={delay(1400)}
      >
        <p className="min-w-0">
          <span className="block truncate text-body-sm font-semibold">{profile.role}</span>
          <span className="block truncate text-control text-slate">{profile.location}</span>
        </p>
        <BluePill href="#contact" className="shrink-0 px-4 py-2">
          {t("nav.letsTalk")}
        </BluePill>
      </div>
    </section>
  );
}
