"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GoogleRatingStars from "@/components/GoogleRatingStars";
import { stripLeadingStarEmojis, type GoogleReviewItem } from "@/lib/google-reviews";
import styles from "./GoogleReviewsSlider.module.scss";

export type GoogleReviewsSliderProps = {
  reviews: GoogleReviewItem[];
  averageScore: number;
  reviewCount: number | null;
  mapsUrl: string;
  fallbackQuote: string;
  fallbackAuthor: string;
};

function formatReviewDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-AU", { year: "numeric", month: "short", day: "numeric" });
}

function reviewBody(r: GoogleReviewItem): string {
  if (!r.text) return "";
  return stripLeadingStarEmojis(r.text).trim();
}

const REVIEWS_PER_SLIDE = 2;

function chunkReviews(items: GoogleReviewItem[], size: number): GoogleReviewItem[][] {
  const pages: GoogleReviewItem[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

function ReviewCard({
  r,
  averageScore,
}: {
  r: GoogleReviewItem;
  averageScore: number;
}) {
  const b = reviewBody(r);
  const rs = Number.parseFloat(r.rating);
  const sc = Number.isFinite(rs) ? rs : averageScore;
  return (
    <article className={styles.reviewCard}>
      <span className={styles.cardQuoteMark} aria-hidden>
        &ldquo;
      </span>
      <blockquote className={styles.quote} title={b ? b : undefined}>
        {b ? (
          <>
            <span className="visually-hidden">Quote: </span>
            {b}
          </>
        ) : (
          <span className={styles.quoteEmpty}>No written review for this rating.</span>
        )}
      </blockquote>
      <footer className={styles.authorBar}>
        {r.user_photo ? (
          <Image
            src={r.user_photo}
            alt="Google Reviewer's Profile Picture"
            width={48}
            height={48}
            className={styles.avatar}
            unoptimized
          />
        ) : (
          <div className={styles.avatarFallback} aria-hidden>
            <i className="bi bi-person-fill" />
          </div>
        )}
        <div className={styles.authorMetaBlock}>
          <cite className={styles.authorName}>{r.user}</cite>
          <div className={styles.authorSub}>
            <GoogleRatingStars score={sc} className={styles.authorStars} />
            {r.date ? <time className={styles.date}>{formatReviewDate(r.date)}</time> : null}
          </div>
        </div>
      </footer>
    </article>
  );
}

export default function GoogleReviewsSlider({
  reviews,
  averageScore,
  reviewCount,
  mapsUrl,
  fallbackQuote,
  fallbackAuthor,
}: GoogleReviewsSliderProps) {
  const slides = useMemo((): GoogleReviewItem[] => {
    if (reviews.length > 0) return reviews;
    return [
      {
        user: fallbackAuthor,
        user_photo: "",
        text: fallbackQuote,
        rating: String(averageScore),
        date: "",
      },
    ];
  }, [reviews, fallbackAuthor, fallbackQuote, averageScore]);

  const pagePairs = useMemo(
    () => chunkReviews(slides, REVIEWS_PER_SLIDE),
    [slides],
  );

  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const regionRef = useRef<HTMLElement | null>(null);

  const pageCount = pagePairs.length;
  const safePageIndex =
    pageCount > 0 ? (((index % pageCount) + pageCount) % pageCount) : 0;

  const go = useCallback(
    (dir: -1 | 1) => {
      if (pageCount <= 1) return;
      setIndex((i) => {
        const next = i + dir;
        if (next < 0) return pageCount - 1;
        if (next >= pageCount) return 0;
        return next;
      });
    },
    [pageCount],
  );

  useEffect(() => {
    const el = regionRef.current;
    if (!el) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };

    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [go]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const d = touchStartX.current - endX;
    touchStartX.current = null;
    if (d > 56) go(1);
    else if (d < -56) go(-1);
  };

  return (
    <section className={styles.section} ref={regionRef} tabIndex={0} aria-label="Customer reviews from Google">
      <div className="container">
        <header className={styles.headerRow}>
          <div className={styles.headerTitles}>
            {/* <p className={styles.kicker}>Customer Reviews</p> */}
            <h2 className={`display-6 fw-bold cs-title-tight ${styles.title}`}>What Our Customers Say</h2>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.aggregate}>
              <GoogleRatingStars score={averageScore} />
              {reviewCount != null ? (
                <p className={styles.aggregateText}>
                  <span className={styles.aggregateScore}>{averageScore.toFixed(1)}</span>
                  <span className={styles.aggregateSep}>/</span> 5
                  <span className={styles.aggregateDot}>·</span>
                  {reviewCount} Google review{reviewCount === 1 ? "" : "s"}
                </p>
              ) : (
                <p className={styles.aggregateText}>Google Business Profile</p>
              )}
            </div>
            <div className={styles.nav}>
              <button type="button" className={styles.navBtn} onClick={() => go(-1)} aria-label="Previous reviews">
                <i className="bi bi-chevron-left fs-5" aria-hidden />
              </button>
              <button type="button" className={styles.navBtn} onClick={() => go(1)} aria-label="Next reviews">
                <i className="bi bi-chevron-right fs-5" aria-hidden />
              </button>
            </div>
          </div>
        </header>

        <div
          className={styles.testimonialShell}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          role="group"
          aria-roledescription="carousel"
          aria-label={`Reviews page ${safePageIndex + 1} of ${pageCount}`}
        >
          <div className={styles.track} style={{ transform: `translateX(-${safePageIndex * 100}%)` }}>
            {pagePairs.map((pair, pageIdx) => (
              <div
                key={`slide-${pageIdx}-${pair.map((r) => `${r.user}-${r.date}`).join("|")}`}
                className={styles.slide}
                aria-hidden={pageIdx !== safePageIndex}
              >
                <div className={styles.slideGrid}>
                  {pair.map((r, j) => (
                    <ReviewCard
                      key={`${pageIdx}-${j}-${r.user}-${r.date}`}
                      r={r}
                      averageScore={averageScore}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {pageCount > 1 ? (
          <div className={styles.dotsRow}>
            <div className={styles.dots} role="tablist" aria-label="Select reviews page">
              {pagePairs.map((pair, i) => (
                <button
                  key={`dot-page-${i}-${pair[0]?.user ?? ""}`}
                  type="button"
                  role="tab"
                  aria-selected={i === safePageIndex}
                  aria-label={`Show reviews ${i * REVIEWS_PER_SLIDE + 1}–${Math.min((i + 1) * REVIEWS_PER_SLIDE, slides.length)} of ${slides.length}`}
                  className={`${styles.dot} ${i === safePageIndex ? styles.dotActive : ""}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
            <p className={styles.counter}>
              {safePageIndex + 1} / {pageCount}
            </p>
          </div>
        ) : null}

        <p className={styles.googleFoot}>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={styles.googleLink}>
            Read all reviews on Google
            <i className="bi bi-arrow-up-right ms-1" aria-hidden style={{ fontSize: "0.85em" }} />
          </a>
        </p>
      </div>
    </section>
  );
}
