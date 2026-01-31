import { useEffect, useRef, useState } from "react";
import { MapPin, AlertTriangle } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Issue {
  id?: string;
  description: string;
  category: string;
  location: string;
  status: string;
  lat?: number;
  lng?: number;
  daysUnresolved?: number | null;
}

interface InteractiveMapProps {
  issues: Issue[];
  userLocation?: { lat: number; lng: number } | null;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
}

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export function InteractiveMap({ 
  issues, 
  userLocation, 
  centerLat = 20.5937, // Default: India center
  centerLng = 78.9629,
  zoom = 5 
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapRefInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  // Mock coordinates for demonstration (in real app, these would come from geocoding)
  const getMockCoordinates = (location: string) => {
    const mockCoords: Record<string, { lat: number; lng: number }> = {
      // Delhi
      "MG Road, Block A": { lat: 28.6139, lng: 77.2090 },
      "Sector 4 Park": { lat: 28.5355, lng: 77.3910 },
      "Market Street": { lat: 28.6519, lng: 77.2315 },
      "Central Mall Area": { lat: 28.5672, lng: 77.2100 },
      "Main Highway Exit": { lat: 28.6448, lng: 77.2167 },
      
      // Mumbai
      "Marine Drive": { lat: 18.9440, lng: 72.8196 },
      "Bandra West": { lat: 19.0596, lng: 72.8295 },
      "Andheri East": { lat: 19.1136, lng: 72.8697 },
      
      // Bangalore
      "Koramangala": { lat: 12.9279, lng: 77.6271 },
      "Indiranagar": { lat: 12.9784, lng: 77.6408 },
      "Whitefield": { lat: 12.9698, lng: 77.7499 },
      
      // Chennai
      "T Nagar": { lat: 13.0409, lng: 80.2337 },
      "Anna Nagar": { lat: 13.0870, lng: 80.2128 },
      
      // Kolkata
      "Park Street": { lat: 22.5586, lng: 88.3526 },
      "Salt Lake": { lat: 22.5808, lng: 88.4161 },
      
      // Hyderabad
      "Banjara Hills": { lat: 17.4165, lng: 78.4497 },
      "HITEC City": { lat: 17.4459, lng: 78.3767 },
      
      // Pune
      "Koregaon Park": { lat: 18.5314, lng: 73.8446 },
      "Hinjewadi": { lat: 18.5913, lng: 73.7389 },
    };
    
    return mockCoords[location] || {
      lat: centerLat + (Math.random() - 0.5) * 10, // Larger spread for India
      lng: centerLng + (Math.random() - 0.5) * 10
    };
  };

  const getMarkerColor = (category: string, daysUnresolved?: number | null) => {
    // Color based on urgency (days unresolved)
    if (daysUnresolved && daysUnresolved > 5) return '#dc2626'; // red
    if (daysUnresolved && daysUnresolved >= 3) return '#f59e0b'; // amber
    
    // Color based on category
    const categoryColors: Record<string, string> = {
      'Waste': '#84cc16', // lime
      'Water': '#3b82f6', // blue
      'Air': '#8b5cf6', // purple
      'Transport': '#f97316', // orange
      'Energy': '#ec4899', // pink
    };
    
    return categoryColors[category] || '#6b7280'; // gray
  };

  const createCustomIcon = (color: string, category: string) => {
    return L.divIcon({
      html: `<div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
      ">${category.charAt(0)}</div>`,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });
  };

  const createUserIcon = () => {
    return L.divIcon({
      html: `<div style="
        background-color: #3b82f6;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        animation: pulse 2s infinite;
      ">📍</div>`,
      className: 'user-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  useEffect(() => {
    if (mapRef.current && !mapRefInstance.current) {
      // Initialize the map
      const map = L.map(mapRef.current).setView([centerLat, centerLng], zoom);
      
      // Add tile layer (OpenStreetMap with better tiles for India)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors | Data for India',
        maxZoom: 18,
        minZoom: 4,
      }).addTo(map);

      // Add India boundaries if user location is detected
      if (userLocation) {
        // Set view to user location with appropriate zoom
        map.setView([userLocation.lat, userLocation.lng], 13);
      }

      mapRefInstance.current = map;
      setMapReady(true);
    }

    return () => {
      if (mapRefInstance.current) {
        mapRefInstance.current.remove();
        mapRefInstance.current = null;
      }
    };
  }, [centerLat, centerLng, zoom]);

  // Update markers when issues or user location changes
  useEffect(() => {
    if (!mapRefInstance.current || !mapReady) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapRefInstance.current!.removeLayer(marker);
    });
    markersRef.current = [];

    // Add issue markers
    issues.forEach(issue => {
      const coords = getMockCoordinates(issue.location);
      const color = getMarkerColor(issue.category, issue.daysUnresolved);
      
      const marker = L.marker([coords.lat, coords.lng], {
        icon: createCustomIcon(color, issue.category)
      }).addTo(mapRefInstance.current!);

      // Add popup
      const popupContent = `
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #1f2937;">${issue.category}</h4>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">${issue.location}</p>
          <p style="margin: 0 0 4px 0; font-size: 12px;">${issue.description}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: #6b7280;">Status: ${issue.status}</span>
            <span style="font-size: 11px; color: #6b7280;">${issue.daysUnresolved || 0} days</span>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    // Add user location marker
    if (userLocation) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: createUserIcon()
      }).addTo(mapRefInstance.current!);

      const userPopupContent = `
        <div style="min-width: 150px;">
          <h4 style="margin: 0 0 4px 0; color: #1f2937;">Your Location</h4>
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            Lat: ${userLocation.lat.toFixed(6)}<br>
            Lng: ${userLocation.lng.toFixed(6)}
          </p>
        </div>
      `;
      
      userMarker.bindPopup(userPopupContent);
      markersRef.current.push(userMarker);
    }

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      const group = new L.FeatureGroup(markersRef.current);
      mapRefInstance.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [issues, userLocation, mapReady]);

  // Update map view when user location changes
  useEffect(() => {
    if (mapRefInstance.current && userLocation && mapReady) {
      mapRefInstance.current.setView([userLocation.lat, userLocation.lng], 13);
    }
  }, [userLocation, mapReady]);

  return (
    <div className="w-full">
      <div 
        ref={mapRef} 
        style={{ 
          height: '400px', 
          borderRadius: '12px', 
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }} 
      />
      
      {/* Legend */}
      <div className="mt-4 p-3 bg-white rounded-lg border border-border/50">
        <h4 className="font-semibold text-sm mb-2">Map Legend</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span>Critical (&gt;5 days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Warning (3-5 days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-lime-500"></div>
            <span>Waste</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Water</span>
          </div>
        </div>
      </div>
    </div>
  );
}
