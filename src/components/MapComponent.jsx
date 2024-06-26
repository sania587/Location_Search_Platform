import React, { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import PAK_adm3 from '../data/PAK_adm3.json';

const MapComponent = () => {
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [searchedCoordinates, setSearchedCoordinates] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    // Filter out regions with null coordinates
    const validFeatures = PAK_adm3.features.filter((feature) => {
        const coordinates = feature.geometry.coordinates;
        return coordinates && coordinates.length > 0 && coordinates[0].length > 0 && coordinates[0][0].length >= 2;
    });

    const getRandomColor = () => {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    };

    // Function to handle selection of a sub-sub-region
    const handleSubSubRegionSelect = (selectedName) => {
        const selectedFeature = validFeatures.find(
            (feature) => feature.properties.NAME_3 === selectedName
        );

        if (selectedFeature) {
            const coordinates = selectedFeature.geometry.coordinates[0][0];
            if (coordinates && coordinates.length >= 2) {
                setSearchedCoordinates([coordinates[1], coordinates[0]]);
                setErrorMessage(''); // Clear any previous error messages

                // Add selected region to the list with a random color
                const newRegion = {
                    feature: selectedFeature,
                    color: getRandomColor(),
                };
                setSelectedRegions([...selectedRegions, newRegion]);
            } else {
                setSearchedCoordinates(null);
                setErrorMessage('Coordinates not found for the selected region.');
            }
        } else {
            setErrorMessage('Selected region not found.');
        }
    };

    const getRegionStyle = (feature) => {
        const selectedRegion = selectedRegions.find(
            (region) => region.feature.properties.NAME_3 === feature.properties.NAME_3
        );

        return {
            weight: 2,
            opacity: 1,
            fillOpacity: 0.7,
            color: selectedRegion ? selectedRegion.color : 'transparent',
            fillColor: 'transparent',
        };
    };

    return (
        <div>
            <h2 style={{ textAlign: 'center' }}>Region Highlighting</h2>
            {/* Dropdown for selecting sub-sub-region */}
            <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <label>
                    Select Region:
                    <select
                        value={''} // Clear the selection after adding to the list
                        onChange={(e) => handleSubSubRegionSelect(e.target.value)}
                    >
                        <option value="">Select Region</option>
                        {validFeatures.map((feature, index) => (
                            <option key={index} value={feature.properties.NAME_3}>
                                {feature.properties.NAME_3}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            {/* Error message */}
            {errorMessage && <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>}
            {/* Selected region/sub-region/sub-sub-region details */}
            {selectedRegions.length > 0 && (
                <div className="selected-regions">
                    <h3>Selected Regions:</h3>
                    <ul>
                        {selectedRegions.map((region, index) => (
                            <li key={index}>
                                <p>Region name: <b>{region.feature.properties.NAME_3}</b></p>
                                <p>GID: <b>{region.feature.properties.GID_3}</b></p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <MapContainer style={{ height: '600px', width: '100%' }} center={[30.3753, 69.3451]} zoom={6}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* GeoJSON layer for regions */}
                {PAK_adm3 && (
                    <GeoJSON
                        data={PAK_adm3}
                        style={getRegionStyle}
                        onEachFeature={(feature, layer) => {
                            layer.on({
                                click: () => {
                                    handleSubSubRegionSelect(feature.properties.NAME_3);
                                },
                            });
                        }}
                    />
                )}
                {/* Markers for selected regions */}
                {selectedRegions.map((region, index) => (
                    <Marker
                        key={index}
                        position={[region.feature.geometry.coordinates[0][0][1], region.feature.geometry.coordinates[0][0][0]]}
                    >
                        <Popup>
                            {region.feature.properties.NAME_3}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
