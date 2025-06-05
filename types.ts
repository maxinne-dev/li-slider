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
  // Add blob corner types
  CORNER_BLOB_TOP_LEFT = 'CORNER_BLOB_TOP_LEFT',
  CORNER_BLOB_TOP_RIGHT = 'CORNER_BLOB_TOP_RIGHT',
  CORNER_BLOB_BOTTOM_LEFT = 'CORNER_BLOB_BOTTOM_LEFT',
  CORNER_BLOB_BOTTOM_RIGHT = 'CORNER_BLOB_BOTTOM_RIGHT',
}

export interface Decoration {
  id: string;
  type: DecorationType;
  color: string; // Primary color for the decoration
  secondaryColor?: string; // Optional secondary color
  showPageNumber?: boolean;
  // Properties specific to BORDER_SIMPLE
  borderSides?: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  borderWidth?: number; // in px
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
  zIndex?: number; // Optional zIndex, defaults to 10 for text
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
  elements: Omit<TextElement, 'id' | 'content' | 'color'>[]; // color will be from theme
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
  src: string; // data URL
  alt: string;
  originalWidth: number;
  originalHeight: number;
  x: number; // percentage, top-left
  y: number; // percentage, top-left
  width: number; // percentage, width of the image's container on the slide
  height: number; // percentage, height of the image's container on the slide
  zIndex?: number; // Optional zIndex, defaults to 1 for image
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