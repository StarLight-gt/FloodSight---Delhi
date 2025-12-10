// client/src/components/MapView.tsx
import { MapView as BaseMapView } from "@/components/Map";
import mapboxgl from "mapbox-gl";
import { trpc } from "@/lib/trpc";
import { FloodRiskLegend } from "./FloodRiskLegend";
import { useEffect, useRef } from "react";

type Incident = {
  id?: number;
  zone: string;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  type: string;
  description: string;
  timestamp: Date | string;
};

type Forecast = unknown;

interface FloodMapViewProps {
  incidents?: Incident[];
  forecasts?: Forecast[];
  showFloodRisk?: boolean; // Option to show/hide flood risk districts
}

export default function FloodMapView({ incidents = [], showFloodRisk = false }: FloodMapViewProps) {
  const { data: floodRiskData } = trpc.flood.riskMap.useQuery(undefined, {
    enabled: showFloodRisk, // Only fetch if we need to show flood risk
  });
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);

  // Fallback demo markers if there is no real incident data yet
  const fallbackIncidents: Incident[] = [
    {
      zone: "Central Delhi",
      locationName: "Minto Bridge (Demo)",
      latitude: 28.641,
      longitude: 77.227,
      type: "drain",
      description: "Demo marker – replace with real incident data.",
      timestamp: new Date().toISOString(),
    },
    {
      zone: "Yamuna Floodplain",
      locationName: "Yamuna Ghat (Demo)",
      latitude: 28.65,
      longitude: 77.25,
      type: "citizen",
      description: "Demo marker – high water level reported.",
      timestamp: new Date().toISOString(),
    },
  ];

  const dataToRender =
    incidents && incidents.length > 0 ? incidents : fallbackIncidents;

  const addFloodRiskLayers = (map: mapboxgl.Map, data: any) => {
    // Convert LineString to Polygon for proper fill rendering
    const polygonFeatures = data.features.map((feature: any) => {
      if (feature.geometry.type === 'LineString' && feature.geometry.coordinates.length > 0) {
        // Close the LineString to make it a polygon
        const coords = feature.geometry.coordinates;
        if (coords[0][0] !== coords[coords.length - 1][0] || 
            coords[0][1] !== coords[coords.length - 1][1]) {
          coords.push(coords[0]); // Close the polygon
        }
        return {
          ...feature,
          geometry: {
            type: 'Polygon',
            coordinates: [coords]
          }
        };
      }
      return feature;
    });

    const geojsonWithPolygons = {
      ...data,
      features: polygonFeatures
    };

    // Add or update GeoJSON source
    if (map.getSource('flood-risk')) {
      (map.getSource('flood-risk') as mapboxgl.GeoJSONSource).setData(geojsonWithPolygons);
    } else {
      map.addSource('flood-risk', {
        type: 'geojson',
        data: geojsonWithPolygons,
      });

      // Add fill layer for districts
      if (!map.getLayer('flood-risk-fill')) {
        map.addLayer({
          id: 'flood-risk-fill',
          type: 'fill',
          source: 'flood-risk',
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'Average_Flood_Risk'],
              0, '#22c55e',
              0.0001, '#eab308',
              0.0002, '#f97316',
              0.0003, '#ef4444',
              0.0005, '#7f1d1d'
            ],
            'fill-opacity': 0.6,
          },
        });
      }

      // Add outline layer
      if (!map.getLayer('flood-risk-outline')) {
        map.addLayer({
          id: 'flood-risk-outline',
          type: 'line',
          source: 'flood-risk',
          paint: {
            'line-color': '#ffffff',
            'line-width': 2,
            'line-opacity': 0.8,
          },
        });
      }

      // Add click handler
      map.on('click', 'flood-risk-fill', (e) => {
        if (e.features && e.features[0]) {
          const properties = e.features[0].properties;
          const riskValue = properties?.Average_Flood_Risk || 0;
          const districtName = properties?.NAME || 'Unknown District';
          const riskPercent = (riskValue * 100).toFixed(4);
          
          let riskLevel = 'Low';
          let riskColor = '#22c55e';
          if (riskValue >= 0.0003) {
            riskLevel = 'High';
            riskColor = '#ef4444';
          } else if (riskValue >= 0.0001) {
            riskLevel = 'Medium';
            riskColor = '#f97316';
          }
          
          new mapboxgl.Popup({ offset: 12, maxWidth: '300px' })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div style="font-family: system-ui; font-size: 14px;">
                <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px; color: #1e293b;">
                  ${districtName}
                </div>
                <div style="margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="color: #64748b; font-size: 13px;">Average Flood Risk</span>
                    <span style="font-weight: 600; color: #1e293b; font-size: 15px;">
                      ${riskPercent}%
                    </span>
                  </div>
                  <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${Math.min(riskValue * 1000, 100)}%; height: 100%; background: ${riskColor}; transition: width 0.3s;"></div>
                  </div>
                </div>
                <div style="padding: 8px; background: ${riskColor}20; border-left: 3px solid ${riskColor}; border-radius: 4px;">
                  <span style="color: ${riskColor}; font-weight: 600; font-size: 12px; text-transform: uppercase;">
                    ${riskLevel} Risk Zone
                  </span>
                </div>
              </div>
            `)
            .addTo(map);
        }
      });

      // Change cursor on hover
      map.on('mouseenter', 'flood-risk-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'flood-risk-fill', () => {
        map.getCanvas().style.cursor = '';
      });
    }
  };

  // Update map when flood risk data changes (only if showFloodRisk is true)
  useEffect(() => {
    if (!showFloodRisk || !mapInstanceRef.current || !floodRiskData?.features?.length) {
      // Remove flood risk layers if they exist and showFloodRisk is false
      if (!showFloodRisk && mapInstanceRef.current) {
        const map = mapInstanceRef.current;
        if (map.getLayer('flood-risk-fill')) {
          map.removeLayer('flood-risk-fill');
        }
        if (map.getLayer('flood-risk-outline')) {
          map.removeLayer('flood-risk-outline');
        }
        if (map.getSource('flood-risk')) {
          map.removeSource('flood-risk');
        }
      }
      return;
    }

    const map = mapInstanceRef.current;
    // Wait for map to be loaded before adding layers
    if (map.loaded()) {
      addFloodRiskLayers(map, floodRiskData);
    } else {
      map.once('load', () => {
        addFloodRiskLayers(map, floodRiskData);
      });
    }
  }, [floodRiskData, showFloodRisk]);

  const handleMapReady = (map: mapboxgl.Map) => {
    mapInstanceRef.current = map;
    
    // Wait for map to be fully loaded before adding layers
    map.on('load', () => {
      // Add flood risk layer if data is available and showFloodRisk is true
      if (showFloodRisk && floodRiskData?.features?.length > 0) {
        addFloodRiskLayers(map, floodRiskData);
      }
    });

    // Add incident markers
    dataToRender.forEach((incident) => {
      if (incident.latitude == null || incident.longitude == null) return;

      const el = document.createElement("div");
      el.style.width = "14px";
      el.style.height = "14px";
      el.style.borderRadius = "9999px";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 0 4px rgba(0,0,0,0.5)";
      el.style.backgroundColor =
        incident.type === "drain" ? "#ef4444" : "#f97316";

      new mapboxgl.Marker({ element: el })
        .setLngLat([incident.longitude, incident.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 12 }).setHTML(`
            <div style="font-family: system-ui; font-size: 13px; max-width: 260px;">
              <strong>${incident.locationName || incident.zone}</strong><br/>
              <span>${incident.type}</span><br/>
              <span>${incident.description}</span><br/>
              <span style="font-size: 11px; color: #64748b;">
                ${new Date(incident.timestamp).toLocaleString()}
              </span>
            </div>
          `)
        )
        .addTo(map);
    });
  };

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-slate-700" style={{ minHeight: "500px" }}>
      <BaseMapView
        initialCenter={{ lat: 28.6139, lng: 77.209 }} // Delhi
        initialZoom={11}
        onMapReady={handleMapReady}
        className="h-[500px]"
      />
      {showFloodRisk && floodRiskData?.features?.length > 0 && <FloodRiskLegend />}
    </div>
  );
}