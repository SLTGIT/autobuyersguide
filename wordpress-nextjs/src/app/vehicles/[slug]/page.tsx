import { getVehicleBySlug } from '@/lib/wordpress/api';
import VehicleGallery from '@/components/vehicles/VehicleGallery';
import { notFound } from 'next/navigation';
import '../vehicles.css';

interface VehicleDetailPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata(props: VehicleDetailPageProps) {
    const params = await props.params;
    const vehicle = await getVehicleBySlug(params.slug);
    
    if (!vehicle) {
        return {
            title: 'Vehicle Not Found',
        };
    }

    return {
        title: `${vehicle.title} | Auto Buyers Guide`,
        description: vehicle.excerpt || `View details for ${vehicle.title}`,
    };
}

export default async function VehicleDetailPage(props: VehicleDetailPageProps) {
    const params = await props.params;
    const vehicle = await getVehicleBySlug(params.slug);

    if (!vehicle) {
        notFound();
    }

    return (
        <div className="vehicle-detail-page">
            <div className="vehicle-detail-container">
                {/* Header */}
                <div className="vehicle-detail-header">
                    <h1>{vehicle.title}</h1>
                    {vehicle.status_badge && (
                        <span className={`status-badge status-${vehicle.status_badge}`}>
                            {vehicle.status_badge.replace('_', ' ')}
                        </span>
                    )}
                </div>

                <div className="vehicle-detail-content">
                    {/* Gallery */}
                    <div className="vehicle-detail-gallery">
                        <VehicleGallery 
                            featuredImage={vehicle.featured_image}
                            galleryImages={vehicle.gallery_images}
                            title={vehicle.title}
                        />
                    </div>

                    {/* Main Info */}
                    <div className="vehicle-detail-info">
                        <div className="vehicle-price">
                            <span className="price-amount">{vehicle.formatted_price}</span>
                            {vehicle.price_type && (
                                <span className="price-type">{vehicle.price_type.replace('_', ' ')}</span>
                            )}
                        </div>

                        {/* Key Specs */}
                        <div className="vehicle-key-specs">
                            {vehicle.year && (
                                <div className="spec-item">
                                    <span className="spec-label">Year</span>
                                    <span className="spec-value">{vehicle.year}</span>
                                </div>
                            )}
                            {vehicle.odometer && (
                                <div className="spec-item">
                                    <span className="spec-label">Odometer</span>
                                    <span className="spec-value">{vehicle.odometer.toLocaleString()} km</span>
                                </div>
                            )}
                            {vehicle.condition && vehicle.condition.length > 0 && (
                                <div className="spec-item">
                                    <span className="spec-label">Condition</span>
                                    <span className="spec-value">{vehicle.condition[0].name}</span>
                                </div>
                            )}
                            {vehicle.body_type && vehicle.body_type.length > 0 && (
                                <div className="spec-item">
                                    <span className="spec-label">Body Type</span>
                                    <span className="spec-value">{vehicle.body_type[0].name}</span>
                                </div>
                            )}
                            {vehicle.transmission && vehicle.transmission.length > 0 && (
                                <div className="spec-item">
                                    <span className="spec-label">Transmission</span>
                                    <span className="spec-value">{vehicle.transmission[0].name}</span>
                                </div>
                            )}
                            {vehicle.fuel_type && vehicle.fuel_type.length > 0 && (
                                <div className="spec-item">
                                    <span className="spec-label">Fuel Type</span>
                                    <span className="spec-value">{vehicle.fuel_type[0].name}</span>
                                </div>
                            )}
                        </div>

                        {/* Stock Info */}
                        {vehicle.stock_number && (
                            <div className="vehicle-stock">
                                Stock #: {vehicle.stock_number}
                            </div>
                        )}

                        {/* Contact Button */}
                        <button className="contact-button">
                            Contact Dealer
                        </button>
                    </div>
                </div>

                {/* Detailed Specifications */}
                <div className="vehicle-specifications">
                    <h2>Specifications</h2>
                    <div className="specs-grid">
                        {vehicle.engine_size && (
                            <div className="spec-row">
                                <span className="spec-label">Engine Size</span>
                                <span className="spec-value">{vehicle.engine_size}</span>
                            </div>
                        )}
                        {vehicle.cylinders && (
                            <div className="spec-row">
                                <span className="spec-label">Cylinders</span>
                                <span className="spec-value">{vehicle.cylinders}</span>
                            </div>
                        )}
                        {vehicle.doors && (
                            <div className="spec-row">
                                <span className="spec-label">Doors</span>
                                <span className="spec-value">{vehicle.doors}</span>
                            </div>
                        )}
                        {vehicle.seats && (
                            <div className="spec-row">
                                <span className="spec-label">Seats</span>
                                <span className="spec-value">{vehicle.seats}</span>
                            </div>
                        )}
                        {vehicle.drive_type && vehicle.drive_type.length > 0 && (
                            <div className="spec-row">
                                <span className="spec-label">Drive Type</span>
                                <span className="spec-value">{vehicle.drive_type[0].name}</span>
                            </div>
                        )}
                        {vehicle.color && vehicle.color.length > 0 && (
                            <div className="spec-row">
                                <span className="spec-label">Color</span>
                                <span className="spec-value">{vehicle.color.map(c => c.name).join(', ')}</span>
                            </div>
                        )}
                        {vehicle.registration && (
                            <div className="spec-row">
                                <span className="spec-label">Registration</span>
                                <span className="spec-value">{vehicle.registration}</span>
                            </div>
                        )}
                        {vehicle.vin && (
                            <div className="spec-row">
                                <span className="spec-label">VIN</span>
                                <span className="spec-value">{vehicle.vin}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Features */}
                {vehicle.features && (
                    <div className="vehicle-features">
                        <h2>Features</h2>
                        <ul className="features-list">
                            {vehicle.features.split('\n').filter(f => f.trim()).map((feature, index) => (
                                <li key={index}>{feature.trim()}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Description */}
                {vehicle.content && (
                    <div className="vehicle-description">
                        <h2>Description</h2>
                        <div dangerouslySetInnerHTML={{ __html: vehicle.content }} />
                    </div>
                )}

                {/* Dealership Info */}
                {(vehicle.dealership || vehicle.location) && (
                    <div className="vehicle-dealership">
                        <h2>Dealership Information</h2>
                        {vehicle.dealership && <p><strong>Dealership:</strong> {vehicle.dealership}</p>}
                        {vehicle.location && <p><strong>Location:</strong> {vehicle.location}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
