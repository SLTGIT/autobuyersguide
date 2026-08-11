import { getAPIUrl } from "@/lib/wordpress";

/** Public Google Maps listing (embeds, review links). */
export const CAR_SALES_BRISBANE_GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/Car+Sales+Brisbane/@-27.5224896,153.2562743,17z/data=!3m1!4b1!4m6!3m5!1s0x6b91678932e7fccd:0x6a000d7f9589579b!8m2!3d-27.5224896!4d153.2562743!16s%2Fg%2F11vqstz67d?entry=ttu&g_ep=EgoyMDI2MDQwNi4wIKXMDSoASAFQAw%3D%3D";

const GOOGLE_REVIEWS_ENDPOINT = "/custom/v1/google-reviews";

export type GoogleReviewsRating = {
  rating_number: string;
  rating_score: string;
};

export type GoogleReviewItem = {
  user: string;
  user_photo: string;
  text: string | null;
  rating: string;
  date: string;
};

export type GoogleReviewsResponse = {
  rating: GoogleReviewsRating;
  reviews: GoogleReviewItem[];
};

export type GoogleReviewsSummary = {
  reviewCount: number;
  averageScore: number;
  reviews: GoogleReviewItem[];
};

function buildAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (process.env.WORDPRESS_AUTH_USERNAME && process.env.WORDPRESS_AUTH_PASSWORD) {
    const credentials = Buffer.from(
      `${process.env.WORDPRESS_AUTH_USERNAME}:${process.env.WORDPRESS_AUTH_PASSWORD}`,
    ).toString("base64");
    headers.Authorization = `Basic ${credentials}`;
  }
  return headers;
}

function parseSummary(data: GoogleReviewsResponse): GoogleReviewsSummary {
  const reviewCount = Number.parseInt(data.rating.rating_number, 10);
  const averageScore = Number.parseFloat(data.rating.rating_score);
  return {
    reviewCount: Number.isFinite(reviewCount) ? reviewCount : 0,
    averageScore: Number.isFinite(averageScore) ? averageScore : 0,
    reviews: Array.isArray(data.reviews) ? data.reviews : [],
  };
}

/**
 * Fetches Google review aggregate + list from WordPress custom REST route.
 * Returns null if the API URL is missing, the request fails, or the payload is invalid.
 */
export async function getGoogleReviews(): Promise<GoogleReviewsSummary | null> {
  const url = getAPIUrl(GOOGLE_REVIEWS_ENDPOINT);
  if (!url || url === GOOGLE_REVIEWS_ENDPOINT) {
    return null;
  }

  try {
    const response = await fetch(url, {
      headers: buildAuthHeaders(),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as GoogleReviewsResponse;
    if (!data?.rating?.rating_number || data.rating.rating_score === undefined) {
      return null;
    }

    return parseSummary(data);
  } catch {
    return null;
  }
}

export function formatReviewSummaryLine(summary: GoogleReviewsSummary): string {
  const score = summary.averageScore.toFixed(1);
  const n = summary.reviewCount;
  const reviewWord = n === 1 ? "REVIEW" : "REVIEWS";
  return `${score} RATING OUT OF ${n} ${reviewWord}`;
}

export function stripLeadingStarEmojis(text: string): string {
  return text.replace(/^[\s\u2B50\u2605\u2728]+/gu, "").trim();
}
