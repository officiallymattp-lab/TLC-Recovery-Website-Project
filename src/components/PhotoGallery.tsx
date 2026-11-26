import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Camera,
  Maximize2,
} from 'lucide-react';

interface GalleryPhoto {
  id: string;
  index: number;
  src: string | null;
  isPlaceholder: boolean;
  surfaceTone: string;
}

const SURFACE_TONES = [
  'from-[#E6EFEA] via-[#F2ECE1] to-[#E4DDD1]/70',
  'from-[#F2ECE1] via-[#FAF7F2] to-[#E6EFEA]/80',
  'from-[#E6EFEA]/85 via-[#FAF7F2] to-[#F2ECE1]',
  'from-[#2C4A3E]/10 via-[#E6EFEA] to-[#F2ECE1]',
  'from-[#F2ECE1] via-[#E6EFEA]/70 to-[#E4DDD1]/60',
  'from-[#E6EFEA]/80 via-[#F2ECE1] to-[#C98A3A]/15',
];

/**
 * Automatically imports every .jpg, .jpeg, .png, or .webp image (case-insensitive)
 * placed inside src/assets/photos/ (including nested folders) with zero renaming needed.
 */
const importedPhotoModules = import.meta.glob<{ default: string }>(
  '../assets/photos/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
  { eager: true }
);

const detectedPhotos: GalleryPhoto[] = Object.entries(importedPhotoModules)
  .sort(([pathA], [pathB]) =>
    pathA.localeCompare(pathB, undefined, { numeric: true, sensitivity: 'base' })
  )
  .map(([filePath, mod], idx) => ({
    id: filePath,
    index: idx + 1,
    src: mod.default,
    isPlaceholder: false,
    surfaceTone: SURFACE_TONES[idx % SURFACE_TONES.length],
  }));

const PLACEHOLDER_PHOTOS: GalleryPhoto[] = Array.from({ length: 6 }, (_, idx) => ({
  id: `placeholder-${idx + 1}`,
  index: idx + 1,
  src: null,
  isPlaceholder: true,
  surfaceTone: SURFACE_TONES[idx % SURFACE_TONES.length],
}));

const GALLERY_PHOTOS: ReadonlyArray<GalleryPhoto> =
  detectedPhotos.length > 0 ? detectedPhotos : PLACEHOLDER_PHOTOS;

interface PhotoGalleryProps {
  onBackToHome: () => void;
  onApplyOnline: () => void;
}

export function PhotoGallery({ onBackToHome, onApplyOnline }: PhotoGalleryProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const activePhoto =
    lightboxIndex !== null && GALLERY_PHOTOS[lightboxIndex]
      ? GALLERY_PHOTOS[lightboxIndex]
      : null;

  const markImageFailed = useCallback((id: string) => {
    setFailedImages((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const handlePrevPhoto = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || GALLERY_PHOTOS.length === 0) return null;
      return (prev - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length;
    });
  }, []);

  const handleNextPhoto = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || GALLERY_PHOTOS.length === 0) return null;
      return (prev + 1) % GALLERY_PHOTOS.length;
    });
  }, []);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseLightbox();
      if (e.key === 'ArrowLeft') handlePrevPhoto();
      if (e.key === 'ArrowRight') handleNextPhoto();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, handleCloseLightbox, handlePrevPhoto, handleNextPhoto]);

  return (
    <div className="bg-[#FAF7F2] min-h-[70vh]">
      {/* Gallery Header */}
      <section className="pt-8 pb-10 sm:pt-12 sm:pb-12 border-b border-[#E4DDD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2C4A3E] hover:text-[#B85D43] transition-colors py-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A3E] rounded"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Home</span>
          </button>

          <div className="mt-6 max-w-3xl">
            <h1 className="font-serif text-[clamp(2rem,3.8vw,3.15rem)] font-semibold leading-[1.15] tracking-tight text-[#24201E]">
              All Photos — Life at TLC Recovery House
            </h1>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#57514D]">
              Moments from our homes, fellowship days, and recovery community in North Alabama.
            </p>
          </div>
        </div>
      </section>

      {/* Clean 3-Column Responsive Photo Grid */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
            {GALLERY_PHOTOS.map((photo, index) => {
              const showImage = Boolean(photo.src) && !failedImages[photo.id];
              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`View photo ${photo.index} full size`}
                  className="group relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-[#E4DDD1] bg-[#F2ECE1] text-left shadow-[0_2px_14px_rgba(36,32,30,0.03)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2C4A3E]"
                >
                  {showImage && photo.src ? (
                    <img
                      src={photo.src}
                      alt={`Life at TLC Recovery House — photo ${photo.index}`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={() => markImageFailed(photo.id)}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${photo.surfaceTone} p-6 flex flex-col items-center justify-center text-center`}
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#FAF7F2]/90 border border-[#E4DDD1] flex items-center justify-center text-[#2C4A3E] mb-3">
                        <Camera className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <p className="font-serif text-sm font-semibold text-[#24201E]">
                        Photo Preview {photo.index}
                      </p>
                      <p className="mt-1.5 font-mono text-[11px] text-[#5B7B6D] bg-[#FAF7F2]/85 px-2.5 py-1 rounded-md border border-[#E4DDD1]">
                        src/assets/photos/
                      </p>
                    </div>
                  )}

                  {/* Subtle enlarge affordance on hover */}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#24201E]/75 text-[#FAF7F2] text-xs font-medium opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>View</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Warm Call-to-Action Strip */}
      <section className="bg-[#2C4A3E] text-[#FAF7F2] py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-wide text-[#C98A3A]">
              Women&rsquo;s &amp; Men&rsquo;s Sober Living · Open 24/7
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-[#FAF7F2]">
              Ready to take the next step?
            </h2>
            <p className="mt-2.5 text-base text-[#E6EFEA] leading-relaxed">
              Whether you&rsquo;re reaching out for yourself or someone you love, Crystal is here to talk through open beds in Somerville and Hartselle.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={onApplyOnline}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#B85D43] hover:bg-[#9E4B33] text-[#FAF7F2] text-base font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2C4A3E] focus-visible:ring-[#C98A3A]"
            >
              <span>Apply Online</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <a
              href="tel:+12564450553"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-[#FAF7F2]/30 hover:bg-[#FAF7F2]/10 text-[#FAF7F2] text-base font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C98A3A]"
            >
              <Phone className="w-4 h-4 text-[#C98A3A]" aria-hidden="true" />
              <span>Call (256) 445-0553</span>
            </a>
          </div>
        </div>
      </section>

      {/* Full-Screen Dark-Backdrop Lightbox Modal with Left & Right Side Navigation */}
      {activePhoto && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${lightboxIndex + 1} of ${GALLERY_PHOTOS.length}`}
          onClick={handleCloseLightbox}
          className="fixed inset-0 z-50 bg-[#181513]/92 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-8"
        >
          {/* Top-Left Counter & Top-Right Close Button */}
          <div className="fixed top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 z-20 flex items-center justify-between pointer-events-none">
            <span className="pointer-events-auto text-sm font-medium text-[#FAF7F2]/90 tabular-nums tracking-wide bg-[#24201E]/70 px-3.5 py-1.5 rounded-lg border border-[#FAF7F2]/15">
              Photo {lightboxIndex + 1} of {GALLERY_PHOTOS.length}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCloseLightbox();
              }}
              aria-label="Close photo viewer"
              className="pointer-events-auto inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[#24201E] shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C98A3A]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Left Previous Arrow */}
          {GALLERY_PHOTOS.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevPhoto();
              }}
              aria-label="Previous photo"
              className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FAF7F2]/95 hover:bg-[#FAF7F2] text-[#24201E] border border-[#E4DDD1] shadow-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C98A3A]"
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          )}

          {/* Centered Enlarged Photo Frame */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 flex items-center justify-center max-w-[calc(100vw-7rem)] sm:max-w-[calc(100vw-11rem)] max-h-[80vh]"
          >
            {activePhoto.src && !failedImages[activePhoto.id] ? (
              <img
                src={activePhoto.src}
                alt={`Life at TLC Recovery House — photo ${activePhoto.index}`}
                referrerPolicy="no-referrer"
                onError={() => markImageFailed(activePhoto.id)}
                className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-2xl shadow-2xl border border-[#FAF7F2]/15 bg-[#24201E]"
              />
            ) : (
              <div
                className={`w-[min(80vw,780px)] aspect-[4/3] max-h-[75vh] rounded-2xl border border-[#E4DDD1] bg-gradient-to-br ${activePhoto.surfaceTone} p-8 flex flex-col items-center justify-center text-center shadow-2xl`}
              >
                <div className="w-16 h-16 rounded-2xl bg-[#FAF7F2] border border-[#E4DDD1] flex items-center justify-center text-[#2C4A3E] mb-4 shadow-sm">
                  <Camera className="w-8 h-8" aria-hidden="true" />
                </div>
                <p className="font-serif text-xl sm:text-2xl font-semibold text-[#24201E]">
                  Photo Preview {activePhoto.index}
                </p>
                <p className="mt-2 text-sm text-[#57514D] max-w-md">
                  Drop any <code className="font-mono text-[#2C4A3E]">.jpg</code>,{' '}
                  <code className="font-mono text-[#2C4A3E]">.jpeg</code>,{' '}
                  <code className="font-mono text-[#2C4A3E]">.png</code>, or{' '}
                  <code className="font-mono text-[#2C4A3E]">.webp</code> files into{' '}
                  <code className="font-mono font-semibold text-[#2C4A3E]">src/assets/photos/</code>{' '}
                  and they will load here automatically.
                </p>
              </div>
            )}
          </div>

          {/* Right Next Arrow */}
          {GALLERY_PHOTOS.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextPhoto();
              }}
              aria-label="Next photo"
              className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FAF7F2]/95 hover:bg-[#FAF7F2] text-[#24201E] border border-[#E4DDD1] shadow-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C98A3A]"
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
