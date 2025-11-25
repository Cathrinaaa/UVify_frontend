// src/components/UVGauge.jsx
import React from 'react';

const UVGauge = ({ value, size = 200 }) => {
  const getColor = (uvValue) => {
    if (uvValue <= 2) return 'green';
    if (uvValue <= 5) return 'yellow';
    if (uvValue <= 7) return 'orange';
    if (uvValue <= 10) return 'red';
    return 'purple';
  };

  const percentage = Math.min((value / 12) * 100, 100);
  const color = getColor(value);

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative rounded-full border-8 flex items-center justify-center"
        style={{
          width: size,
          height: size,
          borderColor: '#e5e7eb',
          background: `conic-gradient(${color} 0% ${percentage}%, #e5e7eb ${percentage}% 100%)`
        }}
      >
        <div className="absolute bg-white rounded-full" style={{ width: size - 30, height: size - 30 }}>
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-3xl font-bold" style={{ color }}>{value.toFixed(1)}</span>
            <span className="text-sm text-gray-600">UV Index</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UVGauge;
