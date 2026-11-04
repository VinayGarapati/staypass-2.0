import React, { useState } from 'react';
import { Property } from '../models/types';
import { MapPin, Navigation, Plus, Minus, Compass, Copy, Bed, Layers, Globe } from 'lucide-react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

interface PropertyLocationMapCardProps {
  property: Property;
  onOpenDirections: () => void;
  onCopyAddress: () => void;
}

export const PropertyLocationMapCard: React.FC<PropertyLocationMapCardProps> = ({
  property,
  onOpenDirections,
  onCopyAddress,
}) => {
  const [mapType, setMapType] = useState<'google' | 'schematic'>('google');
  const [schematicMode, setSchematicMode] = useState<'map' | 'satellite'>('map');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const isHyderabad = property.city === 'Hyderabad';

  const defaultLat = property.latitude || (isHyderabad ? 17.4401 : 17.0005);
  const defaultLng = property.longitude || (isHyderabad ? 78.3489 : 81.7800);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyA9TwKHljg5xH6Q6DvpjeFeltDmD3DdqaM';

  return (
    <div className="bg-white rounded-2xl border border-[#C2C6D5]/50 overflow-hidden shadow-xs">
      {/* Location Header */}
      <div className="p-3 border-b border-[#F0F3FF] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#EA4335]" />
          <div>
            <h3 className="text-xs font-bold text-[#151C27]">Google Maps Pinned Location</h3>
            <p className="text-[10px] text-[#555E74]">{property.locality}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMapType(mapType === 'google' ? 'schematic' : 'google')}
            className="text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#246BCE]/30 bg-[#EBF3FE] text-[#246BCE] flex items-center gap-1 hover:bg-[#D7DFF9] transition-colors"
          >
            {mapType === 'google' ? (
              <>
                <Layers className="w-2.5 h-2.5" />
                <span>Schematic</span>
              </>
            ) : (
              <>
                <Globe className="w-2.5 h-2.5" />
                <span>Live Map</span>
              </>
            )}
          </button>
          <span className="text-[9px] font-semibold bg-[#F0F3FF] text-[#555E74] px-1.5 py-0.5 rounded">
            {isHyderabad ? 'HYD Tech Corridor' : 'RJY Central'}
          </span>
        </div>
      </div>

      {/* Interactive Map Viewport */}
      <div className="relative h-52 w-full overflow-hidden select-none bg-[#E8ECE9]">
        {mapType === 'google' && apiKey ? (
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={{ lat: defaultLat, lng: defaultLng }}
              defaultZoom={15}
              gestureHandling="greedy"
              disableDefaultUI={false}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              <Marker
                position={{ lat: defaultLat, lng: defaultLng }}
                title={`${property.name} (${property.locality})`}
              />
            </Map>
          </APIProvider>
        ) : (
          /* Schematic Vector SVG Canvas */
          <>
            <svg
              className="absolute inset-0 w-full h-full"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                transition: 'transform 0.25s ease-out',
              }}
              viewBox="0 0 360 200"
              preserveAspectRatio="none"
            >
              {schematicMode === 'satellite' ? (
                <>
                  <rect width="360" height="200" fill="#243322" />
                  <rect x="220" y="10" width="130" height="90" fill="#1C291A" rx="10" />
                  <rect x="10" y="110" width="140" height="80" fill="#182317" rx="8" />
                  {isHyderabad ? (
                    <path d="M 20 20 Q 80 10 110 50 T 70 120 T 10 70 Z" fill="#152430" />
                  ) : (
                    <path d="M 0 0 Q 70 60 110 130 T 150 200 L 0 200 Z" fill="#101F2B" />
                  )}
                  <path d="M 0 140 L 360 70" stroke="#3D453C" strokeWidth="12" fill="none" />
                  <path d="M 180 0 L 180 200" stroke="#4A5248" strokeWidth="8" fill="none" />
                </>
              ) : (
                <>
                  <rect width="360" height="200" fill="#F4F3F0" />
                  {isHyderabad ? (
                    <>
                      <path d="M 230 110 C 270 110 340 140 340 190 L 220 190 Z" fill="#CCEADA" />
                      <rect x="250" y="130" width="80" height="40" rx="6" fill="#BFE3CF" />
                      <text x="255" y="152" fill="#3D7D57" fontSize="8" fontWeight="600">
                        Bio-Diversity Park
                      </text>
                      <path
                        d="M 10 20 C 60 10 110 30 120 70 C 130 110 70 130 40 110 C 10 90 0 60 10 20 Z"
                        fill="#A5CBE6"
                      />
                      <text x="28" y="70" fill="#386A91" fontSize="8" fontWeight="600">
                        Durgam Cheruvu
                      </text>
                      <path d="M 0 150 L 360 80" stroke="#D3D8D0" strokeWidth="14" fill="none" />
                      <path d="M 0 150 L 360 80" stroke="#FFFFFF" strokeWidth="10" fill="none" />
                      <path d="M 175 0 L 175 200" stroke="#FBD0A3" strokeWidth="10" fill="none" />
                      <path d="M 175 0 L 175 200" stroke="#FDE5C7" strokeWidth="6" fill="none" />
                      <text x="180" y="25" fill="#C25E00" fontSize="7" fontWeight="bold">
                        Gachibowli Main Rd
                      </text>
                    </>
                  ) : (
                    <>
                      <path d="M 0 0 Q 70 60 110 130 T 150 200 L 0 200 Z" fill="#A8D0E6" />
                      <text x="20" y="100" fill="#2A5D7C" fontSize="9" fontWeight="bold">
                        River Godavari
                      </text>
                      <path d="M 30 100 Q 180 80 360 120" stroke="#D3D8D0" strokeWidth="10" fill="none" />
                      <path d="M 30 100 Q 180 80 360 120" stroke="#FFFFFF" strokeWidth="7" fill="none" />
                      <text x="200" y="90" fill="#5F6368" fontSize="8">
                        Godavari Fourth Bridge Rd
                      </text>
                    </>
                  )}
                </>
              )}
            </svg>

            {/* Centered Property Marker Pin */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="flex flex-col items-center -translate-y-4">
                <div className="bg-[#151C27] text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1.5 whitespace-nowrap mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#198754]" />
                  <span>{property.name.split(' ')[0]} (Verified)</span>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="absolute w-8 h-8 rounded-full bg-[#EA4335]/30 animate-ping" />
                  <div className="w-7 h-7 rounded-full bg-[#EA4335] text-white flex items-center justify-center shadow-lg border-2 border-white">
                    <Bed className="w-3.5 h-3.5" />
                  </div>
                  <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#EA4335] rotate-45" />
                </div>
              </div>
            </div>

            {/* Schematic Overlay Controls */}
            <div className="absolute top-2 left-2 z-10 flex gap-1">
              <button
                onClick={() => setSchematicMode('map')}
                className={`px-2 py-0.5 rounded text-[9px] font-bold shadow-xs ${
                  schematicMode === 'map' ? 'bg-white text-[#151C27]' : 'bg-black/40 text-white'
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setSchematicMode('satellite')}
                className={`px-2 py-0.5 rounded text-[9px] font-bold shadow-xs ${
                  schematicMode === 'satellite' ? 'bg-white text-[#151C27]' : 'bg-black/40 text-white'
                }`}
              >
                Satellite
              </button>
            </div>

            <div className="absolute bottom-2 right-2 z-10 flex flex-col gap-1">
              <button
                onClick={() => setZoomLevel(Math.min(zoomLevel + 0.25, 2.0))}
                className="w-6 h-6 rounded bg-white/90 text-[#151C27] shadow-sm flex items-center justify-center hover:bg-white text-xs font-bold"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={() => setZoomLevel(Math.max(zoomLevel - 0.25, 0.8))}
                className="w-6 h-6 rounded bg-white/90 text-[#151C27] shadow-sm flex items-center justify-center hover:bg-white text-xs font-bold"
              >
                <Minus className="w-3 h-3" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Map Action Strip */}
      <div className="p-3 bg-white space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-[#151C27]">
            <Navigation className="w-3.5 h-3.5 text-[#246BCE]" />
            <span className="font-bold">{property.distance}</span>
          </div>
          <span className="text-[10px] text-[#555E74]">
            {isHyderabad ? 'Near DLF Cybercity & Raidurg' : 'Near Arts College & Danavaipeta'}
          </span>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onOpenDirections}
            className="flex-1 py-2 bg-[#246BCE] text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#1B54A6] transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Get Directions</span>
          </button>
          <button
            onClick={onCopyAddress}
            className="px-3 py-2 border border-[#C2C6D5]/60 text-[#555E74] rounded-xl font-medium text-[11px] hover:bg-[#F0F3FF] transition-colors flex items-center gap-1"
          >
            <Copy className="w-3 h-3" />
            <span>Copy Address</span>
          </button>
        </div>
      </div>
    </div>
  );
};
