type GoogleRatingStarsProps = {
  score: number;
  className?: string;
};

/**
 * Renders up to five stars from a 0–5 score (half-star steps).
 */
export default function GoogleRatingStars({ score, className }: GoogleRatingStarsProps) {
  const roundedToHalf = Math.min(5, Math.max(0, Math.round(score * 2) / 2));

  return (
    <span className={className ?? "d-inline-flex align-items-center gap-2"}>
      {[1, 2, 3, 4, 5].map((i) => {
        const key = i;
        if (roundedToHalf >= i) {
          return (
            <span key={key} className="cs-rating-star">
              <i className="bi bi-star-fill" aria-hidden />
            </span>
          );
        }
        if (roundedToHalf >= i - 0.5) {
          return (
            <span key={key} className="cs-rating-star">
              <i className="bi bi-star-half" aria-hidden />
            </span>
          );
        }
        return (
          <span key={key} className="cs-rating-star">
            <i className="bi bi-star" aria-hidden />
          </span>
        );
      })}
    </span>
  );
}
