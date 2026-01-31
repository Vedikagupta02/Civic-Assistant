import { useState, useEffect } from "react";
import { MapPin, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface LocationDetectorProps {
  onLocationDetected: (location: Location) => void;
  disabled?: boolean;
}

export function LocationDetector({ onLocationDetected, disabled = false }: LocationDetectorProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsDetecting(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding to get address
        const address = await getAddressFromCoords(latitude, longitude);
        
        const location: Location = {
          lat: latitude,
          lng: longitude,
          address: address || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
        };
        
        setCurrentLocation(location);
        onLocationDetected(location);
        setIsDetecting(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enable location services.');
        setIsDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    try {
      // Using Nominatim (OpenStreetMap) for reverse geocoding with India focus
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`,
        {
          headers: {
            'User-Agent': 'NagrikSeva/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }
      
      const data = await response.json();
      
      // Format the address for Indian locations
      const addressParts = [];
      if (data.address?.road || data.address?.pedestrian) {
        addressParts.push(data.address.road || data.address.pedestrian);
      }
      if (data.address?.suburb || data.address?.neighbourhood) {
        addressParts.push(data.address.suburb || data.address.neighbourhood);
      }
      if (data.address?.city || data.address?.town || data.address?.village) {
        addressParts.push(data.address.city || data.address.town || data.address.village);
      }
      if (data.address?.state || data.address?.state_district) {
        addressParts.push(data.address.state || data.address.state_district);
      }
      if (data.address?.postcode) {
        addressParts.push(data.address.postcode);
      }
      if (data.address?.country) {
        addressParts.push(data.address.country);
      }
      
      return addressParts.length > 0 ? addressParts.join(', ') : 'Unknown Location';
    } catch (error) {
      console.error('Error getting address:', error);
      return 'Unknown Location';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={detectLocation}
        disabled={disabled || isDetecting}
        className="flex items-center gap-2"
      >
        {isDetecting ? (
          <>
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Detecting...
          </>
        ) : (
          <>
            <Crosshair className="w-4 h-4" />
            {currentLocation ? 'Update Location' : 'Detect Location'}
          </>
        )}
      </Button>
      
      {currentLocation && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="truncate max-w-[200px]">{currentLocation.address}</span>
        </div>
      )}
    </div>
  );
}
