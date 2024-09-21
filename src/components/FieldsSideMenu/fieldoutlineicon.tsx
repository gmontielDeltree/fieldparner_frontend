import React from 'react';
import { Field } from "../../interfaces/field";

interface FieldOutlineIconProps {
  field: Field;
  size?: number;
}

const FieldOutlineIcon: React.FC<FieldOutlineIconProps> = ({ field, size = 24 }) => {
  const getPathFromGeometry = (geometry: any) => {
    if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) {
      console.error('Invalid geometry:', geometry);
      return '';
    }

    if (geometry.type === 'Polygon') {
      const coordinates = geometry.coordinates[0];
      if (coordinates.length < 3) {
        console.error('Invalid polygon: less than 3 points', coordinates);
        return '';
      }
      const path = coordinates.map((coord: number[], index: number) => 
        `${index === 0 ? 'M' : 'L'} ${coord[0]} ${coord[1]}`
      ).join(' ');
      return path + ' Z';
    }
    console.error('Unsupported geometry type:', geometry.type);
    return '';
  };

  const getBoundsFromGeometry = (geometry: any) => {
    if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) {
      return { minX: 0, minY: 0, maxX: 1, maxY: 1 };
    }

    const coords = geometry.coordinates[0];
    return coords.reduce((acc: any, coord: number[]) => {
      return {
        minX: Math.min(acc.minX, coord[0]),
        minY: Math.min(acc.minY, coord[1]),
        maxX: Math.max(acc.maxX, coord[0]),
        maxY: Math.max(acc.maxY, coord[1]),
      };
    }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
  };

  const path = getPathFromGeometry(field.campo_geojson.geometry);
  const bounds = getBoundsFromGeometry(field.campo_geojson.geometry);

  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const scale = Math.min(size / width, size / height) * 0.7; // 0.7 to leave space for background elements
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  if (!path) {
    // Fallback to a simple square if no valid path is generated
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill="#E2E8F0" />
        <text x={size/2} y={size/2} textAnchor="middle" fill="#718096" fontSize="8">Error</text>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#868a8f" /> {/* Very Light Gray */}
          <stop offset="100%" stopColor="#a1a5ab" /> {/* Light Gray */}
        </linearGradient>
        <linearGradient id="fieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FC8181" stopOpacity="0.8" /> {/* Light Red */}
          <stop offset="100%" stopColor="#F56565" stopOpacity="0.8" /> {/* Medium Red */}
        </linearGradient>
        <filter id="dropShadow" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1"/> 
          <feOffset dx="0" dy="1" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge> 
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
      </defs>
      
      {/* Background */}
      <rect width={size} height={size} fill="url(#bgGradient)" rx="4" ry="4" />
      
      {/* Decorative elements */}
      <circle cx={size * 0.15} cy={size * 0.15} r={size * 0.08} fill="#CBD5E0" opacity="0.5" />
      <circle cx={size * 0.85} cy={size * 0.85} r={size * 0.08} fill="#CBD5E0" opacity="0.5" />

      {/* Field shape */}
      <g transform={`translate(${size/2},${size/2}) scale(${scale}) translate(${-centerX},${-centerY})`}
         filter="url(#dropShadow)">
        <path
          d={path}
          fill="url(#fieldGradient)"
          stroke="#E53E3E" // Darker Red for the main outline
          strokeWidth={3 / scale}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d={path}
          fill="none"
          stroke="#FFFFFF" // White for the animated line
          strokeWidth={1.5 / scale}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={`${4 / scale},${4 / scale}`}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to={8 / scale}
            dur="2s"
            repeatCount="indefinite"
          />
        </path>
      </g>
    </svg>
  );
};

export default FieldOutlineIcon;