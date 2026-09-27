import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CampusLocation } from '../../types';
import { api } from '../../lib/api';
import nieNorthGeoJson from '../../data/nie_north';
import { 
  Flame, 
  Building2, 
  Compass, 
  Sparkles,
  Layers,
  Eye,
  EyeOff
} from 'lucide-react';
import { NeumorphicCard } from '../ui/NeumorphicCard';

interface CampusMapProps {
  onLocationSelect?: (locationName: string) => void;
  selectedLocation?: string;
  showHeatmap?: boolean;
}

// Exact NIE North Campus Boundary from data/nie_north.geojson & initial commit
const campusBoundary: [number, number][] = [
  [12.3708164, 76.5857619],
  [12.3704832, 76.5876098],
  [12.3702353, 76.5878755],
  [12.3702106, 76.5886288],
  [12.3710493, 76.5885008],
  [12.3709666, 76.5874306],
  [12.3719324, 76.5874824],
  [12.3724239, 76.5871614],
  [12.3741434, 76.5870053],
  [12.3750691, 76.5861900],
  [12.3709411, 76.5840391],
  [12.3708164, 76.5857619]
];

const categoryIcons: Record<string, string> = {
  'Library': '📚',
  'Academic': '🎓',
  'Classroom': '🏫',
  'Lab': '🔬',
  'Admin': '🏛️',
  'Food': '☕',
  'Hostel': '🏠',
  'Sports': '🏆',
  'Medical': '🏥',
  'Auditorium': '🎭',
  'Hub': '💡',
  'Facility': '🚗',
  'Gate': '🛡️',
  'Custom': '📍'
};

export const CampusMap: React.FC<CampusMapProps> = ({
  onLocationSelect,
  selectedLocation,
  showHeatmap: initialHeatmap = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const maskLayerRef = useRef<L.Polygon | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const [isHeatmapMode, setIsHeatmapMode] = useState<boolean>(initialHeatmap);
  const [isMaskOn, setIsMaskOn] = useState<boolean>(true);
  const [selectedBuilding, setSelectedBuilding] = useState<any | null>(null);
  const [selectedItemPin, setSelectedItemPin] = useState<any | null>(null);
  const [heatmapData, setHeatmapData] = useState<any>(null);

  // Fetch live locations & heatmap from database
  const loadData = async () => {
    try {
      const [locData, heatRes] = await Promise.all([
        api.locations.list(),
        api.locations.heatmap()
      ]);
      if (Array.isArray(locData) && locData.length > 0) {
        setLocations(locData);
      }
      if (heatRes && heatRes.points) {
        setHeatmapData(heatRes);
      }
    } catch (err) {
      console.warn('Failed to fetch live locations & heatmap:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Initialize Map exactly like initial commit
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const campusBounds = L.latLngBounds(campusBoundary);

    const map = L.map(mapContainerRef.current, {
      center: campusBounds.getCenter(),
      zoom: 17,
      minZoom: 15,
      maxZoom: 20,
      maxBounds: campusBounds.pad(0.35),
      maxBoundsViscosity: 0.95,
      zoomControl: false
    });

    // Dedicated Esri High-Resolution Satellite Layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri &bull; High-Res Satellite',
      maxZoom: 20,
      maxNativeZoom: 18,
      minZoom: 15
    }).addTo(map);

    // Esri Transportation / Road Overlay
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 20
    }).addTo(map);

    // Inverted Surrounding Mask (Frosted Dim on surroundings)
    const worldOuter: [number, number][] = [[-90, -180], [-90, 180], [90, 180], [90, -180], [-90, -180]];
    const maskLayer = L.polygon([worldOuter, campusBoundary], {
      color: '#070b14',
      fillColor: '#070b14',
      fillOpacity: 0.70,
      weight: 0,
      interactive: false
    }).addTo(map);
    maskLayerRef.current = maskLayer;

    // Glowing Cyan Campus Boundary Outline from initial commit
    const boundaryOutline = L.polygon(campusBoundary, {
      color: '#00f0ff',
      weight: 3.5,
      opacity: 0.95,
      fillColor: 'transparent',
      fillOpacity: 0,
      dashArray: '5, 8',
      interactive: false
    }).addTo(map);

    // Center Badge
    boundaryOutline.bindTooltip('🏛️ NIE North Campus', {
      permanent: true,
      direction: 'center',
      className: 'campus-badge'
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    map.fitBounds(campusBounds, { padding: [40, 40] });

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Toggle Inverted Mask
  useEffect(() => {
    if (maskLayerRef.current) {
      maskLayerRef.current.setStyle({
        fillOpacity: isMaskOn ? 0.65 : 0.0
      });
    }
  }, [isMaskOn]);

  // 2. Render Markers from nie_north.geojson & Live Reports
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    // Extract Point landmarks from nie_north.geojson
    const geoJsonPoints = ((nieNorthGeoJson as any).features || []).filter(
      (f: any) => f.geometry?.type === 'Point'
    );

    // Render Point Landmark Markers with exact initial commit styling
    geoJsonPoints.forEach((feat: any) => {
      const [lng, lat] = feat.geometry.coordinates;
      const props = feat.properties || {};
      const name = props.name || 'Campus Place';
      const category = props.category || 'Academic';
      const color = props.color || '#00f0ff';
      const iconEmoji = categoryIcons[category] || '📍';

      // Match with database location report counts
      const matchedDbLoc = locations.find(l => 
        l.name.toLowerCase().includes(name.toLowerCase()) || 
        name.toLowerCase().includes(l.name.toLowerCase()) ||
        name.toLowerCase().includes(l.building?.toLowerCase() || '')
      );

      const itemCount = matchedDbLoc?.itemCount || 0;
      const isSelected = selectedLocation === name || selectedBuilding?.name === name;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background: ${color};
            width: 34px;
            height: 34px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #ffffff;
            box-shadow: 0 0 14px ${color}80, 0 4px 10px rgba(0,0,0,0.6);
            cursor: pointer;
            transition: all 0.25s ease;
            ${isSelected ? 'transform: rotate(-45deg) scale(1.3); border-color: #ffd700;' : ''}
          ">
            <span style="transform: rotate(45deg); font-size: 14px; font-weight: bold; line-height: 1;">${iconEmoji}</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupHtml = `
        <div style="min-width: 190px; font-family: Inter, sans-serif; padding: 4px;">
          <div style="font-weight: 800; font-size: 0.95rem; color: #0C1E33; margin-bottom: 2px;">${name}</div>
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
            <span style="font-size: 0.72rem; color: ${color}; font-weight: 700; background: ${color}20; padding: 2px 6px; border-radius: 4px;">${category}</span>
            <span style="font-size: 0.72rem; color: #64748b;">NIE North Campus</span>
          </div>
          <div style="font-size: 0.75rem; color: #4A5A6A; margin-bottom: 4px;">Active Incident Logs: <strong style="color: #0375DE;">${itemCount}</strong></div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedBuilding({ name, category, color, itemCount, latitude: lat, longitude: lng });
        setSelectedItemPin(null);
        onLocationSelect?.(name);
      });

      markersGroup.addLayer(marker);
    });

    // Real-Time Dynamic Heatmap from Live Database Reports
    if (isHeatmapMode && heatmapData?.points) {
      heatmapData.points.forEach((p: any) => {
        if (p.totalCount > 0) {
          const radius = Math.max(35, Math.min(85, 30 + p.totalCount * 14));
          const opacity = Math.min(0.75, 0.35 + p.intensity * 0.4);
          const color = p.totalCount >= 3 ? '#EF4444' : p.totalCount >= 1 ? '#F59E0B' : '#00f0ff';

          const circle = L.circle([p.latitude, p.longitude], {
            radius: radius,
            color: color,
            fillColor: color,
            fillOpacity: opacity,
            weight: 2
          });
          circle.bindTooltip(`🔥 Activity Hotspot: <strong>${p.name}</strong><br/>• Total Logs: ${p.totalCount} (Lost: ${p.lostCount}, Found: ${p.foundCount}, Resolved: ${p.returnedCount || 0})`, { permanent: false });
          markersGroup.addLayer(circle);
        }
      });
    }

    // Live Item Pins (Render actual lost/found item points)
    if (heatmapData?.liveItems && heatmapData.liveItems.length > 0) {
      heatmapData.liveItems.forEach((item: any) => {
        const isLost = item.type === 'LOST';
        const isResolved = item.status === 'RETURNED' || item.status === 'CLOSED';
        const pinColor = isResolved ? '#10B981' : isLost ? '#EF4444' : '#3B82F6';
        const symbol = isResolved ? '✓' : isLost ? '🔍' : '📦';

        const itemIcon = L.divIcon({
          className: 'item-live-pin',
          html: `
            <div style="
              background: ${pinColor};
              width: 28px;
              height: 28px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid #ffffff;
              box-shadow: 0 0 10px ${pinColor}90, 0 3px 8px rgba(0,0,0,0.5);
              cursor: pointer;
              font-size: 12px;
              color: white;
              transition: transform 0.2s;
            ">
              ${symbol}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14]
        });

        const itemMarker = L.marker([item.latitude, item.longitude], { icon: itemIcon });
        const itemPopup = `
          <div style="min-width: 180px; font-family: Inter, sans-serif; padding: 4px;">
            <div style="font-weight: 800; font-size: 0.9rem; color: #0C1E33;">${item.title}</div>
            <div style="font-size: 0.72rem; font-weight: 700; color: ${pinColor}; text-transform: uppercase; margin-top: 1px;">
              ${item.type} &bull; ${item.status}
            </div>
            <div style="font-size: 0.72rem; color: #4A5A6A; margin-top: 3px;">📍 ${item.incidentPlace || item.locationName}</div>
            <div style="font-size: 0.7rem; color: #8A96A0;">📅 ${item.eventDate || 'Recent'} ${item.eventTime || ''}</div>
          </div>
        `;
        itemMarker.bindPopup(itemPopup);
        itemMarker.on('click', () => {
          setSelectedItemPin(item);
          setSelectedBuilding(null);
        });
        markersGroup.addLayer(itemMarker);
      });
    }
  }, [activeCategoryFilter, isHeatmapMode, selectedLocation, selectedBuilding, locations, heatmapData]);

  // Center on campus
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      const bounds = L.latLngBounds(campusBoundary);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
    }
  };

  return (
    <div className="relative w-full h-[580px] rounded-3xl overflow-hidden bg-[#070b14] border border-cyan-500/20 shadow-2xl p-0">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Category Filters & Action Tools */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 bg-[#0b0f19]/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-xl pointer-events-auto overflow-x-auto max-w-full">
          {[
            { id: 'ALL', label: 'All Places', icon: '📍' },
            { id: 'Academic', label: 'Academic', icon: '🎓' },
            { id: 'Library', label: 'Library', icon: '📚' },
            { id: 'Lab', label: 'Labs', icon: '🔬' },
            { id: 'Food', label: 'Food Court', icon: '☕' },
            { id: 'Admin', label: 'Admin', icon: '🏛️' },
            { id: 'Sports', label: 'Sports', icon: '🏆' },
            { id: 'Gate', label: 'Gates', icon: '🛡️' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryFilter(cat.id)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeCategoryFilter === cat.id
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Surroundings Dim Mask Toggle (From Initial Commit) */}
          <button
            onClick={() => setIsMaskOn(!isMaskOn)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer ${
              isMaskOn
                ? 'bg-slate-900/90 text-cyan-400 border border-cyan-500/40 shadow-cyan-500/20'
                : 'bg-slate-900/70 text-slate-400 border border-white/10 hover:text-white'
            }`}
            title="Toggle Surroundings Dim Mask"
          >
            {isMaskOn ? <Eye className="w-4 h-4 text-cyan-400" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{isMaskOn ? 'Surroundings: Dim' : 'Surroundings: Clear'}</span>
          </button>

          {/* Heatmap Toggle */}
          <button
            onClick={() => setIsHeatmapMode(!isHeatmapMode)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer ${
              isHeatmapMode
                ? 'bg-amber-500 text-black font-extrabold shadow-amber-500/30'
                : 'bg-slate-900/80 text-slate-300 border border-white/10 hover:text-white'
            }`}
          >
            <Flame className={`w-4 h-4 ${isHeatmapMode ? 'text-black' : 'text-amber-400'}`} />
            <span>{isHeatmapMode ? 'Heatmap: ON' : 'Heatmap'}</span>
          </button>

          {/* Recenter */}
          <button
            onClick={handleRecenter}
            className="p-2 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all shadow-lg cursor-pointer"
            title="Recenter Map to NIE North Boundary"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-auto hidden md:flex items-center gap-3 bg-[#0b0f19]/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shadow-xl text-[11px] font-semibold text-slate-300">
        <span className="font-bold text-cyan-400">Live Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
          <span>Lost Report</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
          <span>Found Item</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span>Resolved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-amber-400 font-bold">🔥</span>
          <span>Hotspot Radius</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🏛️</span>
          <span>NIE North Desk</span>
        </div>
      </div>

      {/* Selected Item Pin Drawer */}
      {selectedItemPin && (
        <div className="absolute bottom-4 right-4 sm:w-84 bg-[#0b0f19]/95 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/30 shadow-2xl z-20 animate-slideUp text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
                selectedItemPin.status === 'RETURNED' ? 'bg-emerald-500' : selectedItemPin.type === 'LOST' ? 'bg-red-500' : 'bg-blue-500'
              }`}>
                {selectedItemPin.type === 'LOST' ? '🔍' : '📦'}
              </span>
              <div>
                <h4 className="text-sm font-bold text-white truncate max-w-[180px]">{selectedItemPin.title}</h4>
                <span className="text-[11px] font-bold uppercase text-cyan-400">{selectedItemPin.type} &bull; {selectedItemPin.status}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedItemPin(null)}
              className="text-slate-400 hover:text-white text-sm font-bold px-1.5 py-0.5 cursor-pointer"
            >
              &times;
            </button>
          </div>
          <div className="mt-3 space-y-1 text-xs text-slate-300">
            <p><strong className="text-slate-100">Location:</strong> {selectedItemPin.incidentPlace || selectedItemPin.locationName}</p>
            <p><strong className="text-slate-100">Category:</strong> {selectedItemPin.category}</p>
            <p><strong className="text-slate-100">Reported:</strong> {selectedItemPin.eventDate || 'Recent'} {selectedItemPin.eventTime || ''}</p>
          </div>
        </div>
      )}

      {/* Selected Building Drawer */}
      {selectedBuilding && (
        <div className="absolute bottom-4 right-4 sm:w-84 bg-[#0b0f19]/95 backdrop-blur-md p-4 rounded-2xl border border-cyan-500/30 shadow-2xl z-20 animate-slideUp text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                <Building2 className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white font-heading">{selectedBuilding.name}</h4>
                <span className="text-[11px] font-semibold text-cyan-400">{selectedBuilding.category} &bull; NIE North</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedBuilding(null)}
              className="text-slate-400 hover:text-white text-sm font-bold px-1.5 py-0.5 cursor-pointer"
            >
              &times;
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            <strong className="text-slate-100">Campus Location:</strong> {selectedBuilding.name}
          </p>
          <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center text-xs">
            <span className="text-slate-400 text-[11px]">{selectedBuilding.itemCount || 0} items active</span>
            <button
              onClick={() => onLocationSelect?.(selectedBuilding.name)}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 cursor-pointer"
            >
              Select Place
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
