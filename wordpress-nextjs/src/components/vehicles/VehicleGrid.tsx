import { Vehicle } from '@/types/vehicle';
import VehicleCard from './VehicleCard';

interface VehicleGridProps {
    vehicles: Vehicle[];
}

export default function VehicleGrid({ vehicles }: VehicleGridProps) {
    return (
        <div className="vehicle-grid">
            {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
        </div>
    );
}
