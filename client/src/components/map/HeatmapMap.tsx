import { useEffect, useRef, useState } from "react";
import { MapPin, AlertTriangle } from "lucide-react";

interface Issue {
  id: number;
  description: string;
  category: string;
  location: string;
  status: string;
  lat?: number;
  lng?: number;
  daysUnresolved?: number;
}

interface HeatmapMapProps {
  issues: Issue[];
  userLocation?: { lat: number; lng: number };
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
}

export function HeatmapMap({ 
  issues, 
  userLocation, 
  centerLat = 12.9716, // Default: Bangalore
  centerLng = 77.5946,
  zoom = 12 
}: HeatmapMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);

  // Mock coordinates for demonstration (in real app, these would come from geocoding)
  const getMockCoordinates = (location: string) => {
    const mockCoords: Record<string, { lat: number; lng: number }> = {
      "MG Road, Block A": { lat: 12.9768, lng: 77.6033 },
      "Sector 4 Park": { lat: 12.9698, lng: 77.5853 },
      "Market Street": { lat: 12.9788, lng: 77.5953 },
      "Central Mall Area": { lat: 12.9658, lng: 77.6053 },
      "Main Highway Exit": { lat: 12.9858, lng: 77.5753 },
    };
    
    return mockCoords[location] || {
      lat: centerLat + (Math.random() - 0.5) * 0.1,
      lng: centerLng + (Math.random() - 0.5) * 0.1
    };
  };

  const getMarkerColor = (category: string, daysUnresolved?: number) => {
    // Color based on urgency (days unresolved)
    if (daysUnresolved && daysUnresolved > 5) return '#ef4444'; // red
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

  useEffect(() => {
    // Initialize map (simplified version without external map library)
    if (mapRef.current && !mapLoaded) {
      setMapLoaded(true);
      
      // Create a simple map visualization
      const mapElement = mapRef.current;
      mapElement.innerHTML = `
        <div style="
          width: 100%;
          height: 400px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        ">
          <div style="margin-bottom: 16px;">🗺️</div>
          <div style="text-align: center; color: #64748b; font-size: 14px;">
            <div style="font-weight: bold; margin-bottom: 8px;">Interactive Map View</div>
            <div style="font-size: 12px;">Showing ${issues.length} issues in your area</div>
            ${userLocation ? `<div style="font-size: 11px; margin-top: 4px; color: #3b82f6;">📍 Your location detected</div>` : ''}
          </div>
        </div>
      `;
    }
  }, [issues, mapLoaded]);

  // Update map with markers
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      const mapElement = mapRef.current;
      
      // Simple markers display
      const markersHtml = issues.slice(0, 5).map(issue => {
        const color = getMarkerColor(issue.category, issue.daysUnresolved);
        return `
          <div style="
            display: inline-block;
            margin: 4px;
            padding: 4px 8px;
            background: ${color};
            color: white;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
          ">
            ${issue.category} (${issue.daysUnresolved || 0}d)
          </div>
        `;
      }).join('');

      mapElement.innerHTML = `
        <div style="
          width: 100%;
          height: 400px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          padding: 20px;
        ">
          <div style="text-align: center; margin-bottom: 16px;">
            <div style="font-size: 24px; margin-bottom: 8px;">🗺️</div>
            <div style="font-weight: bold; color: #1f2937; margin-bottom: 4px;">Interactive Area Map</div>
            <div style="font-size: 12px; color: #64748b;">Showing ${issues.length} issues in your area</div>
            ${userLocation ? `<div style="font-size: 11px; margin-top: 4px; color: #3b82f6;">📍 Your location detected</div>` : ''}
          </div>
          
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 4px;">
            ${markersHtml}
          </div>
          
          <div style="position: absolute; top: 10px; right: 10px; background: white; padding: 8px; border-radius: 8px; font-size: 11px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-weight: bold; margin-bottom: 4px;">Issues</div>
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
              <div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%;"></div>
              <span>Critical</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
              <div style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;"></div>
              <span>Your Location</span>
            </div>
          </div>
        </div>
      `;
    }
  }, [issues, userLocation, mapLoaded, centerLat, centerLng]);

  return (
    <div className="w-full">
      <div ref={mapRef} className="w-full" />
      
      {/* Issue List Below Map */}
      <div className="mt-4 space-y-2">
        <h3 className="font-semibold text-sm text-muted-foreground">Nearby Issues</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {issues.slice(0, 5).map(issue => (
            <div key={issue.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: getMarkerColor(issue.category, issue.daysUnresolved) }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{issue.category}</p>
                <p className="text-xs text-muted-foreground truncate">{issue.location}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {issue.daysUnresolved !== undefined && (
                  <span>{issue.daysUnresolved} days</span>
                )}
              </div>
            </div>
          ))}
          {issues.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-4">
              No issues found in this area
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
