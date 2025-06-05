import React from 'react';
import ReactDOM from 'react-dom/client';
import { Slide, ExposedWindow } from '../types';
import SlideDisplay from '../components/SlideDisplay';

/**
 * Generates a thumbnail image for a given slide.
 * Renders the slide at its actual working size, captures it, then scales down.
 * @param slideData The slide data to render.
 * @param slideIndex The 0-based index of the slide.
 * @param actualRenderSize The actual size (width and height in px) the slide is designed for.
 * @param thumbnailTargetSize The desired square size (width and height in px) of the final thumbnail.
 * @returns A Promise that resolves to a Base64 data URL of the thumbnail, or null on error.
 */
export const generateSlideThumbnail = async (
  slideData: Slide,
  slideIndex: number, // New: slide index
  actualRenderSize: number,
  thumbnailTargetSize: number
): Promise<string | null> => {
  const html2canvas = (window as ExposedWindow).html2canvas;

  if (!html2canvas) {
    console.error("html2canvas not found on window object for thumbnail generation.");
    return null;
  }

  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px'; // Position off-screen
  tempContainer.style.top = '-9999px';
  // Render SlideDisplay in a container matching its actual intended size
  tempContainer.style.width = `${actualRenderSize}px`;
  tempContainer.style.height = `${actualRenderSize}px`;
  document.body.appendChild(tempContainer);
  
  const tempRoot = ReactDOM.createRoot(tempContainer);

  try {
    // Render the slide to the temporary off-screen container at its actual size
    await new Promise<void>(resolve => {
        tempRoot.render(
          React.createElement(SlideDisplay, { 
            slide: slideData, 
            slideIndex: slideIndex, // Pass slide index
            size: actualRenderSize, // Render at full size
            isExporting: true // Treat as export to ensure final look
          })
        );
        // Wait for rendering, fonts, and images to apply (heuristic)
        setTimeout(resolve, 250); // Slightly longer delay for potentially larger render
    });

    const slideElement = tempContainer.firstChild as HTMLElement;
    if (!slideElement) {
      console.error(`Could not find rendered slide element for thumbnail: ${slideData.id}`);
      return null;
    }
    
    // Capture the full-size render; html2canvas will use devicePixelRatio by default for scale
    const capturedCanvas = await html2canvas(slideElement, {
      useCORS: true,
      backgroundColor: slideData.backgroundColor,
      logging: false,
      // No explicit width, height, or scale here. Let html2canvas use element's dimensions
      // and devicePixelRatio for scaling the capture.
    });
    
    // Now, create a new canvas for the thumbnail and draw the captured image scaled down.
    const thumbnailCanvas = document.createElement('canvas');
    thumbnailCanvas.width = thumbnailTargetSize;
    thumbnailCanvas.height = thumbnailTargetSize;
    
    const ctx = thumbnailCanvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingQuality = 'high'; // Prefer quality for downscaling
      ctx.drawImage(
        capturedCanvas, // Source image (large, high-res)
        0, 0, capturedCanvas.width, capturedCanvas.height, // Source rect (full capturedCanvas)
        0, 0, thumbnailTargetSize, thumbnailTargetSize    // Destination rect (scaled to fit thumbnail)
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
    // Clean up
    tempRoot.unmount();
    if (tempContainer.parentNode) {
      tempContainer.parentNode.removeChild(tempContainer);
    }
  }
};