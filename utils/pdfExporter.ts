import { Slide, ExposedWindow, SlideDimensions } from '../types'; // Added SlideDimensions
import SlideDisplay from '../components/SlideDisplay';
import React from 'react';
import ReactDOM from 'react-dom/client';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const exportScaleFactor = 2; 

export const exportSlidesToPDF = async (slides: Slide[], slideDimensions: SlideDimensions, filename: string = "slideshow.pdf"): Promise<void> => {
  const { jsPDF } = (window as ExposedWindow).jspdf;
  const html2canvas = (window as ExposedWindow).html2canvas;

  if (!jsPDF || !html2canvas) {
    alert("PDF generation library not loaded. Please refresh.");
    console.error("jsPDF or html2canvas not found on window object.");
    return;
  }
  
  const orientation = slideDimensions.width > slideDimensions.height ? 'l' : 'p';

  const pdf = new jsPDF({
    orientation: orientation,
    unit: 'px',
    format: [slideDimensions.width, slideDimensions.height], 
    compress: true,
    hotfixes: ["px_scaling"], 
  });

  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px'; 
  tempContainer.style.top = '-9999px';
  tempContainer.style.width = `${slideDimensions.width}px`;
  tempContainer.style.height = `${slideDimensions.height}px`;
  document.body.appendChild(tempContainer);
  
  const tempRoot = ReactDOM.createRoot(tempContainer);

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];

    await new Promise<void>(resolve => {
        tempRoot.render(
          React.createElement(SlideDisplay, { 
            slide: slide, 
            slideIndex: i, 
            dimensions: slideDimensions, // Pass SlideDimensions
            isExporting: true 
          })
        );
        setTimeout(resolve, 300); 
    });


    const slideElement = tempContainer.firstChild as HTMLElement; 
    if (!slideElement) {
        console.error(`Could not find rendered slide element for slide ${i + 1}`);
        continue;
    }
    
    try {
      const canvas = await html2canvas(slideElement, {
        scale: exportScaleFactor, 
        useCORS: true, 
        backgroundColor: slide.backgroundColor, 
        logging: false, 
      });
      
      const imgData = canvas.toDataURL('image/png');

      if (i > 0) {
        pdf.addPage([slideDimensions.width, slideDimensions.height], orientation);
      }
      pdf.addImage(imgData, 'PNG', 0, 0, slideDimensions.width, slideDimensions.height);
    } catch (error) {
      console.error(`Error capturing slide ${i + 1}:`, error);
      alert(`Error capturing slide ${i + 1}. Check console for details.`);
    }
  }
  
  tempRoot.unmount();
  document.body.removeChild(tempContainer);

  pdf.save(filename);
};
