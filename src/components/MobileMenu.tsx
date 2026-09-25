import { X } from "lucide-react";
import { useRef } from "react";
import type { Social } from "../../shared/types";
import { useBodyScrollLock } from "../lib/useBodyScrollLock";
import { useDialog } from "../lib/useDialog";
import { NAV } from "../lib/nav";
import { BluePill } from "./ui";

const EASE = "ease-[cubic-bezier(0.76,0,0.24,1)]";

/** Three bars that morph into an X. Sits above the drawer (z-50), aligned with the hero header. */
export function MenuButton({ open, onToggle, inert }: { open: boolean; onToggle: () => void; inert?: boolean }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      inert={inert}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      aria-controls="mobile-menu"
      className="anim-fade-up absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center sm:hidden short:!flex"
      style={{ animationDelay: "900ms" }}
    >
      <span className="relative block h-4 w-6">
        <span
          className={`absolute left-0 top-0 h-[1.5px] w-full bg-ink transition-transform duration-500 ${EASE} ${open ? "translate-y-[7.25px] rotate-45" : ""}`}
        />
        <span
          className={`absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 bg-ink transition-opacity duration-300 ${open ? "opacity-0" : ""}`}
        />
        <span
          className={`absolute bottom-0 left-0 h-[1.5px] w-full bg-ink transition-transform duration-500 ${EASE} ${open ? "-translate-y-[7.25px] -rotate-45" : ""}`}
        />
      </span>
    </button>
  );
}

const stagger = (open: boolean, ms: number) => ({ transitionDelay: open ? `${ms}ms` : "0ms" });

export function MobileMenu({ open, onClose, socials }: { open: boolean; onClose: () => void; socials: Social[] }) {
  const panel = useRef<HTMLDivElement>(null);
  useBodyScrollLock(open);
  useDialog(panel, open, onClose);

  const shown = open ? "translate-y-0 opacity-100" : "";
  return (
    <div id="mobile-menu" className="sm:hidden short:!block" inert={!open}>
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`fixed inset-y-0 right-0 z-40 flex w-[80%] max-w-sm flex-col border-l border-control-gray overflow-y-auto bg-paper-frost/95 px-8 py-10 short:py-6 backdrop-blur-xl transition-transform duration-[600ms] ${EASE} ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          data-autofocus
          className={`absolute right-6 top-6 text-ink transition-[transform,opacity] duration-500 ${open ? "rotate-0 opacity-100 delay-300" : "rotate-90 opacity-0"}`}
        >
          <X size={26} strokeWidth={1.5} />
        </button>

        <p
          className={`mt-14 short:mt-8 text-control text-slate transition-[transform,opacity] duration-700 ease-out-quint ${shown || "translate-y-4 opacity-0"}`}
          style={stagger(open, 250)}
        >
          Site index
        </p>
        <nav className="mt-4 flex flex-col gap-2" aria-label="Site index">
          {NAV.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`font-display text-4xl font-semibold tracking-[-0.02em] transition-[transform,opacity] duration-700 ease-out-quint ${shown || "translate-y-6 opacity-0"}`}
              style={stagger(open, 300 + i * 80)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto pt-10">
          <p
            className={`text-control text-slate transition-[transform,opacity] duration-700 ease-out-quint ${shown || "translate-y-4 opacity-0"}`}
            style={stagger(open, 500)}
          >
            Find me
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {socials.map((social, i) => (
              <a
                key={social.url}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className={`transition-[transform,opacity] duration-700 ease-out-quint ${shown || "translate-y-4 opacity-0"}`}
                style={stagger(open, 550 + i * 60)}
              >
                {social.label}
              </a>
            ))}
          </div>
          <BluePill
            href="#contact"
            onClick={onClose}
            className={`mt-8 px-5 py-2 text-sm transition-[transform,opacity,background-color] duration-700 ease-out-quint ${shown || "translate-y-4 opacity-0"}`}
            style={stagger(open, 550 + socials.length * 60)}
          >
            Let&rsquo;s talk
          </BluePill>
        </div>
      </div>
    </div>
  );
}
