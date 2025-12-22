'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface VehicleSortProps {
    currentSort: string;
    currentOrder: string;
}

export default function VehicleSort({ currentSort, currentOrder }: VehicleSortProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        
        if (value === 'date-desc') {
            params.set('orderby', 'date');
            params.set('order', 'DESC');
        } else if (value === 'price-desc') {
            params.set('orderby', 'price');
            params.set('order', 'DESC');
        } else if (value === 'price-asc') {
            params.set('orderby', 'price');
            params.set('order', 'ASC');
        } else if (value === 'year-desc') {
            params.set('orderby', 'year');
            params.set('order', 'DESC');
        } else if (value === 'odometer-asc') {
            params.set('orderby', 'odometer');
            params.set('order', 'ASC');
        }

        router.push(`/vehicles?${params.toString()}`);
    };

    const currentValue = `${currentSort}-${currentOrder.toLowerCase()}`;

    return (
        <div className="vehicle-sort">
            <label htmlFor="sort">Sort by:</label>
            <select id="sort" value={currentValue} onChange={handleSortChange} className="sort-select">
                <option value="date-desc">Latest</option>
                <option value="price-desc">Price: Highest to Lowest</option>
                <option value="price-asc">Price: Lowest to Highest</option>
                <option value="year-desc">Year: Newest to Oldest</option>
                <option value="odometer-asc">Odometer: Lowest to Highest</option>
            </select>
        </div>
    );
}
