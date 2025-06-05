import React, { useState, useEffect, useRef } from 'react';
import { Slide, TextElement, Decoration, DecorationType, FontFamily, SlideImage, SelectedElementInfo, ExposedWindow, GeometricShapeItem, SlideDimensions } from '../types';
import { AVAILABLE_FONTS, DEFAULT_BORDER_WIDTH, BLOB_GENERATION_SIZE, BLOB_VISUAL_SIZE_IN_VIEWBOX, DEFAULT_BLOB_EDGES, DEFAULT_BLOB_GROWTH } from '../constants';
import { calculatePolygonPoints } from '../utils/graphicUtils'; 
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface SlideDisplayProps {
  slide: Slide | null;
  slideIndex?: number;
  dimensions: SlideDimensions; // Changed from size: number
  isExporting?: boolean;
  selectedElementInfo?: SelectedElementInfo | null;
  onSelectElement?: (element: SelectedElementInfo) => void;
  onUpdateTextElement?: (elementId: string, updates: Partial<TextElement>) => void;
  onUpdateImageElement?: (updates: Partial<SlideImage>) => void;
}

const getFontClassName = (fontFamily: FontFamily): string => {
  const font = AVAILABLE_FONTS.find(f => f.value === fontFamily);
  return font ? font.className : 'font-roboto';
};

const renderDecoration = (
  decoration: Decoration,
  slideBackgroundColor: string,
  // slideDimensions: SlideDimensions, // Not directly needed here as SVG is 0-100
  slideIndex?: number
): React.ReactNode => {
  const commonStyleBase: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0, 
    boxSizing: 'border-box', 
  };

  const pageNumberText = typeof slideIndex === 'number' && decoration.showPageNumber
    ? (slideIndex + 1).toString()
    : null;

  const textStyle: React.SVGProps<SVGTextElement> = {
    fontFamily: 'sans-serif',
    fontSize: '6px', 
    fill: slideBackgroundColor, 
    fontWeight: 'bold',
    pointerEvents: 'none',
  };
  
  let blobTransform: string | undefined;

  if (decoration.type.startsWith('CORNER_BLOB_')) {
    const scaleFactor = BLOB_VISUAL_SIZE_IN_VIEWBOX / BLOB_GENERATION_SIZE; 
    const scaledCenterOffset = BLOB_VISUAL_SIZE_IN_VIEWBOX / 2; 
    
    switch (decoration.type) {
        case DecorationType.CORNER_BLOB_TOP_LEFT:
            blobTransform = `translate(-${scaledCenterOffset}, -${scaledCenterOffset}) scale(${scaleFactor})`;
            break;
        case DecorationType.CORNER_BLOB_TOP_RIGHT:
            blobTransform = `translate(${100 - scaledCenterOffset}, -${scaledCenterOffset}) scale(${scaleFactor})`;
            break;
        case DecorationType.CORNER_BLOB_BOTTOM_LEFT:
            blobTransform = `translate(-${scaledCenterOffset}, ${100 - scaledCenterOffset}) scale(${scaleFactor})`;
            break;
        case DecorationType.CORNER_BLOB_BOTTOM_RIGHT:
            blobTransform = `translate(${100 - scaledCenterOffset}, ${100 - scaledCenterOffset}) scale(${scaleFactor})`;
            break;
    }
  }


  switch (decoration.type) {
    case DecorationType.CORNER_ELEMENT_TOP_LEFT:
      return (
        <svg style={commonStyleBase} viewBox="0 0 100 100" preserveAspectRatio="xMinYMin meet" key={decoration.id}>
          <path d="M0,0 L30,0 L0,30 Z" fill={decoration.color} />
          {pageNumberText && (
            <text x="5" y="12" {...textStyle}>{pageNumberText}</text>
          )}
        </svg>
      );
    case DecorationType.CORNER_ELEMENT_TOP_RIGHT:
      return (
        <svg style={commonStyleBase} viewBox="0 0 100 100" preserveAspectRatio="xMaxYMin meet" key={decoration.id}>
          <path d="M100,0 L70,0 L100,30 Z" fill={decoration.color} />
           {pageNumberText && (
            <text x="95" y="12" textAnchor="end" {...textStyle}>{pageNumberText}</text>
          )}
        </svg>
      );
    case DecorationType.CORNER_ELEMENT_BOTTOM_LEFT:
      return (
        <svg style={commonStyleBase} viewBox="0 0 100 100" preserveAspectRatio="xMinYMax meet" key={decoration.id}>
          <path d="M0,100 L30,100 L0,70 Z" fill={decoration.color} />
          {pageNumberText && (
            <text x="5" y="92" {...textStyle}>{pageNumberText}</text>
          )}
        </svg>
      );
    case DecorationType.CORNER_ELEMENT_BOTTOM_RIGHT:
      return (
        <svg style={commonStyleBase} viewBox="0 0 100 100" preserveAspectRatio="xMaxYMax meet" key={decoration.id}>
          <path d="M100,100 L70,100 L100,70 Z" fill={decoration.color} />
          {pageNumberText && (
            <text x="95" y="92" textAnchor="end" {...textStyle}>{pageNumberText}</text>
          )}
        </svg>
      );
    case DecorationType.BORDER_SIMPLE:
      const borderWidth = decoration.borderWidth === undefined ? DEFAULT_BORDER_WIDTH : decoration.borderWidth;
      const borderSides = decoration.borderSides || { top: true, right: true, bottom: true, left: true };
      const borderStyle = `${borderWidth}px solid ${decoration.color}`;
      return (
        <div
          key={decoration.id}
          style={{
            ...commonStyleBase,
            borderTop: borderSides.top ? borderStyle : 'none',
            borderRight: borderSides.right ? borderStyle : 'none',
            borderBottom: borderSides.bottom ? borderStyle : 'none',
            borderLeft: borderSides.left ? borderStyle : 'none',
          }}
        />
      );
    case DecorationType.CORNER_BLOB_TOP_LEFT:
      return (
        <svg style={commonStyleBase} viewBox="0 0 100 100" preserveAspectRatio="xMinYMin meet" key={decoration.id}>
          {decoration.blobPathData && <path d={decoration.blobPathData} fill={decoration.color} transform={blobTransform} />}
          {pageNumberText && ( <text x="5" y="12" {...textStyle}>{pageNumberText}</text> )}
        </svg>
      );
    case DecorationType.CORNER_BLOB_TOP_RIGHT:
      return (
        <svg style={commonStyleBase} viewBox="0 0 100 100" preserveAspectRatio="xMaxYMin meet" key={decoration.id}>
          {decoration.blobPathData && <path d={decoration.blobPathData} fill={decoration.color} transform={blobTransform} />}
          {pageNumberText && ( <text x="95" y="12" textAnchor="end" {...textStyle}>{pageNumberText}</text> )}
        </svg>
      );
    case DecorationType.CORNER_BLOB_BOTTOM_LEFT:
      return (
        <svg style={commonStyleBase} viewBox="0 0 100 100" preserveAspectRatio="xMinYMax meet" key={decoration.id}>
          {decoration.blobPathData && <path d={decoration.blobPathData} fill={decoration.color} transform={blobTransform} />}
          {pageNumberText && ( <text x="5" y="92" {...textStyle}>{pageNumberText}</text> )}
        </svg>
      );
    case DecorationType.CORNER_BLOB_BOTTOM_RIGHT:
      return (
        <svg style={commonStyleBase} viewBox="0 0 100 100" preserveAspectRatio="xMaxYMax meet" key={decoration.id}>
          {decoration.blobPathData && <path d={decoration.blobPathData} fill={decoration.color} transform={blobTransform} />}
          {pageNumberText && ( <text x="95" y="92" textAnchor="end" {...textStyle}>{pageNumberText}</text> )}
        </svg>
      );
    case DecorationType.GEOMETRIC_BACKGROUND:
      if (!decoration.geometricShapes || decoration.geometricShapes.length === 0) {
        return null;
      }
      const shapesToRender = decoration.geometricShapes.slice(
        0,
        decoration.visibleShapeCount ?? decoration.geometricShapes.length
      );

      return (
        <svg style={commonStyleBase} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" key={decoration.id}>
          <g>
            {shapesToRender.map((shape: GeometricShapeItem) => {
              const commonShapeProps = {
                fill: shape.fill,
                opacity: shape.opacity,
              };
              
              if (shape.shapeType === 'circle') {
                return (
                  <circle
                    key={shape.id}
                    cx={0} 
                    cy={0} 
                    r={shape.size}
                    {...commonShapeProps}
                    transform={`translate(${shape.cx} ${shape.cy}) rotate(${shape.rotation})`}
                  />
                );
              } else {
                // For polygons, points are pre-calculated around (0,0) origin
                // Or, if they were calculated relative to cx, cy, the translate below would be redundant
                // Assuming points are relative to (0,0)
                return (
                  <polygon
                    key={shape.id}
                    points={shape.points} 
                    {...commonShapeProps}
                    transform={`translate(${shape.cx} ${shape.cy}) rotate(${shape.rotation})`}
                  />
                );
              }
            })}
          </g>
        </svg>
      );
    default:
      return null;
  }
};


const SlideDisplay: React.FC<SlideDisplayProps> = ({
  slide,
  slideIndex,
  dimensions, // Changed from size
  isExporting = false,
  selectedElementInfo = null,
  onSelectElement,
  onUpdateTextElement,
  onUpdateImageElement,
}) => {
  const slideRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragTargetRef = useRef<SelectedElementInfo>(null);
  const dragStartOffsetRef = useRef<{ x: number; y: number } | null>(null);
  const draggedElementInitialPercentRef = useRef<{ x: number; y: number } | null>(null);


  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !slideRef.current || !dragTargetRef.current || !dragStartOffsetRef.current || !draggedElementInitialPercentRef.current) return;

      const slideRect = slideRef.current.getBoundingClientRect();
      const mouseXInSlidePx = event.clientX - slideRect.left;
      const mouseYInSlidePx = event.clientY - slideRect.top;

      const elementTopLeftXPx = mouseXInSlidePx - dragStartOffsetRef.current.x;
      const elementTopLeftYPx = mouseYInSlidePx - dragStartOffsetRef.current.y;

      let newXPercent = (elementTopLeftXPx / dimensions.width) * 100; // Use dimensions.width
      let newYPercent = (elementTopLeftYPx / dimensions.height) * 100; // Use dimensions.height

      if (dragTargetRef.current.type === 'text' && slide) {
        const textEl = slide.textElements.find(el => el.id === dragTargetRef.current!.id);
        if (textEl && onUpdateTextElement) {
          newXPercent = Math.max(0, Math.min(newXPercent, 100 - textEl.width));
          // Approximate height based on font size and number of lines in the taller dimension
          const relevantDimensionForTextHeight = Math.max(dimensions.width, dimensions.height);
          const approxTextHeightPercent = (textEl.fontSize * 1.2 * (textEl.content.split('\n').length +1 ) / relevantDimensionForTextHeight) * 100;
          newYPercent = Math.max(0, Math.min(newYPercent, 100 - approxTextHeightPercent));
          onUpdateTextElement(textEl.id, { x: newXPercent, y: newYPercent });
        }
      } else if (dragTargetRef.current.type === 'image' && slide?.image) {
        if (onUpdateImageElement) {
          const img = slide.image;
          newXPercent = Math.max(0, Math.min(newXPercent, 100 - img.width));
          newYPercent = Math.max(0, Math.min(newYPercent, 100 - img.height));
          onUpdateImageElement({ x: newXPercent, y: newYPercent });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragTargetRef.current = null;
      dragStartOffsetRef.current = null;
      draggedElementInitialPercentRef.current = null;
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dimensions, slide, onUpdateTextElement, onUpdateImageElement]); // dimensions instead of size

  if (!slide) {
    return (
      <Box
        sx={{
          width: dimensions.width, // Use dimensions.width
          height: dimensions.height, // Use dimensions.height
          bgcolor: 'grey.200',
          border: 1,
          borderColor: 'grey.300',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Slide preview area: No slide selected"
      >
        <Typography variant="caption" color="text.secondary">
          No slide selected
        </Typography>
      </Box>
    );
  }

  const handleElementMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    elementId: string,
    type: 'text' | 'image',
    currentXPercent: number,
    currentYPercent: number
  ) => {
    if (isExporting || !onSelectElement) return;
    e.stopPropagation();

    const slideRect = slideRef.current?.getBoundingClientRect();
    if (!slideRect) return;

    const mouseXInElement = e.clientX - (e.currentTarget.getBoundingClientRect().left);
    const mouseYInElement = e.clientY - (e.currentTarget.getBoundingClientRect().top);

    dragStartOffsetRef.current = { x: mouseXInElement, y: mouseYInElement };
    draggedElementInitialPercentRef.current = { x: currentXPercent, y: currentYPercent };

    // Logic for selecting image if text element is clicked and image exists (this specific UX might need review)
    if (selectedElementInfo?.id === elementId && selectedElementInfo?.type === 'text' && type === 'text' && slide.image) {
      dragTargetRef.current = { id: slide.image.id, type: 'image' };
      onSelectElement({ id: slide.image.id, type: 'image' });
      draggedElementInitialPercentRef.current = { x: slide.image.x, y: slide.image.y };
      const imageElement = document.getElementById(`slide-image-${slide.image.id}`);
      if (imageElement) {
          const mouseXOnSlide = e.clientX - slideRect.left;
          const mouseYOnSlide = e.clientY - slideRect.top;
          const imageXpx = (slide.image.x / 100) * dimensions.width; // Use dimensions.width
          const imageYpx = (slide.image.y / 100) * dimensions.height; // Use dimensions.height
          dragStartOffsetRef.current = { x: mouseXOnSlide - imageXpx, y: mouseYOnSlide - imageYpx};
      } else {
        dragStartOffsetRef.current = { x: 0, y: 0};
      }
    } else {
      dragTargetRef.current = { id: elementId, type };
      onSelectElement({ id: elementId, type });
    }
    setIsDragging(true);
  };

  const handleSlideBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === slideRef.current && onSelectElement) {
      onSelectElement(null);
    }
  };

  const renderTextElement = (el: TextElement) => {
    const isSelected = selectedElementInfo?.type === 'text' && selectedElementInfo?.id === el.id;
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${el.x}%`,
      top: `${el.y}%`,
      width: `${el.width}%`,
      // height will be auto based on content, for text.
      color: el.color,
      fontSize: `${el.fontSize}px`,
      fontWeight: el.fontWeight || 'normal',
      fontStyle: el.fontStyle || 'normal',
      textDecoration: el.textDecoration || 'none',
      lineHeight: 1.2,
      textAlign: el.textAlign,
      wordWrap: 'break-word',
      whiteSpace: 'pre-wrap',
      zIndex: el.zIndex ?? 10,
      cursor: onSelectElement && !isExporting ? 'grab' : 'default',
      border: isSelected && !isExporting ? '2px dashed #007bff' : 'none',
      padding: isSelected && !isExporting ? '2px' : '0px',
      boxSizing: 'border-box',
    };

    return (
      <div
        key={el.id}
        id={`text-element-${el.id}`}
        className={`${getFontClassName(el.fontFamily)}`}
        style={style}
        onMouseDown={ (e) => handleElementMouseDown(e, el.id, 'text', el.x, el.y)}
        role="textbox"
        aria-label={`${el.type} text element: ${el.content.substring(0,30)}`}
        tabIndex={onSelectElement ? 0 : -1}
      >
        {el.content}
      </div>
    );
  };

  return (
    <div
      id={isExporting ? `export-slide-${slide.id}` : `slide-preview-${slide.id}`}
      ref={slideRef}
      className="slide-render-area"
      style={{
        width: dimensions.width, // Use dimensions.width
        height: dimensions.height, // Use dimensions.height
        backgroundColor: slide.backgroundColor,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        cursor: onSelectElement && !isExporting && !isDragging ? 'default' : (isDragging ? 'grabbing': 'default'),
        userSelect: isDragging ? 'none' : 'auto',
      }}
      onClick={handleSlideBackgroundClick}
      aria-label={`Slide preview area. Width: ${dimensions.width}px, Height: ${dimensions.height}px.`}
    >
      {slide.decorations.map(dec => renderDecoration(dec, slide.backgroundColor, /*dimensions,*/ slideIndex))}

      {slide.image && (() => {
        const img = slide.image;
        const isSelected = selectedElementInfo?.type === 'image' && selectedElementInfo?.id === img.id;
        return (
          <div
            id={`slide-image-${img.id}`}
            style={{
              position: 'absolute',
              left: `${img.x}%`,
              top: `${img.y}%`,
              width: `${img.width}%`,
              height: `${img.height}%`,
              zIndex: img.zIndex ?? 1,
              cursor: onSelectElement && !isExporting ? 'grab' : 'default',
              border: isSelected && !isExporting ? '2px dashed #007bff' : 'none',
              padding: isSelected && !isExporting ? '2px' : '0px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseDown={(e) => handleElementMouseDown(e, img.id, 'image', img.x, img.y)}
            role="img"
            aria-label={img.alt || 'Slide image'}
            tabIndex={onSelectElement ? 0 : -1}
          >
            <img
              src={img.src}
              alt={img.alt || 'Slide image'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block',
                pointerEvents: 'none',
              }}
            />
          </div>
        );
      })()}

      {slide.textElements.map(renderTextElement)}
    </div>
  );
};

export default SlideDisplay;