import React, { useState, useEffect, useRef } from 'react';
import { Slide, TextElement, Decoration, DecorationType, FontFamily, SlideImage, SelectedElementInfo } from '../types';
import { AVAILABLE_FONTS, DEFAULT_BORDER_WIDTH } from '../constants';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import blobshape from 'blobshape';
import { BlobCornerDecorationType } from '../constants';

interface SlideDisplayProps {
  slide: Slide | null;
  slideIndex?: number;
  size: number;
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
  slideSize: number,
  slideIndex?: number
): React.ReactNode => {
  const commonStyleBase: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0,
    boxSizing: 'border-box', // Important for borders
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

  switch (decoration.type) {
    case DecorationType.CORNER_ELEMENT_TOP_LEFT:
      return (
        <svg style={commonStyleBase} viewBox="0 0 100 100" preserveAspectRatio="none" key={decoration.id}>
          <path d="M0,0 L30,0 L0,30 Z" fill={decoration.color} />
          {pageNumberText && (
            <text x="5" y="12" {...textStyle}>{pageNumberText}</text>
          )}
        </svg>
      );
    case DecorationType.CORNER_ELEMENT_TOP_RIGHT:
      return (
        <svg style={commonStyleBase} viewBox="0 0 100 100" preserveAspectRatio="none" key={decoration.id}>
          <path d="M100,0 L70,0 L100,30 Z" fill={decoration.color} />
           {pageNumberText && (
            <text x="95" y="12" textAnchor="end" {...textStyle}>{pageNumberText}</text>
          )}
        </svg>
      );
    case DecorationType.CORNER_ELEMENT_BOTTOM_LEFT:
      return (
        <svg style={commonStyleBase} viewBox="0 0 100 100" preserveAspectRatio="none" key={decoration.id}>
          <path d="M0,100 L30,100 L0,70 Z" fill={decoration.color} />
          {pageNumberText && (
            <text x="5" y="92" {...textStyle}>{pageNumberText}</text>
          )}
        </svg>
      );
    case DecorationType.CORNER_ELEMENT_BOTTOM_RIGHT:
      return (
        <svg style={commonStyleBase} viewBox="0 0 100 100" preserveAspectRatio="none" key={decoration.id}>
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
    // --- Blob Corner Decorations ---
    case BlobCornerDecorationType.CORNER_BLOB_TOP_LEFT: {
      const blob = blobshape({ edge: 20, growth: 5 });
      return (
        <svg style={commonStyleBase} viewBox="0 0 100 100" preserveAspectRatio="none" key={decoration.id}>
          <g transform="translate(0,0) scale(0.5,0.5)">
            <path d={blob.path} fill={decoration.color} />
          </g>
        </svg>
      );
    }
    case BlobCornerDecorationType.CORNER_BLOB_TOP_RIGHT: {
      const blob = blobshape({ edge: 20, growth: 5 });
      return (
        <svg style={commonStyleBase} viewBox="0 0 100 100" preserveAspectRatio="none" key={decoration.id}>
          <g transform="translate(100,0) scale(-0.5,0.5)">
            <path d={blob.path} fill={decoration.color} />
          </g>
        </svg>
      );
    }
    case BlobCornerDecorationType.CORNER_BLOB_BOTTOM_LEFT: {
      const blob = blobshape({ edge: 20, growth: 5 });
      return (
        <svg style={commonStyleBase} viewBox="0 0 100 100" preserveAspectRatio="none" key={decoration.id}>
          <g transform="translate(0,100) scale(0.5,-0.5)">
            <path d={blob.path} fill={decoration.color} />
          </g>
        </svg>
      );
    }
    case BlobCornerDecorationType.CORNER_BLOB_BOTTOM_RIGHT: {
      const blob = blobshape({ edge: 20, growth: 5 });
      return (
        <svg style={commonStyleBase} viewBox="0 0 100 100" preserveAspectRatio="none" key={decoration.id}>
          <g transform="translate(100,100) scale(-0.5,-0.5)">
            <path d={blob.path} fill={decoration.color} />
          </g>
        </svg>
      );
    }
    default:
      return null;
  }
};


const SlideDisplay: React.FC<SlideDisplayProps> = ({
  slide,
  slideIndex,
  size,
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

      let newXPercent = (elementTopLeftXPx / size) * 100;
      let newYPercent = (elementTopLeftYPx / size) * 100;

      if (dragTargetRef.current.type === 'text' && slide) {
        const textEl = slide.textElements.find(el => el.id === dragTargetRef.current!.id);
        if (textEl && onUpdateTextElement) {
          newXPercent = Math.max(0, Math.min(newXPercent, 100 - textEl.width));
          const approxTextHeightPercent = (textEl.fontSize * 1.2 * (textEl.content.split('\n').length + 1) / size) * 100;
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
  }, [isDragging, size, slide, onUpdateTextElement, onUpdateImageElement]);

  if (!slide) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
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


    if (selectedElementInfo?.id === elementId && selectedElementInfo?.type === 'text' && type === 'text' && slide.image) {
      dragTargetRef.current = { id: slide.image.id, type: 'image' };
      onSelectElement({ id: slide.image.id, type: 'image' });
      draggedElementInitialPercentRef.current = { x: slide.image.x, y: slide.image.y };
      const imageElement = document.getElementById(`slide-image-${slide.image.id}`);
      if (imageElement) {
          const imageRect = imageElement.getBoundingClientRect();
          const mouseXOnSlide = e.clientX - slideRect.left;
          const mouseYOnSlide = e.clientY - slideRect.top;

          const imageXpx = (slide.image.x / 100) * size;
          const imageYpx = (slide.image.y / 100) * size;

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
        width: size,
        height: size,
        backgroundColor: slide.backgroundColor,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        cursor: onSelectElement && !isExporting && !isDragging ? 'default' : (isDragging ? 'grabbing': 'default'),
        userSelect: isDragging ? 'none' : 'auto',
      }}
      onClick={handleSlideBackgroundClick}
      aria-label="Slide preview area"
    >
      {slide.decorations.map(dec => renderDecoration(dec, slide.backgroundColor, size, slideIndex))}

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