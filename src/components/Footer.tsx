import { ArrowUp } from "lucide-react";
import type { Profile, Social } from "../../shared/types";
import { NAV } from "../lib/nav";
import { useT } from "../lib/prefs";

export function Footer({ profile, socials }: { profile: Profile; socials: Social[] }) {
  const t = useT();
  return (
    <footer className="bg-studio-mist py-10 text-control text-slate">
      <div className="page">
        <div className="flex flex-col gap-6 border-b border-hairline-silver pb-6 sm:flex-row sm:items-center sm:justify-between">
          <a href="#top" className="font-display text-nav-title text-ink">
            {profile.firstName} {profile.lastName}.
          </a>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors duration-300 hover:text-ink">
                {t(item.key)}
              </a>
            ))}
            {socials.map((social) => (
              <a
                key={social.url}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-300 hover:text-ink"
              >
                {social.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {profile.fullName}. {t("footer.rights")}
          </p>
          <a href="#top" className="inline-flex items-center gap-1 transition-colors duration-300 hover:text-ink">
            {t("footer.backToTop")} <ArrowUp size={14} strokeWidth={1.75} aria-hidden />
          </a>
        </div>
        {/* Helvetica Neue ME is CC BY 4.0: the credit has to stay on the page while index.html loads it. */}
        <p className="mt-3 text-[9px] leading-tight text-steel/70">
          Helvetica Neue ME by{" "}
          <a href="http://www.onlinewebfonts.com" target="_blank" rel="noreferrer" className="hover:text-ink hover:underline">
            OnlineWebFonts
          </a>
          , CC BY 4.0.
        </p>
      </div>
    </footer>
  );
}
