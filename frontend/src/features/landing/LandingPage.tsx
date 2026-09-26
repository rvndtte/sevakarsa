"use client";

import { useSession } from "@/hooks/useDatabase";
import { Hero } from "./Hero";
import { BenefitSection, CtaAndFooter, FaqSection, ImpactSection } from "./InfoSections";
import { FloatingNav } from "./Navs";
import { ProblemSection } from "./ProblemSection";
import { StorySection } from "./StorySection";
import { StoryWave } from "./StoryWave";
import { useLandingScroll } from "./useLandingScroll";

export function LandingPage() {
  const { me } = useSession();
  const { progressBar, floatingNav, activeId } = useLandingScroll();

  return (
    <div className="min-h-screen overflow-x-clip bg-forest-900 text-ondark">
      <div
        ref={progressBar}
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-120 h-[3px] origin-left scale-x-0 bg-linear-to-r from-leaf-500 to-lime"
      />
      <FloatingNav me={me} show={floatingNav} activeId={activeId} />
      <Hero me={me} />
      <ProblemSection />
      <StorySection />
      <StoryWave />
      <ImpactSection />
      <BenefitSection />
      <FaqSection />
      <CtaAndFooter />
    </div>
  );
}
