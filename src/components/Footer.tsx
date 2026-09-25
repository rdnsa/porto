import type { Profile, Social } from "../../shared/types";
import { NAV } from "../lib/nav";

export function Footer({ profile, socials }: { profile: Profile; socials: Social[] }) {
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
                {item.label}
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
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {profile.fullName}. Built on Cloudflare Pages, D1 &amp; R2.
          </p>
          <p>
            Font made from{" "}
            <a href="http://www.onlinewebfonts.com/fonts" target="_blank" rel="noreferrer" className="underline hover:text-ink">
              Web Fonts
            </a>{" "}
            is licensed by CC BY 4.0.
          </p>
        </div>
      </div>
    </footer>
  );
}
