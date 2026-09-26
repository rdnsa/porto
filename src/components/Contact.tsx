import { ArrowUpRight, Check } from "lucide-react";
import { type FormEvent, useState } from "react";
import type { Profile, Social } from "../../shared/types";
import { MESSAGES, type MessageKey } from "../lib/i18n";
import { useT } from "../lib/prefs";
import { Reveal } from "./ui";

type Status = { state: "idle" | "sending" | "sent" } | { state: "error"; message: string };

// DESIGN.md "Rounded Search Input": white fill, 1px Steel outline, 980px radius, 24px left padding.
const FIELD =
  "w-full border border-steel bg-gallery-white px-6 py-3.5 text-body text-ink placeholder:text-steel transition-[border-color,box-shadow] duration-300 focus:border-pricing-blue focus:shadow-[0_0_0_3px_rgba(0,113,227,0.25)] focus:outline-none";

export function Contact({ profile, socials }: { profile: Profile; socials: Social[] }) {
  const t = useT();
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus({ state: "sending" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string; code?: string };
      if (!response.ok) {
        const key = `contact.error.${result.code}` as MessageKey;
        throw new Error(result.code && key in MESSAGES.en ? t(key) : (result.error ?? t("contact.error.generic")));
      }
      form.reset();
      setStatus({ state: "sent" });
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof TypeError ? t("contact.error.offline") : (error as Error).message,
      });
    }
  }

  return (
    <section id="contact" aria-labelledby="contact-title" className="bg-gallery-white py-[90px] sm:py-32">
      <div className="page grid gap-14 lg:grid-cols-12 lg:gap-10">
        <Reveal stagger className="lg:col-span-6">
          <p className="text-kicker text-slate">{t("contact.kicker")}</p>
          <h2 id="contact-title" className="mt-3 max-w-[14ch] text-display">
            {t("contact.title")}
          </h2>
          <p className="mt-6 max-w-[40ch] text-lead text-pretty text-slate">{profile.availability}</p>
          <a
            href={`mailto:${profile.email}`}
            className="mt-10 inline-block break-all font-display text-[clamp(1.25rem,1rem+1vw,1.75rem)] font-semibold text-apple-blue hover:underline"
          >
            {profile.email}
          </a>
          <ul className="mt-8 border-t border-hairline-silver">
            {socials.map((social) => (
              <li key={social.url} className="border-b border-hairline-silver">
                <a
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-4 py-4 text-body"
                >
                  <span>{social.label}</span>
                  <span className="inline-flex items-center gap-1 text-slate transition-colors duration-300 group-hover:text-apple-blue">
                    {social.handle}
                    <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="lg:col-span-6" delay={120}>
          <form onSubmit={submit} className="rounded-card bg-studio-mist p-7 sm:p-10">
            <h3 className="text-subtitle">{t("contact.formTitle")}</h3>
            <p className="mt-2 text-body-sm text-slate">{t("contact.formNote")}</p>

            <div className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-control font-semibold">{t("contact.name")}</span>
                <input name="name" required maxLength={120} autoComplete="name" placeholder={t("contact.namePlaceholder")} className={`${FIELD} rounded-[980px]`} />
              </label>
              <label className="block">
                <span className="mb-2 block text-control font-semibold">{t("contact.email")}</span>
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={200}
                  autoComplete="email"
                  placeholder={t("contact.emailPlaceholder")}
                  className={`${FIELD} rounded-[980px]`}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-control font-semibold">{t("contact.message")}</span>
                <textarea
                  name="message"
                  required
                  maxLength={4000}
                  rows={5}
                  placeholder={t("contact.messagePlaceholder")}
                  className={`${FIELD} resize-y rounded-[20px] leading-[1.47]`}
                />
              </label>
              {/* Honeypot for bots; hidden from people and assistive tech. */}
              <input name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={status.state === "sending"}
                className="rounded-full bg-pricing-blue px-6 py-3 text-body-sm text-white transition-colors duration-300 hover:bg-[#0077ed] disabled:opacity-60"
              >
                {status.state === "sending" ? t("contact.sending") : t("contact.send")}
              </button>
              <p aria-live="polite" className="text-body-sm">
                {status.state === "sent" && (
                  <span className="inline-flex items-center gap-1.5 text-ink">
                    <Check size={16} strokeWidth={2} className="text-[#1d8a4b]" /> {t("contact.sent")}
                  </span>
                )}
                {status.state === "error" && <span className="text-launch-orange">{status.message}</span>}
              </p>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
