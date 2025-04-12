import React, { useEffect, useRef } from 'react';
import MapAttribution from "../common/MapAttribution";

interface LocationMapProps {
    center: [number, number];
    zoom: number;
}

const LocationMap: React.FC

<LocationMapProps> = ({ center, zoom }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize the map using a mapping library (e.g., Leaflet, Mapbox)
        if (mapContainerRef.current) {
            // Example: initialize the map with center and zoom values
            console.log('Initializing map with center:', center, 'and zoom:', zoom);
        }
    }, [center, zoom]);

    return (
        <div className="map-container">
            {/* Map rendering logic */}
            <div 
                ref={mapContainerRef} 
                className="map-content" 
                style={{ width: '100%', height: '400px' }}
            />
            <MapAttribution />
        </div>
    );
};

export default LocationMap;
