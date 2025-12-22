'use client';

import { FilterOptions, VehicleFilters as VehicleFiltersType, VehicleTerm } from '@/types/vehicle';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { getModels, getFilterOptions } from '@/lib/wordpress/api';
import RangeSlider from './RangeSlider';
import debounce from 'lodash/debounce';

interface VehicleFiltersProps {
    filterOptions: FilterOptions | null;
    currentFilters: VehicleFiltersType;
}

export default function VehicleFilters({ filterOptions: initialOptions, currentFilters }: VehicleFiltersProps) {
    const router = useRouter();
    const [filters, setFilters] = useState<VehicleFiltersType>(currentFilters);
    const [dynamicOptions, setDynamicOptions] = useState<FilterOptions | null>(initialOptions);
    const [availableModels, setAvailableModels] = useState<VehicleTerm[]>(initialOptions?.models || []);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [isUpdatingCounts, setIsUpdatingCounts] = useState(false);

    // Update local filters when URL params change
    useEffect(() => {
        setFilters(currentFilters);
        
        // If initial load or deep link, ensure we have correct models
        if (currentFilters.make) {
            fetchModelsForMake(currentFilters.make);
        } else {
            setAvailableModels([]);
        }

        // Fetch updated counts based on current filters
        fetchDynamicOptions(currentFilters);

    }, [currentFilters]);

    // Debounced fetch for filter options (faceted counts)
    const fetchDynamicOptions = async (activeFilters: VehicleFiltersType) => {
        setIsUpdatingCounts(true);
        try {
            const options = await getFilterOptions(activeFilters);
            setDynamicOptions(options);
            
            // If make is selected, update models list from the dynamic options to show correct counts
            if (activeFilters.make) {
                // We keep the logic of 'fetchModelsForMake' but we can also likely just use options.models
                // provided the backend returns them filtered by make correctly (which we implemented).
                // However, let's keep availableModels state for safety.
                if (options?.models) {
                    setAvailableModels(options.models);
                }
            }
        } catch (error) {
            console.error('Error fetching dynamic options:', error);
        } finally {
            setIsUpdatingCounts(false);
        }
    };

    const fetchModelsForMake = async (makeId: number) => {
         // This might be redundant if fetchDynamicOptions handles it, but good for immediate response
         // We can leave it as a lightweight fall back or just rely on dynamic options.
         // Let's rely on dynamic options to ensure counts are accurate.
         // But for speed, immediately showing models (even with stale counts) is better than waiting.
         // So we kept getModels call in previous step, but now let's merge.
         setIsLoadingModels(true);
         try {
             // We can actually just call getModels(makeId) directly if we want JUST models
             const models = await getModels(makeId);
             setAvailableModels(models);
         } catch (error) {
             console.error('Error fetching models:', error);
         } finally {
             setIsLoadingModels(false);
         }
    };

    if (!dynamicOptions) {
        return <div>Loading filters...</div>;
    }

    const updateFilters = (key: keyof VehicleFiltersType, value: any) => {
        const newFilters = { ...filters, [key]: value, page: 1 }; // Reset to page 1 on filter change
        
        // Special handling for Make change
        if (key === 'make') {
            newFilters.model = undefined; // Reset model when make changes
            if (value) {
                // Optimistic update
                fetchModelsForMake(value); 
            } else {
                setAvailableModels([]); 
            }
        }
        
        // Optimistically update local state for UI responsiveness
        setFilters(newFilters);
        
        // Trigger URL update (which triggers effect -> fetchDynamicOptions)
        applyFilters(newFilters);
    };

    const applyFilters = (newFilters: VehicleFiltersType) => {
        const params = new URLSearchParams();
        
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.set(key, value.toString());
            }
        });

        router.push(`/vehicles?${params.toString()}`);
    };

    const clearFilters = () => {
        setFilters({});
        setAvailableModels([]); // Reset to empty logic
        router.push('/vehicles');
    };

    return (
        <div className="vehicle-filters">
            <div className="filters-header">
                <h2>Filters</h2>
                <button onClick={clearFilters} className="clear-filters">
                    Clear All
                </button>
            </div>

            {/* Search */}
            <div className="filter-group">
                <label htmlFor="search">Search</label>
                <input
                    type="text"
                    id="search"
                    placeholder="Search vehicles..."
                    value={filters.search || ''}
                    onChange={(e) => updateFilters('search', e.target.value)}
                    className="filter-input"
                />
            </div>

            {/* Condition */}
            {dynamicOptions.conditions.length > 0 && (
                <div className="filter-group">
                    <label>Condition</label>
                    <div className="filter-checkboxes">
                        {dynamicOptions.conditions.map((condition) => (
                            <label key={condition.id} className="checkbox-label">
                                <input
                                    type="radio"
                                    name="condition"
                                    checked={filters.condition === condition.id}
                                    onChange={() => updateFilters('condition', condition.id)}
                                />
                                <span>{condition.name} ({condition.count})</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Make */}
            {dynamicOptions.makes.length > 0 && (
                <div className="filter-group">
                    <label htmlFor="make">Make</label>
                    <select
                        id="make"
                        value={filters.make || ''}
                        onChange={(e) => updateFilters('make', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="filter-select"
                    >
                        <option value="">All Makes</option>
                        {dynamicOptions.makes.map((make) => (
                            <option key={make.id} value={make.id}>
                                {make.name} ({make.count})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Model - Strictly Dependent on Make */}
            {filters.make && (
                <div className="filter-group">
                    <label htmlFor="model">Model</label>
                    <select
                        id="model"
                        value={filters.model || ''}
                        onChange={(e) => updateFilters('model', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="filter-select"
                        disabled={isLoadingModels || availableModels.length === 0}
                    >
                        <option value="">{isLoadingModels ? 'Loading...' : 'All Models'}</option>
                        {availableModels.map((model) => (
                            <option key={model.id} value={model.id}>
                                {model.name} ({model.count})
                            </option>
                        ))}
                    </select>
                    {availableModels.length === 0 && !isLoadingModels && (
                        <span className="no-models-message">No models found for this make</span>
                    )}
                </div>
            )}

            {/* Price Range */}
            <div className="filter-group">
                <label>Price Range</label>
                <RangeSlider
                    min={dynamicOptions.price_range.min}
                    max={dynamicOptions.price_range.max}
                    currentMin={filters.min_price || dynamicOptions.price_range.min}
                    currentMax={filters.max_price || dynamicOptions.price_range.max}
                    onChange={(min, max) => {
                        updateFilters('min_price', min);
                        updateFilters('max_price', max);
                    }}
                    formatValue={(value) => `$${value.toLocaleString()}`}
                />
            </div>

            {/* Year Range */}
            <div className="filter-group">
                <label>Year</label>
                <RangeSlider
                    min={dynamicOptions.year_range.min}
                    max={dynamicOptions.year_range.max}
                    currentMin={filters.min_year || dynamicOptions.year_range.min}
                    currentMax={filters.max_year || dynamicOptions.year_range.max}
                    onChange={(min, max) => {
                        updateFilters('min_year', min);
                        updateFilters('max_year', max);
                    }}
                />
            </div>

            {/* Odometer Range */}
            <div className="filter-group">
                <label>Odometer</label>
                <RangeSlider
                    min={dynamicOptions.odometer_range.min}
                    max={dynamicOptions.odometer_range.max}
                    currentMin={filters.min_odometer || dynamicOptions.odometer_range.min}
                    currentMax={filters.max_odometer || dynamicOptions.odometer_range.max}
                    onChange={(min, max) => {
                        updateFilters('min_odometer', min);
                        updateFilters('max_odometer', max);
                    }}
                    formatValue={(value) => `${value.toLocaleString()} km`}
                />
            </div>

            {/* Body Type */}
            {dynamicOptions.body_types.length > 0 && (
                <div className="filter-group">
                    <label>Body Type</label>
                    <div className="filter-checkboxes">
                        {dynamicOptions.body_types.map((bodyType) => (
                            <label key={bodyType.id} className="checkbox-label">
                                <input
                                    type="radio"
                                    name="body_type"
                                    checked={filters.body_type === bodyType.id}
                                    onChange={() => updateFilters('body_type', bodyType.id)}
                                />
                                <span>{bodyType.name} ({bodyType.count})</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Transmission */}
            {dynamicOptions.transmissions.length > 0 && (
                <div className="filter-group">
                    <label>Transmission</label>
                    <div className="filter-checkboxes">
                        {dynamicOptions.transmissions.map((transmission) => (
                            <label key={transmission.id} className="checkbox-label">
                                <input
                                    type="radio"
                                    name="transmission"
                                    checked={filters.transmission === transmission.id}
                                    onChange={() => updateFilters('transmission', transmission.id)}
                                />
                                <span>{transmission.name} ({transmission.count})</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Fuel Type */}
            {dynamicOptions.fuel_types.length > 0 && (
                <div className="filter-group">
                    <label>Fuel Type</label>
                    <div className="filter-checkboxes">
                        {dynamicOptions.fuel_types.map((fuelType) => (
                            <label key={fuelType.id} className="checkbox-label">
                                <input
                                    type="radio"
                                    name="fuel_type"
                                    checked={filters.fuel_type === fuelType.id}
                                    onChange={() => updateFilters('fuel_type', fuelType.id)}
                                />
                                <span>{fuelType.name} ({fuelType.count})</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Drive Type */}
            {dynamicOptions.drive_types.length > 0 && (
                <div className="filter-group">
                    <label>Drive Type</label>
                    <div className="filter-checkboxes">
                        {dynamicOptions.drive_types.map((driveType) => (
                            <label key={driveType.id} className="checkbox-label">
                                <input
                                    type="radio"
                                    name="drive_type"
                                    checked={filters.drive_type === driveType.id}
                                    onChange={() => updateFilters('drive_type', driveType.id)}
                                />
                                <span>{driveType.name} ({driveType.count})</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Color */}
            {dynamicOptions.colors.length > 0 && (
                <div className="filter-group">
                    <label htmlFor="color">Color</label>
                    <select
                        id="color"
                        value={filters.color || ''}
                        onChange={(e) => updateFilters('color', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="filter-select"
                    >
                        <option value="">All Colors</option>
                        {dynamicOptions.colors.map((color) => (
                            <option key={color.id} value={color.id}>
                                {color.name} ({color.count})
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
