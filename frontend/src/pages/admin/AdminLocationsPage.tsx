import React, { useState, useEffect } from 'react';
import { CampusMap } from '../../components/maps/CampusMap';
import { CampusLocation } from '../../types';
import { api } from '../../lib/api';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { 
  MapPin, 
  Building, 
  Layers, 
  TrendingUp, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export const AdminLocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<CampusLocation[]>([]);

  useEffect(() => {
    async function loadLocations() {
      try {
        const data = await api.locations.list();
        if (Array.isArray(data)) {
          setLocations(data);
        }
      } catch (err) {
        console.warn('Failed to fetch admin locations:', err);
      }
    }
    loadLocations();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-blue-ice text-sahayak-blue font-semibold text-xs mb-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>Spatial Intelligence</span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
          Campus Location Heatmap & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-sahayak-text-secondary">
          Incident hotspots, custody locker capacity, and physical recovery efficiency across NIE North.
        </p>
      </div>

      {/* Map Component */}
      <CampusMap />

      {/* Building Hotspot Analysis Grid */}
      <div className="space-y-3">
        <h2 className="font-heading font-bold text-lg text-sahayak-blue-deep">
          Zone Density Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {locations.map((loc) => (
            <NeumorphicCard key={loc.id} className="p-4 border border-sahayak-brown/15 space-y-3">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-xl bg-sahayak-blue-ice text-sahayak-blue">
                  <Building className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sahayak-blue text-white">
                  {loc.itemCount} Incidents
                </span>
              </div>

              <div>
                <h4 className="font-heading font-bold text-sm text-sahayak-text-primary">{loc.name}</h4>
                <p className="text-xs text-sahayak-text-muted">{loc.zone}</p>
              </div>

              <div className="pt-2 border-t border-sahayak-brown/10 text-xs flex justify-between">
                <span className="text-sahayak-text-muted">Locker Desk:</span>
                <span className="font-bold text-sahayak-success">{loc.hasCollectionDesk ? 'Operational' : 'Mobile'}</span>
              </div>
            </NeumorphicCard>
          ))}
        </div>
      </div>
    </div>
  );
};
