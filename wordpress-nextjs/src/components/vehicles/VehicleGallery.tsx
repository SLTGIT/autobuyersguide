"use client";

import { VehicleImage } from "@/types/vehicle";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

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

  const selectedImage = allImages[index]?.url ?? "";

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxOpen) {
        if (e.key === "Escape") {
          setLightboxOpen(false);
          return;
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(-1);
          return;
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(1);
          return;
        }
        return;
      }
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lightboxOpen]);

  return (
    <div className="vehicle-gallery vehicle-gallery--vdp">
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
          aria-label="View larger image"
        >
          {selectedImage ? (
            <Image
              src={selectedImage}
              alt={title}
              fill
              className="vehicle-gallery__stage-img"
              sizes="(max-width: 991px) 100vw, 58vw"
              priority
            />
          ) : (
            <div className="vehicle-gallery__placeholder">
              <span>No image available</span>
            </div>
          )}

          <button
            type="button"
            className="vehicle-gallery__zoom"
            aria-label="Zoom image"
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
                  go(-1);
                }}
              >
                ‹
              </button>
              <button
                type="button"
                className="vehicle-gallery__arrow vehicle-gallery__arrow--next"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
              >
                ›
              </button>
            </>
          ) : null}
        </div>
      </div>

      {allImages.length > 1 && (
        <div
          className="vehicle-gallery__thumbs"
          role="tablist"
          aria-label="Gallery thumbnails"
        >
          {allImages.map((image, i) => (
            <button
              key={`${image.url}-${i}`}
              type="button"
              role="tab"
              aria-selected={index === i}
              className={`vehicle-gallery__thumb ${index === i ? "is-active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
            >
              <Image
                src={image.url}
                alt=""
                fill
                className="vehicle-gallery__thumb-img"
                sizes="96px"
              />
            </button>
          ))}
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
                aria-label="Image preview"
              >
                <button
                  type="button"
                  className="vehicle-gallery__lightbox-close"
                  onClick={() => setLightboxOpen(false)}
                  aria-label="Close"
                >
                  ×
                </button>
                <div className="vehicle-gallery__lightbox-stage">
                  {allImages.length > 1 ? (
                    <button
                      type="button"
                      className="vehicle-gallery__lightbox-arrow vehicle-gallery__lightbox-arrow--prev"
                      aria-label="Previous image"
                      onClick={(e) => {
                        e.stopPropagation();
                        go(-1);
                      }}
                    >
                      ‹
                    </button>
                  ) : null}
                  <div className="vehicle-gallery__lightbox-frame">
                    <Image
                      src={selectedImage}
                      alt={title}
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
                        go(1);
                      }}
                    >
                      ›
                    </button>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
