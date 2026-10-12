import { LandingHeader } from "@/components/landing-header";
import { IntelligenceDemo } from "@/components/landing/demo";
import { PublicChatbot } from "@/components/landing/public-chatbot";
import {
  AudienceSection,
  DifferentiationSection,
  EvidenceSection,
  FinalCtaSection,
  HeroSection,
  HowItWorksSection,
  LandingFooter,
  PlatformSection,
  PlanningReportSection,
  ProblemSection,
  PublicQuestionsSection,
  SolutionSection,
} from "@/components/landing/sections";

export function PublicLanding() {
  return (
    <>
      <main className="public-landing">
        <LandingHeader />
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <PlatformSection />
        <IntelligenceDemo />
        <EvidenceSection />
        <PlanningReportSection />
        <PublicQuestionsSection />
        <HowItWorksSection />
        <AudienceSection />
        <DifferentiationSection />
        <FinalCtaSection />
        <LandingFooter />
      </main>
      <PublicChatbot />
    </>
  );
}
