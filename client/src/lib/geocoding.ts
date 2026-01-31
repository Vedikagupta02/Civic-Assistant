// Geocoding utility for converting area names to coordinates
// Using OpenStreetMap Nominatim API (free, no API key required)

export interface GeocodedLocation {
  lat: number;
  lng: number;
  address: string;
  success: boolean;
}

export async function geocodeArea(areaName: string): Promise<GeocodedLocation> {
  try {
    // Clean the area name - add "Delhi" if not present for better accuracy
    const searchQuery = areaName.toLowerCase().includes('delhi') 
      ? areaName 
      : `${areaName}, Delhi, India`;

    console.log('Geocoding area:', searchQuery);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
      {
        headers: {
          'User-Agent': 'Nagrik-Seva-App/1.0' // Required by Nominatim API
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);
      
      // Validation check
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && (lat !== 0 || lng !== 0)) {
        console.log('Geocoding successful:', { lat, lng, address: result.display_name });
        return {
          lat,
          lng,
          address: result.display_name || areaName,
          success: true
        };
      } else {
        console.warn('Invalid coordinates returned:', lat, lng);
      }
    } else {
      console.warn('No results found for area:', areaName);
    }
    
    // If no results or invalid coordinates
    console.log('Geocoding failed for area:', areaName);
    return {
      lat: 0,
      lng: 0,
      address: areaName,
      success: false
    };
    
  } catch (error) {
    console.error('Geocoding error for area:', areaName, error);
    return {
      lat: 0,
      lng: 0,
      address: areaName,
      success: false
    };
  }
}

// Validation function for coordinates
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && (lat !== 0 || lng !== 0);
}

// Fallback coordinates for Delhi (center of Delhi)
export const DELHI_CENTER = {
  lat: 28.6139,
  lng: 77.2090
};
