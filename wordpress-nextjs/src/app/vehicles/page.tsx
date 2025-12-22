import { getVehicles, getFilterOptions } from '@/lib/wordpress/api';
import VehicleGrid from '@/components/vehicles/VehicleGrid';
import VehicleFilters from '@/components/vehicles/VehicleFilters';
import VehicleSort from '@/components/vehicles/VehicleSort';
import { VehicleFilters as VehicleFiltersType } from '@/types/vehicle';
import './vehicles.css';

interface VehiclesPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata = {
    title: 'Vehicle Inventory | Auto Buyers Guide',
    description: 'Browse our extensive inventory of new, used, and demo vehicles. Find your perfect car with advanced filtering options.',
};

export default async function VehiclesPage(props: VehiclesPageProps) {
    const searchParams = await props.searchParams;

    // Parse filters from URL
    const filters: VehicleFiltersType = {
        search: searchParams.search as string,
        make: searchParams.make ? parseInt(searchParams.make as string) : undefined,
        model: searchParams.model ? parseInt(searchParams.model as string) : undefined,
        min_price: searchParams.min_price ? parseInt(searchParams.min_price as string) : undefined,
        max_price: searchParams.max_price ? parseInt(searchParams.max_price as string) : undefined,
        min_year: searchParams.min_year ? parseInt(searchParams.min_year as string) : undefined,
        max_year: searchParams.max_year ? parseInt(searchParams.max_year as string) : undefined,
        min_odometer: searchParams.min_odometer ? parseInt(searchParams.min_odometer as string) : undefined,
        max_odometer: searchParams.max_odometer ? parseInt(searchParams.max_odometer as string) : undefined,
        body_type: searchParams.body_type ? parseInt(searchParams.body_type as string) : undefined,
        fuel_type: searchParams.fuel_type ? parseInt(searchParams.fuel_type as string) : undefined,
        transmission: searchParams.transmission ? parseInt(searchParams.transmission as string) : undefined,
        drive_type: searchParams.drive_type ? parseInt(searchParams.drive_type as string) : undefined,
        color: searchParams.color ? parseInt(searchParams.color as string) : undefined,
        condition: searchParams.condition ? parseInt(searchParams.condition as string) : undefined,
        orderby: (searchParams.orderby as any) || 'date',
        order: (searchParams.order as any) || 'DESC',
        per_page: searchParams.per_page ? parseInt(searchParams.per_page as string) : 12,
        page: searchParams.page ? parseInt(searchParams.page as string) : 1,
    };

    // Fetch vehicles and filter options
    const [vehiclesData, filterOptions] = await Promise.all([
        getVehicles(filters),
        getFilterOptions(),
    ]);

    const startTime = Date.now();
    const searchTime = Date.now() - startTime;

    return (
        <div className="vehicles-page">
            <div className="vehicles-container">
                {/* Header */}
                <div className="vehicles-header">
                    <h1>Vehicle Inventory</h1>
                    <div className="vehicles-meta">
                        <span className="vehicles-count">
                            {vehiclesData.total} {vehiclesData.total === 1 ? 'car' : 'cars'} found
                        </span>
                        <span className="search-time">in {searchTime}ms</span>
                    </div>
                </div>

                <div className="vehicles-content">
                    {/* Sidebar Filters */}
                    <aside className="vehicles-sidebar">
                        <VehicleFilters 
                            filterOptions={filterOptions} 
                            currentFilters={filters}
                        />
                    </aside>

                    {/* Main Content */}
                    <main className="vehicles-main">
                        {/* Sort and View Options */}
                        <div className="vehicles-toolbar">
                            <VehicleSort currentSort={filters.orderby || 'date'} currentOrder={filters.order || 'DESC'} />
                        </div>

                        {/* Vehicle Grid */}
                        {vehiclesData.vehicles.length > 0 ? (
                            <>
                                <VehicleGrid vehicles={vehiclesData.vehicles} />
                                
                                {/* Pagination */}
                                {vehiclesData.totalPages > 1 && (
                                    <div className="vehicles-pagination">
                                        {Array.from({ length: vehiclesData.totalPages }, (_, i) => i + 1).map(pageNum => (
                                            <a
                                                key={pageNum}
                                                href={`?${new URLSearchParams({ ...searchParams as any, page: pageNum.toString() }).toString()}`}
                                                className={`pagination-link ${pageNum === filters.page ? 'active' : ''}`}
                                            >
                                                {pageNum}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="no-vehicles">
                                <h2>No vehicles found</h2>
                                <p>Try adjusting your filters to see more results.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
