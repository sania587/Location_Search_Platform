import React from 'react';
import MapComponent from './components/MapComponent';
import './index.css';

const App = () => {
  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <MapComponent />
    </div>
  );
};

export default App;
