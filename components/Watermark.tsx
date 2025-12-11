import React from 'react';

interface WatermarkProps {
  text?: string;
  opacity?: number;
  rotate?: number;
  fontSize?: string;
  color?: string;
}

const Watermark: React.FC<WatermarkProps> = ({
  text = 'BaraCV',
  opacity = 0.15, // Increased base opacity
  rotate = -30,
  fontSize = '4.5rem', // Slightly larger text
  color = '#666666', // Darker default color for better visibility
}) => {
  return (
    <div 
      className="watermark"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      {/* Diagonal pattern */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `repeating-linear-gradient(
            ${rotate}deg,
            ${color},
            ${color} 1px,
            transparent 2px,
            transparent 200px
          )`,
          opacity: opacity * 1.5, // Slightly reduced pattern opacity
          backgroundSize: '300px 300px',
        }}
      />
      
      {/* Centered text */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-30deg)',
          fontSize: fontSize,
          fontWeight: 'bold',
          color: color,
          opacity: opacity * 4, // Increased text opacity
          background: 'rgba(255, 255, 255, 0.7)', // Light background for better contrast
          borderRadius: '8px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          userSelect: 'none',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
          textAlign: 'center',
          width: '100%',
          lineHeight: '1.2',
          wordBreak: 'break-word',
          padding: '2rem',
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default Watermark;
