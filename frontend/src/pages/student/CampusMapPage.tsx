import React, { useState, useEffect } from 'react';
import { CampusMap } from '../../components/maps/CampusMap';
import { CampusLocation } from '../../types';
import { api } from '../../lib/api';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { 
  MapPin, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  Building, 
  Compass,
  Filter,
  Info
} from 'lucide-react';

export const CampusMapPage: React.FC = () => {
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    async function loadLocations() {
      try {
        const data = await api.locations.list();
        if (Array.isArray(data)) {
          setLocations(data);
        }
      } catch (err) {
        console.warn('Failed to load campus locations:', err);
      }
    }
    loadLocations();
  }, []);

  const filteredLocations = selectedCategory === 'ALL'
    ? locations
    : locations.filter(loc => loc.zone === selectedCategory || (selectedCategory === 'KIOSKS' && loc.hasCollectionDesk));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sahayak-blue-ice text-sahayak-blue font-semibold text-xs mb-1">
            <Compass className="w-3.5 h-3.5 text-sahayak-gold" />
            <span>Geo-Spatial Recovery Mesh</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-sahayak-blue-deep">
            NIE North Campus Map
          </h1>
          <p className="text-xs sm:text-sm text-sahayak-text-secondary">
            Explore lost & found density hotspots, secure custody lockers, and official proctor collection desks.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'Academic', 'Library & Reading', 'Dining & Social', 'KIOSKS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-sahayak-blue text-white shadow-neumorph-sm'
                  : 'bg-sahayak-cream-soft border border-sahayak-brown/15 text-sahayak-text-secondary hover:border-sahayak-blue'
              }`}
            >
              {cat === 'KIOSKS' ? 'Official Security Desks' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Map Component */}
      <CampusMap />

      {/* Campus Zones Quick Directory */}
      <div className="space-y-3">
        <h3 className="font-heading font-bold text-sm text-sahayak-blue-deep uppercase tracking-wider">
          Campus Collection Points & Custody Lockers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredLocations.map((loc) => (
            <NeumorphicCard key={loc.id} className="p-4 border border-sahayak-brown/15 space-y-2">
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-xl bg-sahayak-blue-ice text-sahayak-blue">
                  <Building className="w-4 h-4" />
                </div>
                {loc.hasCollectionDesk && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sahayak-success-soft text-sahayak-success">
                    Active Desk
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-heading font-bold text-sm text-sahayak-text-primary">{loc.name}</h4>
                <p className="text-xs text-sahayak-text-muted">{loc.zone}</p>
              </div>

              <div className="pt-2 border-t border-sahayak-brown/10 flex justify-between text-xs font-semibold">
                <span className="text-sahayak-text-secondary">Incident Reports:</span>
                <span className="text-sahayak-blue font-bold">{loc.itemCount}</span>
              </div>
            </NeumorphicCard>
          ))}
        </div>
      </div>
    </div>
  );
};
