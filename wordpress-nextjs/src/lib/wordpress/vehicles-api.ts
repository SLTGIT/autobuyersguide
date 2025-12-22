import { Vehicle, VehicleFilters, FilterOptions, VehicleListResponse, VehicleTerm } from '@/types/vehicle';

const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WORDPRESS_API_URL || '';

// Helper function to construct API URL
const getAPIUrl = (endpoint: string): string => {
    // API_URL is now root wp-json
    return `${API_URL}/vim/v1${endpoint}`;
};

// Helper function for fetch with error handling
async function fetchVehicleAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = getAPIUrl(endpoint);

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...(options.headers as Record<string, string>),
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`Vehicle API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get vehicles with filtering
 */
export async function getVehicles(filters: VehicleFilters = {}): Promise<VehicleListResponse> {
    const queryParams = new URLSearchParams();

    // Add all filter parameters
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
        }
    });

    const query = queryParams.toString();
    const endpoint = `/vehicles${query ? `?${query}` : ''}`;

    try {
        const response = await fetch(getAPIUrl(endpoint), {
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Vehicle API error: ${response.status}`);
        }

        const vehicles = await response.json();
        const total = parseInt(response.headers.get('X-WP-Total') || '0');
        const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0');

        return {
            vehicles,
            total,
            totalPages,
        };
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        return {
            vehicles: [],
            total: 0,
            totalPages: 0,
        };
    }
}

/**
 * Get single vehicle by ID
 */
export async function getVehicleById(id: number): Promise<Vehicle | null> {
    try {
        return await fetchVehicleAPI<Vehicle>(`/vehicles/${id}`);
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        return null;
    }
}

/**
 * Get vehicle by slug
 */
export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
    try {
        const result = await getVehicles({ slug, per_page: 1 });
        
        // Find exact slug match (though query should handle it)
        const vehicle = result.vehicles.find(v => v.slug === slug);
        return vehicle || null;
    } catch (error) {
        console.error('Error fetching vehicle by slug:', error);
        return null;
    }
}

/**
 * Get all filter options
 */
export async function getFilterOptions(filters: VehicleFilters = {}): Promise<FilterOptions | null> {
    try {
        const queryParams = new URLSearchParams();
        
        // Add all filter parameters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value.toString());
            }
        });

        const query = queryParams.toString();
        const endpoint = `/filter-options${query ? `?${query}` : ''}`;

        return await fetchVehicleAPI<FilterOptions>(endpoint);
    } catch (error) {
        console.error('Error fetching filter options:', error);
        return null;
    }
}

/**
 * Get vehicle makes
 */
export async function getMakes(): Promise<VehicleTerm[]> {
    try {
        return await fetchVehicleAPI<VehicleTerm[]>('/makes');
    } catch (error) {
        console.error('Error fetching makes:', error);
        return [];
    }
}

/**
 * Get vehicle models (optionally filtered by make)
 */
export async function getModels(makeId?: number): Promise<VehicleTerm[]> {
    try {
        const endpoint = makeId ? `/models?make=${makeId}` : '/models';
        return await fetchVehicleAPI<VehicleTerm[]>(endpoint);
    } catch (error) {
        console.error('Error fetching models:', error);
        return [];
    }
}

/**
 * Build query string from filters
 */
export function buildVehicleQueryString(filters: VehicleFilters): string {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
        }
    });

    return params.toString();
}

/**
 * Parse query string to filters
 */
export function parseVehicleQueryString(queryString: string): VehicleFilters {
    const params = new URLSearchParams(queryString);
    const filters: VehicleFilters = {};

    // Number fields
    const numberFields = ['make', 'model', 'min_price', 'max_price', 'min_year', 'max_year', 
                         'min_odometer', 'max_odometer', 'body_type', 'fuel_type', 
                         'transmission', 'drive_type', 'color', 'condition', 'per_page', 'page'];

    numberFields.forEach(field => {
        const value = params.get(field);
        if (value) {
            filters[field as keyof VehicleFilters] = parseInt(value) as any;
        }
    });

    // String fields
    const stringFields = ['slug', 'search', 'orderby', 'order'];
    stringFields.forEach(field => {
        const value = params.get(field);
        if (value) {
            filters[field as keyof VehicleFilters] = value as any;
        }
    });

    return filters;
}
