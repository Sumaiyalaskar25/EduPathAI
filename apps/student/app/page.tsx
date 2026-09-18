import type { Metadata } from "next";
import { LandingHeader } from "../components/landing/LandingHeader";
import { HeroSection } from "../components/landing/HeroSection";
import { FeatureCards } from "../components/landing/FeatureCards";
import { page5 } from "../components/landing/landing-theme";

export const metadata: Metadata = {
  title: "Intelligent Academic Mobility",
  description:
    "The National AI-driven engine for seamless credit transfer, alignment, and authentication across India's higher education ecosystem.",
};

export default function StudentLandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: page5.pageBg }}>
      <LandingHeader />
      <main>
        <HeroSection />
        <FeatureCards />
      </main>
    </div>
  );
}