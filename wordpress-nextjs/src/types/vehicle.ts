// Vehicle TypeScript Types

export interface Vehicle {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  featured_image: string;
  
  // Meta fields
  price: number;
  year: number;
  odometer: number;
  vin: string;
  stock_number: string;
  engine_size: string;
  cylinders: number;
  doors: number;
  seats: number;
  registration: string;
  price_type: string;
  status_badge: string;
  dealership: string;
  location: string;
  features: string;
  formatted_price: string;
  
  // Taxonomies
  make: VehicleTerm[];
  model: VehicleTerm[];
  body_type: VehicleTerm[];
  fuel_type: VehicleTerm[];
  transmission: VehicleTerm[];
  drive_type: VehicleTerm[];
  color: VehicleTerm[];
  condition: VehicleTerm[];
  
  // Gallery
  gallery_images: VehicleImage[];
}

export interface VehicleTerm {
  id: number;
  name: string;
  slug: string;
  count?: number;
}

export interface VehicleImage {
  id: number;
  url: string;
  thumbnail: string;
  medium: string;
  large: string;
  alt: string;
}

export interface VehicleFilters {
  slug?: string;
  search?: string;
  make?: number;
  model?: number;
  min_price?: number;
  max_price?: number;
  min_year?: number;
  max_year?: number;
  min_odometer?: number;
  max_odometer?: number;
  body_type?: number;
  fuel_type?: number;
  transmission?: number;
  drive_type?: number;
  color?: number;
  condition?: number;
  orderby?: 'date' | 'price' | 'year' | 'odometer';
  order?: 'ASC' | 'DESC';
  per_page?: number;
  page?: number;
}

export interface FilterOptions {
  makes: VehicleTerm[];
  models: VehicleTerm[];
  body_types: VehicleTerm[];
  fuel_types: VehicleTerm[];
  transmissions: VehicleTerm[];
  drive_types: VehicleTerm[];
  colors: VehicleTerm[];
  conditions: VehicleTerm[];
  price_range: {
    min: number;
    max: number;
  };
  year_range: {
    min: number;
    max: number;
  };
  odometer_range: {
    min: number;
    max: number;
  };
}

export interface VehicleListResponse {
  vehicles: Vehicle[];
  total: number;
  totalPages: number;
}
