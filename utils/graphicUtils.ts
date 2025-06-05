import { GeometricShapeItem, GeometricShapeType } from '../types';
import { GEOMETRIC_SHAPE_TYPES, MIN_GEOMETRIC_SHAPES, MAX_GEOMETRIC_SHAPES, MIN_GEOMETRIC_SHAPE_SIZE_VW, MAX_GEOMETRIC_SHAPE_SIZE_VW, MIN_GEOMETRIC_SHAPE_OPACITY, MAX_GEOMETRIC_SHAPE_OPACITY } from '../constants';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

// --- Color Utilities ---
interface HSLColor { h: number; s: number; l: number; }

export const hexToHsl = (hex: string): HSLColor | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
};

export const hslToHex = (hsl: HSLColor): string => {
  let { h, s, l } = hsl;
  h /= 360; // Convert h to fraction
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const varyColor = (baseHexColor: string): string => {
  const hsl = hexToHsl(baseHexColor);
  if (!hsl) return baseHexColor; // Fallback

  // Allow more significant lightness variation, smaller saturation variation
  const lVariation = (Math.random() * 0.4) - 0.2; // -0.2 to +0.2
  const sVariation = (Math.random() * 0.2) - 0.1; // -0.1 to +0.1

  hsl.l = Math.max(0.1, Math.min(0.9, hsl.l + lVariation)); // Keep lightness reasonable
  hsl.s = Math.max(0, Math.min(1, hsl.s + sVariation));

  return hslToHex(hsl);
};

// --- SVG Polygon Point Calculation ---
export const calculatePolygonPoints = (
  shapeType: GeometricShapeType,
  cx: number,
  cy: number,
  size: number, // Represents circumradius
  rotation: number // In degrees
): string => {
  const points: { x: number; y: number }[] = [];
  let N: number; // Number of vertices

  switch (shapeType) {
    case 'triangle': N = 3; break;
    case 'square': N = 4; break;
    case 'pentagon': N = 5; break;
    case 'hexagon': N = 6; break;
    default: return ''; // Not a polygon or unknown
  }

  const angleStep = (2 * Math.PI) / N;
  // const rotationRad = rotation * (Math.PI / 180); // Rotation is handled by SVG transform
  
  // Adjust initial angle for some shapes to make them appear upright by default before rotation
  let initialAngleOffset = 0;
  if (shapeType === 'triangle') initialAngleOffset = -Math.PI / 2; // Point top up
  else if (shapeType === 'square') initialAngleOffset = Math.PI / 4; // Flat top
  else if (shapeType === 'pentagon') initialAngleOffset = -Math.PI / 2 + Math.PI / N ; // Point top up // Corrected for pentagon by removing one N division
  else if (shapeType === 'hexagon') initialAngleOffset = 0; // Flat top


  for (let i = 0; i < N; i++) {
    const angle = i * angleStep + initialAngleOffset;
    let x = cx + size * Math.cos(angle);
    let y = cy + size * Math.sin(angle);
    points.push({ x, y });
  }
  
  return points.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
};


// --- Generate Geometric Shapes ---
export const generateGeometricShapes = (
  baseColorForVariations: string,
  viewboxSize: number = 100, // Assuming a 100x100 viewbox for coordinates
  selectedShape?: GeometricShapeType | 'mixed'
): GeometricShapeItem[] => {
  const shapes: GeometricShapeItem[] = [];
  const numShapes = Math.floor(Math.random() * (MAX_GEOMETRIC_SHAPES - MIN_GEOMETRIC_SHAPES + 1)) + MIN_GEOMETRIC_SHAPES;

  for (let i = 0; i < numShapes; i++) {
    const shapeType = (selectedShape && selectedShape !== 'mixed') 
      ? selectedShape 
      : GEOMETRIC_SHAPE_TYPES[Math.floor(Math.random() * GEOMETRIC_SHAPE_TYPES.length)];
      
    const size = MIN_GEOMETRIC_SHAPE_SIZE_VW + Math.random() * (MAX_GEOMETRIC_SHAPE_SIZE_VW - MIN_GEOMETRIC_SHAPE_SIZE_VW);
    
    const buffer = size * 0.6; 
    const cx = Math.random() * (viewboxSize + buffer * 2) - buffer;
    const cy = Math.random() * (viewboxSize + buffer * 2) - buffer;
    
    const fill = varyColor(baseColorForVariations);
    const opacity = MIN_GEOMETRIC_SHAPE_OPACITY + Math.random() * (MAX_GEOMETRIC_SHAPE_OPACITY - MIN_GEOMETRIC_SHAPE_OPACITY);
    const rotation = Math.random() * 360;

    const shapeItem: GeometricShapeItem = {
      id: generateId(),
      shapeType,
      cx,
      cy,
      size,
      fill,
      opacity,
      rotation,
    };

    if (shapeType !== 'circle') {
      shapeItem.points = calculatePolygonPoints(shapeType, 0, 0, size, 0); 
    }
    shapes.push(shapeItem);
  }
  return shapes;
};