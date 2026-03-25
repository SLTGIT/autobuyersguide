"use client";

import { VehicleImage } from "@/types/vehicle";
import { useState } from "react";
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
  const [selectedImage, setSelectedImage] = useState(featuredImage);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const allImages = [
    { url: featuredImage, alt: title },
    ...galleryImages.map((img) => ({ url: img.large, alt: img.alt || title })),
  ].filter((img) => img.url);

  return (
    <div className="vehicle-gallery vehicle-gallery--vdp">
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
        aria-label="Open full size image"
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
      </div>

      {allImages.length > 1 && (
        <div className="vehicle-gallery__thumbs" role="tablist" aria-label="Gallery thumbnails">
          {allImages.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              role="tab"
              aria-selected={selectedImage === image.url}
              className={`vehicle-gallery__thumb ${selectedImage === image.url ? "is-active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(image.url);
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

      {lightboxOpen && selectedImage && (
        <div className="vehicle-gallery__lightbox" onClick={() => setLightboxOpen(false)} role="presentation">
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
            <div className="vehicle-gallery__lightbox-frame">
              <Image
                src={selectedImage}
                alt={title}
                width={1200}
                height={900}
                className="vehicle-gallery__lightbox-img"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
