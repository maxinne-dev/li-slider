import React from 'react';
import ReactDOM from 'react-dom/client';
import { Slide, ExposedWindow, SlideDimensions } from '../types'; // Added SlideDimensions
import SlideDisplay from '../components/SlideDisplay';

/**
 * Generates a thumbnail image for a given slide.
 * Renders the slide at its actual working size, captures it, then scales down maintaining aspect ratio.
 * @param slideData The slide data to render.
 * @param slideIndex The 0-based index of the slide.
 * @param actualRenderDimensions The actual dimensions (width and height in px) the slide is designed for.
 * @param thumbnailTargetSize The desired square size (width and height in px) of the final thumbnail.
 * @returns A Promise that resolves to a Base64 data URL of the thumbnail, or null on error.
 */
export const generateSlideThumbnail = async (
  slideData: Slide,
  slideIndex: number,
  actualRenderDimensions: SlideDimensions, // Changed from actualRenderSize
  thumbnailTargetSize: number
): Promise<string | null> => {
  const html2canvas = (window as ExposedWindow).html2canvas;

  if (!html2canvas) {
    console.error("html2canvas not found on window object for thumbnail generation.");
    return null;
  }

  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px'; 
  tempContainer.style.top = '-9999px';
  tempContainer.style.width = `${actualRenderDimensions.width}px`; // Use width
  tempContainer.style.height = `${actualRenderDimensions.height}px`; // Use height
  document.body.appendChild(tempContainer);
  
  const tempRoot = ReactDOM.createRoot(tempContainer);

  try {
    await new Promise<void>(resolve => {
        tempRoot.render(
          React.createElement(SlideDisplay, { 
            slide: slideData, 
            slideIndex: slideIndex,
            dimensions: actualRenderDimensions, // Pass dimensions
            isExporting: true 
          })
        );
        setTimeout(resolve, 250); 
    });

    const slideElement = tempContainer.firstChild as HTMLElement;
    if (!slideElement) {
      console.error(`Could not find rendered slide element for thumbnail: ${slideData.id}`);
      return null;
    }
    
    const capturedCanvas = await html2canvas(slideElement, {
      useCORS: true,
      backgroundColor: slideData.backgroundColor,
      logging: false,
    });
    
    const thumbnailCanvas = document.createElement('canvas');
    thumbnailCanvas.width = thumbnailTargetSize;
    thumbnailCanvas.height = thumbnailTargetSize;
    
    const ctx = thumbnailCanvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingQuality = 'high';
      
      // Calculate letterboxing/pillarboxing
      const scaleFactor = Math.min(thumbnailTargetSize / capturedCanvas.width, thumbnailTargetSize / capturedCanvas.height);
      const drawWidth = capturedCanvas.width * scaleFactor;
      const drawHeight = capturedCanvas.height * scaleFactor;
      const offsetX = (thumbnailTargetSize - drawWidth) / 2;
      const offsetY = (thumbnailTargetSize - drawHeight) / 2;

      // Fill background if needed (e.g., transparent parts of slide, or to ensure opaque thumbnail)
      // For now, assuming the slide content itself has a background. If not, fill with slideData.backgroundColor
      // ctx.fillStyle = slideData.backgroundColor; // Optional: ensure thumbnail bg matches
      // ctx.fillRect(0,0, thumbnailTargetSize, thumbnailTargetSize);

      ctx.drawImage(
        capturedCanvas, 
        0, 0, capturedCanvas.width, capturedCanvas.height, 
        offsetX, offsetY, drawWidth, drawHeight    
      );
      return thumbnailCanvas.toDataURL('image/png');
    } else {
      console.error(`Could not get 2D context for thumbnail canvas: ${slideData.id}`);
      return null;
    }

  } catch (error) {
    console.error(`Error generating thumbnail for slide ${slideData.id}:`, error);
    return null;
  } finally {
    tempRoot.unmount();
    if (tempContainer.parentNode) {
      tempContainer.parentNode.removeChild(tempContainer);
    }
  }
};
