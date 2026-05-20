/**
 * Driveaway section — custom REST API (/custom/v1/driveaway-section)
 */

import { API_URL } from "./client";

export type DriveawaySectionItem = {
  image: string;
};

export type DriveawaySectionData = {
  heading: string;
  description: string;
  items: DriveawaySectionItem[];
};

type DriveawaySectionResponse = {
  success: boolean;
  data: DriveawaySectionData;
};

function getApiRootEndpoint(): string {
  return API_URL.replace(/\/wp\/v2\/?$/, "");
}

export async function getDriveawaySection(): Promise<DriveawaySectionData | null> {
  try {
    const rootEndpoint = getApiRootEndpoint();
    const response = await fetch(`${rootEndpoint}/custom/v1/driveaway-section`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`Driveaway section API error: ${response.status}`);
    }

    const json = (await response.json()) as DriveawaySectionResponse;
    if (!json.success || !json.data) {
      return null;
    }

    const items = (json.data.items ?? []).filter((item) => item.image?.trim());
    if (!json.data.heading?.trim() && !json.data.description?.trim() && items.length === 0) {
      return null;
    }

    return {
      heading: json.data.heading?.trim() ?? "",
      description: json.data.description?.trim() ?? "",
      items,
    };
  } catch (error) {
    console.error("Error fetching driveaway section:", error);
    return null;
  }
}
