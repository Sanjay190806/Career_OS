import React from 'react';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingFeatureGrid } from '../components/landing/LandingFeatureGrid';
import { LandingAISpotlight } from '../components/landing/LandingAISpotlight';
import { LandingModulesShowcase } from '../components/landing/LandingModulesShowcase';
import { LandingTechStack } from '../components/landing/LandingTechStack';
import { LandingArchitecture } from '../components/landing/LandingArchitecture';
import { LandingCTA } from '../components/landing/LandingCTA';

export const LandingPage: React.FC = () => {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      <LandingHero />
      <LandingFeatureGrid />
      <LandingAISpotlight />
      <LandingModulesShowcase />
      <div className="grid gap-4 xl:grid-cols-2">
        <LandingTechStack />
        <LandingArchitecture />
      </div>
      <LandingCTA />
    </div>
  );
};
