/** One vehicle row for Google Merchant and Meta catalog exports. */
export type CatalogFeedItem = {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  additionalImageLinks: string[];
  priceAud: number;
  priceFormatted: string;
  availability: "in stock";
  condition: "new" | "used";
  brand: string;
  model: string;
  year: number | null;
};
