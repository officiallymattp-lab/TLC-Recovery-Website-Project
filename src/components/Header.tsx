import { useState, useEffect } from 'react';
import { Phone, Menu, X, ArrowRight } from 'lucide-react';

export type AppView = 'home' | 'photos';

interface HeaderProps {
  activeView: AppView;
  onNavigateSection: (sectionId: string) => void;
  onOpenPhotos: () => void;
}

interface NavItem {
  label: string;
  mobileLabel?: string;
  type: 'section' | 'photos';
  target: string;
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { label: 'The TLC Difference', type: 'section', target: 'difference' },
  { label: 'Our Homes', type: 'section', target: 'our-homes' },
  { label: 'Life & Community', type: 'section', target: 'life-at-tlc' },
  { label: 'Donate & Expand', type: 'section', target: 'support' },
  { label: 'Photos', type: 'photos', target: 'photos' },
  { label: 'FAQ', mobileLabel: 'Common Questions (FAQ)', type: 'section', target: 'faq' },
];

export function Header({ activeView, onNavigateSection, onOpenPhotos }: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleItemClick = (item: NavItem) => {
    setDrawerOpen(false);
    if (item.type === 'photos') {
      onOpenPhotos();
    } else {
      onNavigateSection(item.target);
    }
  };

  const handleSectionLinkClick = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    setDrawerOpen(false);
    onNavigateSection(sectionId);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top 24/7 Crisis & Direct Call Bar */}
      <div className="bg-[#2C4A3E] text-[#FAF7F2] border-b border-[#FAF7F2]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <p className="truncate font-medium tracking-wide text-[#E6EFEA]">
            Open 24/7 in North Alabama <span aria-hidden="true" className="mx-1.5 text-[#C98A3A]">•</span> Women&apos;s &amp; Men&apos;s Sober Living <span aria-hidden="true" className="hidden md:inline mx-1.5 text-[#C98A3A]">•</span> <span className="hidden md:inline">You don&apos;t have to walk this alone</span>
          </p>
          <a
            href="tel:+12564450553"
            className="inline-flex items-center gap-1.5 font-semibold text-[#FAF7F2] hover:text-[#E6EFEA] transition-colors whitespace-nowrap shrink-0 underline decoration-[#C98A3A] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C98A3A] rounded"
          >
            <Phone className="w-3.5 h-3.5 text-[#C98A3A]" aria-hidden="true" />
            <span>Call Crystal: (256) 445-0553</span>
          </a>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E4DDD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4 xl:gap-8">
          {/* Brand Lockup */}
          <a
            href="#top"
            onClick={(e) => handleSectionLinkClick(e, 'top')}
            className="flex flex-col shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] rounded"
          >
            <span className="font-serif text-lg sm:text-xl font-semibold tracking-tight text-[#24201E] whitespace-nowrap leading-tight group-hover:text-[#2C4A3E] transition-colors">
              TLC Recovery House
            </span>
            <span className="hidden sm:block text-[11px] font-medium text-[#5B7B6D] whitespace-nowrap leading-tight">
              We Do Recover Together — Never Alone
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-4 xl:gap-6">
            {NAV_ITEMS.map((item) => {
              const isPhotosActive = item.type === 'photos' && activeView === 'photos';
              return (
                <button
                  key={item.target}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  aria-current={isPhotosActive ? 'page' : undefined}
                  className={`text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1 border-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] rounded-sm ${
                    isPhotosActive
                      ? 'text-[#2C4A3E] font-semibold border-[#B85D43]'
                      : 'text-[#57514D] border-transparent hover:text-[#2C4A3E] hover:border-[#5B7B6D]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Desktop Primary CTA & Mobile Drawer Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#apply"
              onClick={(e) => handleSectionLinkClick(e, 'apply')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#B85D43] hover:bg-[#9E4B33] text-[#FAF7F2] text-sm font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B85D43]"
            >
              <span>Apply for Residency</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={drawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#E4DDD1] bg-[#FAF7F2] text-[#24201E] hover:bg-[#F2ECE1] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E]"
            >
              {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {drawerOpen && (
          <div
            id="mobile-nav-drawer"
            className="lg:hidden border-t border-[#E4DDD1] bg-[#FAF7F2] px-4 py-5 space-y-2 shadow-lg"
          >
            <p className="text-xs font-medium text-[#5B7B6D] pb-2 border-b border-[#E4DDD1]">
              We Do Recover Together — Never Alone
            </p>
            <nav aria-label="Mobile navigation" className="flex flex-col space-y-1">
              {activeView === 'photos' && (
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    onNavigateSection('top');
                  }}
                  className="text-left px-3 py-3 rounded-lg text-base font-medium text-[#24201E] hover:bg-[#F2ECE1] transition-colors"
                >
                  Home
                </button>
              )}
              {NAV_ITEMS.map((item) => {
                const isPhotosActive = item.type === 'photos' && activeView === 'photos';
                return (
                  <button
                    key={item.target}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    aria-current={isPhotosActive ? 'page' : undefined}
                    className={`text-left px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                      isPhotosActive
                        ? 'bg-[#E6EFEA] text-[#2C4A3E] font-semibold'
                        : 'text-[#24201E] hover:bg-[#F2ECE1]'
                    }`}
                  >
                    {item.mobileLabel ?? item.label}
                  </button>
                );
              })}
            </nav>
            <div className="pt-3 border-t border-[#E4DDD1] flex flex-col gap-2.5">
              <a
                href="#apply"
                onClick={(e) => handleSectionLinkClick(e, 'apply')}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#B85D43] hover:bg-[#9E4B33] text-[#FAF7F2] text-sm font-semibold transition-colors"
              >
                <span>Apply for Residency</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="tel:+12564450553"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-[#2C4A3E] text-[#2C4A3E] text-sm font-semibold hover:bg-[#E6EFEA] transition-colors"
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>Call Crystal 24/7: (256) 445-0553</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
