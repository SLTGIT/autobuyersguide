import { Vehicle } from '@/types/vehicle';
import Link from 'next/link';
import Image from 'next/image';

interface VehicleCardProps {
    vehicle: Vehicle;
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
    return (
        <div className="vehicle-card">
            <Link href={`/vehicles/${vehicle.slug}`} className="vehicle-card-link">
                {/* Image */}
                <div className="vehicle-card-image">
                    {vehicle.featured_image ? (
                        <Image
                            src={vehicle.featured_image}
                            alt={vehicle.title}
                            width={400}
                            height={300}
                            className="vehicle-image"
                        />
                    ) : (
                        <div className="vehicle-image-placeholder">
                            <span>No Image</span>
                        </div>
                    )}
                    
                    {/* Status Badge */}
                    {vehicle.status_badge && (
                        <span className={`vehicle-status-badge badge-${vehicle.status_badge}`}>
                            {vehicle.status_badge.replace('_', ' ')}
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="vehicle-card-content">
                    {/* Title */}
                    <h3 className="vehicle-card-title">{vehicle.title}</h3>

                    {/* Specs */}
                    <div className="vehicle-card-specs">
                        {vehicle.condition && vehicle.condition.length > 0 && (
                            <span className="spec-tag">{vehicle.condition[0].name}</span>
                        )}
                        {vehicle.body_type && vehicle.body_type.length > 0 && (
                            <span className="spec-tag">{vehicle.body_type[0].name}</span>
                        )}
                        {vehicle.odometer && (
                            <span className="spec-tag">{vehicle.odometer.toLocaleString()} km</span>
                        )}
                        {vehicle.transmission && vehicle.transmission.length > 0 && (
                            <span className="spec-tag">{vehicle.transmission[0].name}</span>
                        )}
                    </div>

                    {/* Stock Number */}
                    {vehicle.stock_number && (
                        <div className="vehicle-card-stock">
                            Stock #: {vehicle.stock_number}
                        </div>
                    )}

                    {/* Price */}
                    <div className="vehicle-card-price">
                        <span className="price-amount">{vehicle.formatted_price}</span>
                        {vehicle.price_type && (
                            <span className="price-type">{vehicle.price_type.replace('_', ' ')}</span>
                        )}
                    </div>

                    {/* Action Button */}
                    <button className="vehicle-card-button">
                        View Car
                    </button>
                </div>
            </Link>
        </div>
    );
}
