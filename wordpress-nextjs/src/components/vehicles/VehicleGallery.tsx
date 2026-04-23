"use client";

import { VehicleImage } from "@/types/vehicle";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

const AUTOPLAY_INTERVAL_MS = 5000;
const PAUSE_AFTER_MANUAL_MS = 12000;
/** First N slots in the grid; remainder summarized on the count card (reference layout). */
const GRID_THUMB_MAX = 7;

function Chevron({ dir }: { dir: "prev" | "next" }) {
  const d = dir === "prev" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface VehicleGalleryProps {
  featuredImage: string;
  galleryImages: VehicleImage[];
  title: string;
}

export default function VehicleGallery({
  featuredImage,
  galleryImages,
  title,
}: VehicleGalleryProps) {
  const allImages = [
    { url: featuredImage, alt: title },
    ...galleryImages.map((img) => ({ url: img.large, alt: img.alt || title })),
  ].filter((img) => img.url);

  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const pointerInsideRef = useRef(false);
  const resumeAutoplayAtRef = useRef(0);

  const bumpManualPause = useCallback(() => {
    resumeAutoplayAtRef.current = Date.now() + PAUSE_AFTER_MANUAL_MS;
  }, []);

  const selectedImage = allImages[index]?.url ?? "";

  const showMorePhotosCard = allImages.length > GRID_THUMB_MAX;
  const gridPreviewImages = showMorePhotosCard
    ? allImages.slice(0, GRID_THUMB_MAX)
    : allImages;

  const go = useCallback(
    (dir: -1 | 1) => {
      if (allImages.length === 0) return;
      setIndex((i) => {
        const next = i + dir;
        if (next < 0) return allImages.length - 1;
        if (next >= allImages.length) return 0;
        return next;
      });
    },
    [allImages.length]
  );

  const goTo = useCallback((i: number) => {
    if (allImages.length === 0) return;
    const n = ((i % allImages.length) + allImages.length) % allImages.length;
    setIndex(n);
  }, [allImages.length]);

  useEffect(() => {
    if (allImages.length < 2 || lightboxOpen) return;

    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (pointerInsideRef.current) return;
      if (Date.now() < resumeAutoplayAtRef.current) return;
      go(1);
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [allImages.length, lightboxOpen, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === "Escape") {
          setLightboxOpen(false);
          return;
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          bumpManualPause();
          go(-1);
          return;
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          bumpManualPause();
          go(1);
          return;
        }
        return;
      }
      if (e.key === "ArrowLeft") {
        bumpManualPause();
        go(-1);
      }
      if (e.key === "ArrowRight") {
        bumpManualPause();
        go(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, lightboxOpen, bumpManualPause]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightboxOpen]);

  useEffect(() => {
    if (index >= allImages.length) setIndex(0);
  }, [allImages.length, index]);

  return (
    <div
      className="vehicle-gallery vehicle-gallery--vdp"
      onMouseEnter={() => {
        pointerInsideRef.current = true;
      }}
      onMouseLeave={() => {
        pointerInsideRef.current = false;
      }}
      onFocusCapture={() => {
        pointerInsideRef.current = true;
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          pointerInsideRef.current = false;
        }
      }}
    >
      <div className="vehicle-gallery__stage-wrap">
        <div
          className="vehicle-gallery__stage"
          onClick={() => setLightboxOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setLightboxOpen(true);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Open full-screen gallery"
        >
          {selectedImage ? (
            <Image
              key={selectedImage}
              src={selectedImage}
              alt={`${title} — photo ${index + 1} of ${allImages.length}`}
              fill
              className="vehicle-gallery__stage-img"
              sizes="(max-width: 991px) 100vw, 58vw"
              priority={index === 0}
            />
          ) : (
            <div className="vehicle-gallery__placeholder">
              <span>No image available</span>
            </div>
          )}

          <button
            type="button"
            className="vehicle-gallery__zoom"
            aria-label="Open full-screen preview"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(true);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <path d="M11 8v6M8 11h6" />
            </svg>
          </button>

          {allImages.length > 1 ? (
            <>
              <button
                type="button"
                className="vehicle-gallery__arrow vehicle-gallery__arrow--prev"
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation();
                  bumpManualPause();
                  go(-1);
                }}
              >
                <Chevron dir="prev" />
              </button>
              <button
                type="button"
                className="vehicle-gallery__arrow vehicle-gallery__arrow--next"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  bumpManualPause();
                  go(1);
                }}
              >
                <Chevron dir="next" />
              </button>
            </>
          ) : null}

          {allImages.length > 1 ? (
            <div
              className="vehicle-gallery__dots"
              role="tablist"
              aria-label="Slide indicators"
              onClick={(e) => e.stopPropagation()}
            >
              {allImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={index === i}
                  aria-label={`Photo ${i + 1} of ${allImages.length}`}
                  className={`vehicle-gallery__dot ${index === i ? "is-active" : ""}`}
                  onClick={() => {
                    bumpManualPause();
                    goTo(i);
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {allImages.length > 1 && (
        <div
          className="vehicle-gallery__thumb-grid"
          role="tablist"
          aria-label="Gallery thumbnails"
        >
          {gridPreviewImages.map((image, i) => (
            <button
              key={`${image.url}-${i}`}
              type="button"
              role="tab"
              aria-selected={index === i}
              className={`vehicle-gallery__grid-thumb ${index === i ? "is-active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                bumpManualPause();
                goTo(i);
              }}
            >
              <span className="vehicle-gallery__grid-thumb-frame">
                <Image
                  src={image.url}
                  alt=""
                  fill
                  className="vehicle-gallery__grid-thumb-img"
                  sizes="(max-width: 576px) 45vw, 22vw"
                />
              </span>
            </button>
          ))}
          {showMorePhotosCard ? (
            <div
              className="vehicle-gallery__grid-more"
              aria-label={`${allImages.length} photos in this listing`}
            >
              <span className="vehicle-gallery__grid-more-text">
                {allImages.length} photos listed
              </span>
            </div>
          ) : null}
        </div>
      )}

      {lightboxOpen && selectedImage
        ? createPortal(
            <div
              className="vehicle-gallery__lightbox"
              onClick={() => setLightboxOpen(false)}
              role="presentation"
            >
              <div
                className="vehicle-gallery__lightbox-inner"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={`Gallery: ${title}`}
              >
                <header className="vehicle-gallery__lightbox-toolbar">
                  <div className="vehicle-gallery__lightbox-toolbar-text">
                    <p className="vehicle-gallery__lightbox-title">{title}</p>
                    <p className="vehicle-gallery__lightbox-counter" aria-live="polite">
                      {index + 1} / {allImages.length}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="vehicle-gallery__lightbox-close"
                    onClick={() => setLightboxOpen(false)}
                    aria-label="Close gallery"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </header>

                <div className="vehicle-gallery__lightbox-stage">
                  {allImages.length > 1 ? (
                    <button
                      type="button"
                      className="vehicle-gallery__lightbox-arrow vehicle-gallery__lightbox-arrow--prev"
                      aria-label="Previous image"
                      onClick={(e) => {
                        e.stopPropagation();
                        bumpManualPause();
                        go(-1);
                      }}
                    >
                      <Chevron dir="prev" />
                    </button>
                  ) : null}
                  <div className="vehicle-gallery__lightbox-frame">
                    <Image
                      key={`lb-${selectedImage}`}
                      src={selectedImage}
                      alt={`${title} — ${index + 1} of ${allImages.length}`}
                      width={1200}
                      height={900}
                      className="vehicle-gallery__lightbox-img"
                    />
                  </div>
                  {allImages.length > 1 ? (
                    <button
                      type="button"
                      className="vehicle-gallery__lightbox-arrow vehicle-gallery__lightbox-arrow--next"
                      aria-label="Next image"
                      onClick={(e) => {
                        e.stopPropagation();
                        bumpManualPause();
                        go(1);
                      }}
                    >
                      <Chevron dir="next" />
                    </button>
                  ) : null}
                </div>

                {allImages.length > 1 ? (
                  <div
                    className="vehicle-gallery__lightbox-thumbs"
                    role="tablist"
                    aria-label="Select photo"
                  >
                    {allImages.map((image, i) => (
                      <button
                        key={`lb-t-${image.url}-${i}`}
                        type="button"
                        className={`vehicle-gallery__lightbox-thumb ${index === i ? "is-active" : ""}`}
                        aria-selected={index === i}
                        aria-label={`Photo ${i + 1}`}
                        onClick={() => {
                          bumpManualPause();
                          goTo(i);
                        }}
                      >
                        <Image
                          src={image.url}
                          alt=""
                          width={112}
                          height={84}
                          className="vehicle-gallery__lightbox-thumb-img"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
