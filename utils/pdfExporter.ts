import { Slide, ExposedWindow } from '../types';
import SlideDisplay from '../components/SlideDisplay'; // We need to render this temporarily
import React from 'react';
import ReactDOM from 'react-dom/client';


const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const exportScaleFactor = 2; // Render at 2x resolution for better quality

export const exportSlidesToPDF = async (slides: Slide[], slideSize: number, filename: string = "slideshow.pdf"): Promise<void> => {
  const { jsPDF } = (window as ExposedWindow).jspdf;
  const html2canvas = (window as ExposedWindow).html2canvas;

  if (!jsPDF || !html2canvas) {
    alert("PDF generation library not loaded. Please refresh.");
    console.error("jsPDF or html2canvas not found on window object.");
    return;
  }

  const pdf = new jsPDF({
    orientation: 'p', // For square slides, 'p' (portrait) is fine.
    unit: 'px',
    format: [slideSize, slideSize], // Page size matches slide size
    compress: true,
    hotfixes: ["px_scaling"], // Added for correct px unit scaling
  });

  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px'; // Position off-screen
  tempContainer.style.top = '-9999px';
  // The container itself should be the base slide size for layout purposes
  tempContainer.style.width = `${slideSize}px`;
  tempContainer.style.height = `${slideSize}px`;
  document.body.appendChild(tempContainer);
  
  const tempRoot = ReactDOM.createRoot(tempContainer);

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];

    // Render the slide to the temporary off-screen container
    await new Promise<void>(resolve => {
        tempRoot.render(
          React.createElement(SlideDisplay, { 
            slide: slide, 
            slideIndex: i, // Pass current slide index
            size: slideSize, 
            isExporting: true 
          })
        );
        // Wait for rendering, fonts, and images to apply (heuristic)
        // A slightly longer delay might help with complex slides or slower font loading.
        setTimeout(resolve, 300); // Increased from 200ms
    });


    const slideElement = tempContainer.firstChild as HTMLElement; // The SlideDisplay div
    if (!slideElement) {
        console.error(`Could not find rendered slide element for slide ${i + 1}`);
        continue;
    }
    
    try {
      // Capture the slideElement at a higher scale for better quality
      // html2canvas will use the slideElement's DOM size (slideSize x slideSize)
      // and multiply it by exportScaleFactor for the canvas dimensions.
      const canvas = await html2canvas(slideElement, {
        scale: exportScaleFactor, // Render at N times the DOM size
        useCORS: true, // If any images were from external sources
        backgroundColor: slide.backgroundColor, // Explicitly set background
        logging: false, // Reduce console noise
      });
      
      // The canvas.toDataURL will be of the scaled-up image
      const imgData = canvas.toDataURL('image/png');

      if (i > 0) {
        // Page size still defined by slideSize (target size in PDF)
        pdf.addPage([slideSize, slideSize], 'p');
      }
      // Add the (now higher-resolution) image data to the PDF,
      // scaled by jsPDF to fit slideSize x slideSize on the PDF page.
      // This results in a higher effective DPI on the PDF page.
      pdf.addImage(imgData, 'PNG', 0, 0, slideSize, slideSize);
    } catch (error) {
      console.error(`Error capturing slide ${i + 1}:`, error);
      alert(`Error capturing slide ${i + 1}. Check console for details.`);
    }
  }
  
  // Clean up
  tempRoot.unmount();
  document.body.removeChild(tempContainer);

  pdf.save(filename);
};