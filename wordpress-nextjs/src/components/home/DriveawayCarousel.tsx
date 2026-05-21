"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import styles from "./DriveawaySection.module.scss";

export type DriveawayCarouselProps = {
  images: string[];
};

function imageAltFromUrl(url: string, index: number): string {
  try {
    const name = new URL(url).pathname.split("/").pop() ?? "";
    const base = decodeURIComponent(name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    if (base.trim()) return base.trim();
  } catch {
    /* ignore */
  }
  return `Happy driver gallery photo ${index + 1}`;
}

export default function DriveawayCarousel({ images }: DriveawayCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);

  const scrollBy = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-driveaway-card]");
    const gap = parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap || "16") || 16;
    const step = card ? card.offsetWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = regionRef.current;
    if (!el || images.length <= 1) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollBy(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollBy(1);
      }
    };

    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [scrollBy, images.length]);

  if (images.length === 0) return null;

  const showNav = images.length > 1;

  return (
    <div
      className={styles.carousel}
      ref={regionRef}
      tabIndex={0}
      role="region"
      aria-label="Happy drivers gallery"
    >
      {showNav ? (
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowPrev}`}
          onClick={() => scrollBy(-1)}
          aria-label="Previous photos"
        >
          <i className="bi bi-chevron-left" aria-hidden />
        </button>
      ) : null}

      <div
        className={styles.scroller}
        ref={scrollerRef}
        role="list"
        aria-label="Gallery photos"
      >
        {images.map((src, i) => (
          <article
            key={`${src}-${i}`}
            className={styles.card}
            data-driveaway-card
            role="listitem"
          >
            <div className={styles.cardImageWrap}>
              <Image
                src={src}
                alt={imageAltFromUrl(src, i)}
                fill
                sizes="(max-width: 575px) 72vw, (max-width: 991px) 28vw, 18vw"
                className={styles.cardImage}
                unoptimized
              />
            </div>
          </article>
        ))}
      </div>

      {showNav ? (
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowNext}`}
          onClick={() => scrollBy(1)}
          aria-label="Next photos"
        >
          <i className="bi bi-chevron-right" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
