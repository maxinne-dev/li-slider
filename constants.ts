import React from 'react';
import { FontOption, FontFamily, DecorationOption, DecorationType, TextTemplate, TextTemplateType, TextElementType, SlideThemePalette } from './types';
import blobshape from 'blobshape';

export const AVAILABLE_FONTS: FontOption[] = [
  { name: 'Lato', value: FontFamily.Lato, className: 'font-lato' },
  { name: 'Montserrat', value: FontFamily.Montserrat, className: 'font-montserrat' },
  { name: 'Open Sans', value: FontFamily.OpenSans, className: 'font-open-sans' },
  { name: 'Poppins', value: FontFamily.Poppins, className: 'font-poppins' }, // Added Poppins
  { name: 'Roboto', value: FontFamily.Roboto, className: 'font-roboto' },
  { name: 'Playfair Display', value: FontFamily.PlayfairDisplay, className: 'font-playfair-display' },
  { name: 'Source Code Pro', value: FontFamily.SourceCodePro, className: 'font-source-code-pro' },
];

export const FONT_SIZE_OPTIONS: { value: number; label: string }[] = [
  { value: 12, label: '12px' },
  { value: 14, label: '14px' },
  { value: 16, label: '16px' },
  { value: 18, label: '18px' },
  { value: 20, label: '20px' },
  { value: 24, label: '24px' },
  { value: 28, label: '28px' },
  { value: 32, label: '32px' },
  { value: 36, label: '36px' },
  { value: 40, label: '40px' },
  { value: 48, label: '48px' },
  { value: 56, label: '56px' },
  { value: 64, label: '64px' },
  { value: 72, label: '72px' },
];

export const SLIDE_SIZE_OPTIONS: { value: number; label: string }[] = [
  { value: 400, label: '400x400px' },
  { value: 500, label: '500x500px' },
  { value: 600, label: '600x600px' },
  { value: 700, label: '700x700px' },
  { value: 800, label: '800x800px' },
  { value: 900, label: '900x900px' },
  { value: 1000, label: '1000x1000px' },
  { value: 1080, label: '1080x1080px' },
];


const previewShapeColor = "#cbd5e1";
const previewBorderColor = "#cbd5e1";

// Add new DecorationTypes for each blob corner
export enum BlobCornerDecorationType {
  CORNER_BLOB_TOP_LEFT = 'CORNER_BLOB_TOP_LEFT',
  CORNER_BLOB_TOP_RIGHT = 'CORNER_BLOB_TOP_RIGHT',
  CORNER_BLOB_BOTTOM_LEFT = 'CORNER_BLOB_BOTTOM_LEFT',
  CORNER_BLOB_BOTTOM_RIGHT = 'CORNER_BLOB_BOTTOM_RIGHT',
}

// Generate a blob path for preview (edge: 20, growth: 5)
const blobPreview = blobshape({ edge: 20, growth: 5 });
const blobPath = blobPreview.path;

export const DECORATION_OPTIONS: DecorationOption[] = [
  {
    id: DecorationType.NONE,
    name: 'None',
    preview: React.createElement('div', { className: 'w-full h-full flex items-center justify-center text-xs' }, 'None'),
    previewContainerClassName: 'bg-opacity-50'
  },
  {
    id: DecorationType.CORNER_SELECTOR, name: 'Corner Shape',
    preview: React.createElement('svg', { width: '100%', height: '100%', viewBox: '0 0 20 20', 'aria-hidden': true },
      React.createElement('path', {
        d: 'M2,2 L8,2 L2,8 Z M18,2 L12,2 L18,8 Z M2,18 L8,18 L2,12 Z M18,18 L12,18 L18,12 Z',
        fill: previewShapeColor,
        stroke: previewShapeColor,
        strokeWidth: 0.5
      })
    ),
    previewContainerClassName: 'bg-opacity-20'
  },
  // --- New Corner Blob Option (acts as a selector for blob corners) ---
  {
    id: 'CORNER_BLOB_SELECTOR' as any, name: 'Corner Blob',
    preview: React.createElement('svg', { width: '100%', height: '100%', viewBox: '0 0 40 40', 'aria-hidden': true },
      React.createElement('g', { transform: 'scale(0.5)' },
        React.createElement('path', {
          d: blobPath,
          fill: previewShapeColor,
          stroke: previewShapeColor,
          strokeWidth: 0.5,
        })
      )
    ),
    previewContainerClassName: 'bg-opacity-20'
  },
  {
    id: DecorationType.BORDER_SIMPLE, name: 'Simple Border',
    preview: React.createElement('div', { className: 'w-full h-full box-border', style: {border: `2px solid ${previewBorderColor}`} }),
    previewContainerClassName: 'bg-opacity-20'
  }
];

// Add blob corner options for each corner
export const CORNER_BLOB_TYPES_OPTIONS = [
  { type: BlobCornerDecorationType.CORNER_BLOB_TOP_LEFT, label: 'Top-Left Blob', icon: '◸' },
  { type: BlobCornerDecorationType.CORNER_BLOB_TOP_RIGHT, label: 'Top-Right Blob', icon: '◹' },
  { type: BlobCornerDecorationType.CORNER_BLOB_BOTTOM_LEFT, label: 'Bottom-Left Blob', icon: '◺' },
  { type: BlobCornerDecorationType.CORNER_BLOB_BOTTOM_RIGHT, label: 'Bottom-Right Blob', icon: '◿' },
];

export const CORNER_TYPES_OPTIONS = [
  { type: DecorationType.CORNER_ELEMENT_TOP_LEFT, label: 'Top-Left Corner', icon: '◸' },
  { type: DecorationType.CORNER_ELEMENT_TOP_RIGHT, label: 'Top-Right Corner', icon: '◹' },
  { type: DecorationType.CORNER_ELEMENT_BOTTOM_LEFT, label: 'Bottom-Left Corner', icon: '◺' },
  { type: DecorationType.CORNER_ELEMENT_BOTTOM_RIGHT, label: 'Bottom-Right Corner', icon: '◿' },
];

export const BORDER_THICKNESS_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: '1px' },
  { value: 2, label: '2px' },
  { value: 3, label: '3px' },
  { value: 4, label: '4px' },
  { value: 8, label: '8px' },
  { value: 9, label: '9px' },
  { value: 16, label: '16px' },
  { value: 27, label: '27px' },
  { value: 32, label: '32px' },
  { value: 64, label: '64px' },
];
export const DEFAULT_BORDER_WIDTH = 4;


export const SLIDE_THEMES: SlideThemePalette[] = [
  { id: 'classic-light', name: 'Classic Light', mode: 'light', backgroundColor: '#FFFFFF', textColor: '#212121', decorationColor: '#757575' },
  { id: 'soft-blue', name: 'Soft Blue', mode: 'light', backgroundColor: '#E3F2FD', textColor: '#0D47A1', decorationColor: '#64B5F6' },
  { id: 'warm-sand', name: 'Warm Sand', mode: 'light', backgroundColor: '#FFF8E1', textColor: '#D84315', decorationColor: '#FFAB40' },
  { id: 'minty-fresh', name: 'Minty Fresh', mode: 'light', backgroundColor: '#E0F2F1', textColor: '#00695C', decorationColor: '#4DB6AC' },
  { id: 'deep-space', name: 'Deep Space', mode: 'dark', backgroundColor: '#263238', textColor: '#ECEFF1', decorationColor: '#546E7A' },
  { id: 'cyber-purple', name: 'Cyber Purple', mode: 'dark', backgroundColor: '#311B92', textColor: '#EDE7F6', decorationColor: '#B39DDB' },
  { id: 'forest-night', name: 'Forest Night', mode: 'dark', backgroundColor: '#2E7D32', textColor: '#E8F5E9', decorationColor: '#A5D6A7' },
  { id: 'charcoal-rose', name: 'Charcoal Rose', mode: 'dark', backgroundColor: '#424242', textColor: '#FCE4EC', decorationColor: '#F48FB1' },
];

const DEFAULT_SLIDE_THEME = SLIDE_THEMES[0]; // Classic Light

const defaultTextStyles = {
  fontWeight: 'normal' as 'normal' | 'bold',
  fontStyle: 'normal' as 'normal' | 'italic',
  textDecoration: 'none' as 'none' | 'underline',
};

export const TEXT_TEMPLATES: TextTemplate[] = [
  {
    id: TextTemplateType.BLANK, name: 'Blank', elements: []
  },
  {
    id: TextTemplateType.TITLE_ONLY, name: 'Title Only', elements: [
      { type: TextElementType.TITLE, fontFamily: FontFamily.Montserrat, fontSize: 48, x: 10, y: 35, width: 80, textAlign: 'center', ...defaultTextStyles }
    ]
  },
  {
    id: TextTemplateType.TITLE_SUBTITLE, name: 'Title & Subtitle', elements: [
      { type: TextElementType.TITLE, fontFamily: FontFamily.PlayfairDisplay, fontSize: 40, x: 10, y: 30, width: 80, textAlign: 'center', ...defaultTextStyles },
      { type: TextElementType.SUBTITLE, fontFamily: FontFamily.Lato, fontSize: 24, x: 10, y: 50, width: 80, textAlign: 'center', ...defaultTextStyles }
    ]
  },
  {
    id: TextTemplateType.TITLE_BODY, name: 'Title & Body', elements: [
      { type: TextElementType.TITLE, fontFamily: FontFamily.Montserrat, fontSize: 36, x: 10, y: 15, width: 80, textAlign: 'left', ...defaultTextStyles },
      { type: TextElementType.BODY, fontFamily: FontFamily.Roboto, fontSize: 18, x: 10, y: 35, width: 80, textAlign: 'left', ...defaultTextStyles }
    ]
  },
  {
    id: TextTemplateType.QUOTE_AUTHOR, name: 'Quote & Author', elements: [
      { type: TextElementType.BODY, fontFamily: FontFamily.PlayfairDisplay, fontSize: 28, x: 15, y: 30, width: 70, textAlign: 'center', ...defaultTextStyles },
      { type: TextElementType.CAPTION, fontFamily: FontFamily.Lato, fontSize: 18, x: 15, y: 65, width: 70, textAlign: 'right', ...defaultTextStyles }
    ]
  }
];

export const MIN_SLIDE_SIZE = 400;
export const MAX_SLIDE_SIZE = 1080;
export const DEFAULT_SLIDE_SIZE = 600; // Default is now 600x600
export const CAROUSEL_THUMBNAIL_SIZE = 100;

export const DEFAULT_BACKGROUND_COLOR = DEFAULT_SLIDE_THEME.backgroundColor;
export const DEFAULT_TEXT_COLOR = DEFAULT_SLIDE_THEME.textColor;
export const DEFAULT_DECORATION_COLOR = DEFAULT_SLIDE_THEME.decorationColor;

export const SLIDE_TEXT_COLOR_DARK_THEME = '#ECEFF1';
export const SLIDE_TEXT_COLOR_LIGHT_THEME = '#212121';

// Note: TEXT_TEMPLATES elements' color property is now handled dynamically by themes.
// The 'color' field was removed from TextTemplate's 'elements' Omit type in types.ts.
// Initialization of color happens in App.tsx when applying a template or creating new slides.