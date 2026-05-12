import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import Select from 'react-select';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import PAK_adm3 from '../data/PAK_adm3.json';

// Fix for default marker icon in Leaflet + Webpack/Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to center map on coordinates
const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 10, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
};

const MapComponent = () => {
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [mapCenter, setMapCenter] = useState([30.3753, 69.3451]);
  const [zoom, setZoom] = useState(6);

  // Filter out regions with valid coordinates
  const validFeatures = PAK_adm3.features.filter((feature) => {
    const coords = feature.geometry.coordinates;
    return coords && coords.length > 0;
  });

  const selectOptions = validFeatures.map(f => ({
    value: f.properties.NAME_3,
    label: f.properties.NAME_3,
    feature: f
  }));

  const getRandomColor = () => {
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleRegionSelect = (option) => {
    if (!option) return;
    const feature = option.feature;
    const coords = feature.geometry.coordinates[0][0];
    
    if (coords && coords.length >= 2) {
      const latLng = [coords[1], coords[0]];
      setMapCenter(latLng);
      setZoom(10);
      setErrorMessage('');

      // Avoid duplicates
      if (!selectedRegions.find(r => r.feature.properties.NAME_3 === feature.properties.NAME_3)) {
        setSelectedRegions([...selectedRegions, {
          feature,
          color: getRandomColor()
        }]);
      }
    } else {
      setErrorMessage('Location data unavailable for this region.');
    }
  };

  const getRegionStyle = (feature) => {
    const isSelected = selectedRegions.find(r => r.feature.properties.NAME_3 === feature.properties.NAME_3);
    return {
      weight: isSelected ? 3 : 1,
      opacity: 0.8,
      color: isSelected ? isSelected.color : 'rgba(255,255,255,0.2)',
      fillOpacity: isSelected ? 0.4 : 0.05,
      fillColor: isSelected ? isSelected.color : 'transparent',
    };
  };

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      background: 'rgba(15, 23, 42, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '4px',
      color: '#fff',
      boxShadow: 'none',
      '&:hover': { borderColor: '#6366f1' }
    }),
    menu: (base) => ({
      ...base,
      background: '#1e293b',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      overflow: 'hidden'
    }),
    option: (base, { isFocused }) => ({
      ...base,
      background: isFocused ? '#6366f1' : 'transparent',
      color: '#fff',
      cursor: 'pointer'
    }),
    singleValue: (base) => ({ ...base, color: '#fff' }),
    input: (base) => ({ ...base, color: '#fff' })
  };

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* Sidebar UI */}
      <div className="glass" style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        width: '320px',
        maxHeight: '90vh',
        borderRadius: '24px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Location Platform</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Pakistan Regional Explorer</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SEARCH REGION</label>
          <Select
            options={selectOptions}
            onChange={handleRegionSelect}
            styles={customSelectStyles}
            placeholder="Select a region..."
            isClearable
          />
        </div>

        {errorMessage && (
          <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SELECTED LOCATIONS</label>
          {selectedRegions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
              No regions selected yet.
            </div>
          ) : (
            selectedRegions.map((region, idx) => (
              <div key={idx} style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '16px',
                borderRadius: '16px',
                borderLeft: `4px solid ${region.color}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700 }}>{region.feature.properties.NAME_3}</span>
                  <button 
                    onClick={() => setSelectedRegions(selectedRegions.filter((_, i) => i !== idx))}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}
                  >×</button>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {region.feature.properties.GID_3}</span>
              </div>
            ))
          )}
        </div>

        <button 
          onClick={() => setSelectedRegions([])}
          style={{
            padding: '12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
        >
          Clear All
        </button>
      </div>

      {/* Map Display */}
      <MapContainer 
        style={{ height: '100%', width: '100%' }} 
        center={mapCenter} 
        zoom={zoom}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <RecenterMap center={mapCenter} zoom={zoom} />
        
        {PAK_adm3 && (
          <GeoJSON
            data={PAK_adm3}
            style={getRegionStyle}
            onEachFeature={(feature, layer) => {
              layer.on({
                mouseover: (e) => {
                  const layer = e.target;
                  layer.setStyle({ fillOpacity: 0.2, weight: 2 });
                },
                mouseout: (e) => {
                  const layer = e.target;
                  const isSelected = selectedRegions.find(r => r.feature.properties.NAME_3 === feature.properties.NAME_3);
                  layer.setStyle({
                    fillOpacity: isSelected ? 0.4 : 0.05,
                    weight: isSelected ? 3 : 1
                  });
                },
                click: () => {
                  handleRegionSelect({ value: feature.properties.NAME_3, feature });
                },
              });
            }}
          />
        )}

        {selectedRegions.map((region, index) => {
          const coords = region.feature.geometry.coordinates[0][0];
          return (
            <Marker
              key={index}
              position={[coords[1], coords[0]]}
            >
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <strong style={{ display: 'block', fontSize: '1rem', color: region.color }}>{region.feature.properties.NAME_3}</strong>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Admin Region</span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
