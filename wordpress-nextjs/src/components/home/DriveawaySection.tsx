import { getDriveawaySection } from "@/lib/wordpress/api/driveaway-section";
import DriveawayCarousel from "./DriveawayCarousel";
import styles from "./DriveawaySection.module.scss";

function formatDescription(text: string) {
  const parts = text.split(/(#\w+)/g);
  return parts.map((part, i) =>
    part.startsWith("#") ? <strong key={`${part}-${i}`}>{part}</strong> : part,
  );
}

export default async function DriveawaySection() {
  const data = await getDriveawaySection();
  if (!data) {
    return null;
  }

  const images = data.items.map((item) => item.image);
  const hasCopy = Boolean(data.heading || data.description);
  const hasImages = images.length > 0;

  if (!hasCopy && !hasImages) {
    return null;
  }

  return (
    <section
      className={styles.section}
      aria-labelledby={data.heading ? "driveaway-section-heading" : undefined}
    >
      <div className="container">
        {hasCopy ? (
          <header className={styles.header}>
            {data.heading ? (
              <h2
                id="driveaway-section-heading"
                className={styles.title}
              >
                {data.heading}
              </h2>
            ) : null}
            {data.description ? (
              <p className={styles.description}>
                {formatDescription(data.description)}
              </p>
            ) : null}
          </header>
        ) : null}

        {hasImages ? <DriveawayCarousel images={images} /> : null}
      </div>
    </section>
  );
}
