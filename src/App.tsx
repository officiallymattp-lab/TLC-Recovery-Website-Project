import { useState, useEffect, useCallback } from 'react';
import { Header, type AppView } from './components/Header';
import { Hero } from './components/Hero';
import { TlcDifference } from './components/TlcDifference';
import { LifeAndStory } from './components/LifeAndStory';
import { IntakeApplication } from './components/IntakeApplication';
import { DonationExpansion } from './components/DonationExpansion';
import { FaqSection, SiteFooter } from './components/FaqAndFooter';
import { PhotoGallery } from './components/PhotoGallery';
import type { ApplyingAs, ResidenceChoice } from './types/intake';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('home');
  const [pendingScrollTarget, setPendingScrollTarget] = useState<string | null>(null);
  const [selectedPathway, setSelectedPathway] = useState<{
    value: ApplyingAs;
    nonce: number;
  } | null>(null);
  const [selectedResidence, setSelectedResidence] = useState<{
    value: Exclude<ResidenceChoice, ''>;
    nonce: number;
  } | null>(null);

  const scrollToSectionNow = useCallback((sectionId: string) => {
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  useEffect(() => {
    if (activeView === 'home' && pendingScrollTarget) {
      const target = pendingScrollTarget;
      setPendingScrollTarget(null);
      requestAnimationFrame(() => {
        scrollToSectionNow(target);
      });
    }
  }, [activeView, pendingScrollTarget, scrollToSectionNow]);

  const handleNavigateSection = useCallback(
    (sectionId: string) => {
      if (activeView !== 'home') {
        setPendingScrollTarget(sectionId);
        setActiveView('home');
      } else {
        scrollToSectionNow(sectionId);
      }
    },
    [activeView, scrollToSectionNow]
  );

  const handleOpenPhotos = useCallback(() => {
    setActiveView('photos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleBackToHome = useCallback(() => {
    setPendingScrollTarget('top');
    setActiveView('home');
  }, []);

  const handleSelectPathway = useCallback(
    (pathway: ApplyingAs) => {
      setSelectedPathway({ value: pathway, nonce: Date.now() });
      handleNavigateSection('apply');
    },
    [handleNavigateSection]
  );

  const handleSelectResidence = useCallback(
    (residence: Exclude<ResidenceChoice, ''>) => {
      setSelectedResidence({ value: residence, nonce: Date.now() });
      handleNavigateSection('apply');
    },
    [handleNavigateSection]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#24201E]">
      <Header
        activeView={activeView}
        onNavigateSection={handleNavigateSection}
        onOpenPhotos={handleOpenPhotos}
      />

      <main className="flex-1">
        {activeView === 'photos' ? (
          <PhotoGallery
            onBackToHome={handleBackToHome}
            onApplyOnline={() => handleNavigateSection('apply')}
          />
        ) : (
          <>
            <Hero onSelectPathway={handleSelectPathway} />
            <TlcDifference />
            <LifeAndStory
              onSelectResidence={handleSelectResidence}
              onOpenPhotos={handleOpenPhotos}
            />
            <IntakeApplication
              externalPathway={selectedPathway}
              externalResidence={selectedResidence}
            />
            <DonationExpansion />
            <FaqSection />
          </>
        )}
      </main>

      <SiteFooter
        onNavigateSection={handleNavigateSection}
        onOpenPhotos={handleOpenPhotos}
      />
    </div>
  );
}
