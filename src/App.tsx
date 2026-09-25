import { useEffect, useState } from "react";
import { About } from "./components/About";
import { CaseStudy } from "./components/CaseStudy";
import { Contact } from "./components/Contact";
import { Education } from "./components/Education";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Impact } from "./components/Impact";
import { LocalNav } from "./components/LocalNav";
import { MenuButton, MobileMenu } from "./components/MobileMenu";
import { Ownership } from "./components/Ownership";
import { Journey } from "./components/Journey";
import { Work } from "./components/Work";
import { useCaseRoute } from "./lib/useCaseRoute";
import { usePortfolio } from "./lib/usePortfolio";

export default function App() {
  const portfolio = usePortfolio();
  const route = useCaseRoute();
  const [menuOpen, setMenuOpen] = useState(false);

  const project = portfolio?.projects.find((p) => p.slug === route.slug) ?? null;
  const caseOpen = project !== null;

  // Unknown /work/:slug (renamed or unpublished in D1): fall back to the home page.
  useEffect(() => {
    if (portfolio && route.slug && !project) route.close();
  }, [portfolio, route.slug, route.close, project]);

  if (!portfolio) return <div className="h-[100dvh] bg-studio-mist" />;

  const { profile, socials } = portfolio;
  const owner = `${profile.firstName} ${profile.lastName}`;

  return (
    <>
      <div inert={caseOpen}>
        <LocalNav name={owner} onMenu={() => setMenuOpen(true)} />
        <main>
          <Hero profile={profile} socials={socials} />
          <About profile={profile} />
          <Impact stats={portfolio.stats} />
          <Ownership skills={portfolio.skills} role={profile.role} tagline={profile.tagline} />
          <Work projects={portfolio.projects} onOpen={(slug) => route.open(slug)} />
          <Journey experience={portfolio.experience} />
          <Education
            education={portfolio.education}
            organizations={portfolio.organizations}
            certifications={portfolio.certifications}
          />
          <Contact profile={profile} socials={socials} />
        </main>
        <Footer profile={profile} socials={socials} />
      </div>

      <MenuButton open={menuOpen} onToggle={() => setMenuOpen((open) => !open)} inert={caseOpen} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} socials={socials} />

      <CaseStudy
        project={project}
        projects={portfolio.projects}
        owner={owner}
        onClose={route.close}
        onNavigate={(slug) => route.open(slug, { replace: true })}
      />
    </>
  );
}
