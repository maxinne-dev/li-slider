import type { PaletteMode } from '@mui/material';

export enum FontFamily {
  Lato = 'Lato',
  Montserrat = 'Montserrat',
  OpenSans = 'Open Sans',
  Roboto = 'Roboto',
  PlayfairDisplay = 'Playfair Display',
  SourceCodePro = 'Source Code Pro',
  Poppins = 'Poppins', // Added Poppins
}

export interface FontOption {
  name: string;
  value: FontFamily;
  className: string;
}

export enum DecorationType {
  NONE = 'NONE',
  CORNER_ELEMENT_TOP_LEFT = 'CORNER_ELEMENT_TOP_LEFT',
  CORNER_ELEMENT_BOTTOM_RIGHT = 'CORNER_ELEMENT_BOTTOM_RIGHT',
  BORDER_SIMPLE = 'BORDER_SIMPLE',
  CORNER_ELEMENT_TOP_RIGHT = 'CORNER_ELEMENT_TOP_RIGHT',
  CORNER_ELEMENT_BOTTOM_LEFT = 'CORNER_ELEMENT_BOTTOM_LEFT',
  CORNER_SELECTOR = 'CORNER_SELECTOR', // UI Grouping type
  BLOB_SELECTOR = 'BLOB_SELECTOR', // UI Grouping type for blobs
  CORNER_BLOB_TOP_LEFT = 'CORNER_BLOB_TOP_LEFT',
  CORNER_BLOB_TOP_RIGHT = 'CORNER_BLOB_TOP_RIGHT',
  CORNER_BLOB_BOTTOM_LEFT = 'CORNER_BLOB_BOTTOM_LEFT',
  CORNER_BLOB_BOTTOM_RIGHT = 'CORNER_BLOB_BOTTOM_RIGHT',
  GEOMETRIC_BACKGROUND = 'GEOMETRIC_BACKGROUND', 
}

export type GeometricShapeType = 'circle' | 'triangle' | 'square' | 'pentagon' | 'hexagon';

export interface GeometricShapeItem {
  id: string;
  shapeType: GeometricShapeType;
  cx: number; 
  cy: number; 
  size: number; 
  fill: string; 
  opacity: number;
  rotation: number; 
  points?: string; 
}

export interface Decoration {
  id: string;
  type: DecorationType;
  color: string; 
  secondaryColor?: string; 
  showPageNumber?: boolean;
  borderSides?: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  borderWidth?: number; 
  blobGrowth?: number; 
  blobEdges?: number; 
  blobPathData?: string; 
  geometricShapes?: GeometricShapeItem[];
  selectedShapeType?: GeometricShapeType | 'mixed'; 
  visibleShapeCount?: number; 
}

export interface DecorationOption {
  id: DecorationType;
  name: string;
  preview: React.ReactNode;
  previewContainerClassName?: string;
}


export enum TextElementType {
  TITLE = 'TITLE',
  SUBTITLE = 'SUBTITLE',
  BODY = 'BODY',
  CAPTION = 'CAPTION',
}

export interface TextElement {
  id: string;
  type: TextElementType;
  content: string;
  fontFamily: FontFamily;
  fontSize: number; // in px
  color: string;
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  textAlign: 'left' | 'center' | 'right';
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  zIndex?: number; 
}

export enum TextTemplateType {
  BLANK = 'BLANK',
  TITLE_ONLY = 'TITLE_ONLY',
  TITLE_SUBTITLE = 'TITLE_SUBTITLE',
  TITLE_BODY = 'TITLE_BODY',
  QUOTE_AUTHOR = 'QUOTE_AUTHOR',
}

export interface TextTemplate {
  id: TextTemplateType;
  name: string;
  elements: Omit<TextElement, 'id' | 'content' | 'color'>[]; 
}

export interface SlideThemePalette {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  backgroundColor: string;
  textColor: string;
  decorationColor: string;
}

export interface SlideImage {
  id: string;
  src: string; 
  alt: string;
  originalWidth: number;
  originalHeight: number;
  x: number; 
  y: number; 
  width: number; 
  height: number; 
  zIndex?: number; 
}

export interface Slide {
  id: string;
  backgroundColor: string;
  decorations: Decoration[];
  textElements: TextElement[];
  image?: SlideImage;
  thumbnailSrc?: string | null;
}

export interface ExposedWindow extends Window {
  jspdf?: any;
  html2canvas?: any;
}

export type ThemeMode = PaletteMode; // 'light' | 'dark'

export interface AppThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

export type SelectedElementInfo = {
  id: string;
  type: 'text' | 'image';
} | null;

export type AspectRatio = '1:1' | '4:5' | '3:4';

export interface SlideDimensions {
  width: number;
  height: number;
}

export interface SlideSizeOption {
  value: SlideDimensions;
  label: string;
}
