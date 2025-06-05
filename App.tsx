
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Slide, TextElement, Decoration, TextTemplate, DecorationType, TextElementType, FontFamily, TextTemplateType, SlideThemePalette, SlideImage, SelectedElementInfo, GeometricShapeItem, GeometricShapeType, AspectRatio, SlideDimensions, SlideSizeOption } from './types';
import { useSlidesState, SlidesState, SlidesActions } from './hooks/useSlidesState';
import { useSlideCanvasState, SlideCanvasState, SlideCanvasActions } from './hooks/useSlideCanvasState';

import Toolbar from './components/Toolbar';
import SlideDisplay from './components/SlideDisplay';
import EditorPanel from './components/EditorPanel';
import ConfirmationDialog from './components/ConfirmationDialog';
import { exportSlidesToPDF } from './utils/pdfExporter';
import { AppThemeProvider } from './contexts/ThemeContext';


import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

const AppContent: React.FC = () => {
  const slideDimensionsRef = useRef<SlideDimensions | null>(null);

  const [
    { slideDimensions, selectedAspectRatio, isCanvasStateLoaded },
    { changeSlideDimensions, changeAspectRatio, resetCanvasState }
  ] = useSlideCanvasState();

  useEffect(() => {
    slideDimensionsRef.current = slideDimensions;
  }, [slideDimensions]);

  const getCurrentSlideDimensions = useCallback(() => {
    return slideDimensionsRef.current!;
  }, []);
  
  const [
    { slides, activeSlideId, activeSlide, activeSlideIndex, isSlidesLoaded },
    slidesActions
  ] = useSlidesState(getCurrentSlideDimensions);


  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElementInfo>(null);
  const [isClearDataConfirmOpen, setIsClearDataConfirmOpen] = useState(false);


  // Effect to clear selected element if it's no longer valid in the active slide
  useEffect(() => {
    if (selectedElement && activeSlide) {
      if (selectedElement.type === 'text' && !activeSlide.textElements.find(el => el.id === selectedElement.id)) {
        setSelectedElement(null);
      } else if (selectedElement.type === 'image' && (!activeSlide.image || activeSlide.image.id !== selectedElement.id)) {
        setSelectedElement(null);
      }
    } else if (selectedElement && !activeSlide) {
      setSelectedElement(null);
    }
  }, [activeSlide, selectedElement]);


  const handleSlideDimensionsChange = (newDimensions: SlideDimensions) => {
    changeSlideDimensions(newDimensions);
    setSelectedElement(null);
    slides.forEach(s => slidesActions.forceThumbnailUpdate(s.id));
  };

  const handleAspectRatioChange = (newRatio: AspectRatio) => {
    changeAspectRatio(newRatio); // This will also update dimensions via the hook
    setSelectedElement(null);
    slides.forEach(s => slidesActions.forceThumbnailUpdate(s.id));
  };
  
  const handleSelectActiveSlide = (slideId: string) => {
    slidesActions.selectSlide(slideId);
    setSelectedElement(null);
  };

  const handleAddSlide = () => {
    slidesActions.addSlide(); // No need to pass reference, hook handles it
    setSelectedElement(null);
  };
  
  const handleDuplicateSlide = (slideId: string) => {
    slidesActions.duplicateSlide(slideId);
    setSelectedElement(null);
  };

  const handleRemoveSlide = (slideId: string) => {
    slidesActions.removeSlide(slideId);
    setSelectedElement(null); // Active slide might change, so clear selection
  };


  // --- EditorPanel Proxied Actions ---
  const handleUpdateTextElementInEditor = (slideId: string, elementId: string, updates: Partial<TextElement>) => {
    slidesActions.updateTextElement(slideId, elementId, updates);
  };
  const handleApplyTextTemplateInEditor = (slideId: string, template: TextTemplate) => {
    slidesActions.applyTextTemplate(slideId, template);
    setSelectedElement(null);
  };
  const handleAddDecorationToSlideInEditor = (slideId: string, type: DecorationType) => {
    slidesActions.addDecoration(slideId, type);
  };
  const handleRemoveDecorationFromSlideInEditor = (slideId: string, decorationId: string) => {
    slidesActions.removeDecoration(slideId, decorationId);
  };
  const handleUpdateDecorationOnSlideInEditor = (slideId: string, decorationId: string, updates: Partial<Decoration>) => {
    slidesActions.updateDecoration(slideId, decorationId, updates);
  };
  const handleAddTextElementToSlideInEditor = (slideId: string, type: TextElementType) => {
    slidesActions.addTextElement(slideId, type);
  };
  const handleRemoveTextElementFromSlideInEditor = (slideId: string, elementId: string) => {
    slidesActions.removeTextElement(slideId, elementId);
    if (selectedElement?.id === elementId) setSelectedElement(null);
  };
  const handleApplySlideThemeInEditor = (slideId: string, theme: SlideThemePalette) => {
    slidesActions.applySlideTheme(slideId, theme);
  };
  const handleAddOrReplaceImageInEditor = (slideId: string, file: File) => {
    slidesActions.addOrReplaceImage(slideId, file);
    // Potentially set selectedElement after image ID is known, if desired
    // This might need a callback from the hook or an event emitter if we want to select the new image immediately.
    // For now, selection remains manual or based on current logic.
  };
  const handleRemoveImageInEditor = (slideId: string) => {
    if (activeSlide?.image && selectedElement?.type === 'image' && selectedElement.id === activeSlide.image.id) {
        setSelectedElement(null);
    }
    slidesActions.removeImage(slideId);
  };


  // --- SlideDisplay Proxied Actions (for active slide) ---
  const handleUpdateActiveSlideTextElement = useCallback((elementId: string, updates: Partial<TextElement>) => {
    if (activeSlideId) {
      slidesActions.updateTextElement(activeSlideId, elementId, updates);
    }
  }, [activeSlideId, slidesActions]);

  const handleUpdateActiveSlideImageElement = useCallback((updates: Partial<SlideImage>) => {
    if (activeSlideId && activeSlide?.image) {
      // The updateSlide action can handle partial updates to the image object
      slidesActions.updateSlide(activeSlideId, { image: { ...activeSlide.image, ...updates } });
    }
  }, [activeSlideId, activeSlide, slidesActions]);


  const handleExport = async () => {
    if (slides.length === 0) { alert("No slides to export."); return; }
    setIsExporting(true); setSelectedElement(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 150)); // Ensure UI updates
      await exportSlidesToPDF(slides, slideDimensions);
    } catch (error) { console.error("PDF Export failed:", error); alert("Failed to export PDF. See console for details.");
    } finally { setIsExporting(false); }
  };

  const handleOpenClearDataConfirm = useCallback(() => setIsClearDataConfirmOpen(true), []);
  const handleCloseClearDataConfirm = useCallback(() => setIsClearDataConfirmOpen(false), []);
  const handleConfirmClearData = useCallback(() => {
    slidesActions.resetSlidesState();
    resetCanvasState();
    setSelectedElement(null);
    setIsClearDataConfirmOpen(false);
  }, [slidesActions, resetCanvasState]);


  if (!isSlidesLoaded || !isCanvasStateLoaded) {
    return (
      <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Typography>Loading Slide Creator...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box component="header" sx={{ mb: { xs: 1.5, sm: 2 } }}>
        <Toolbar
          slideDimensions={slideDimensions}
          onSlideDimensionsChange={handleSlideDimensionsChange}
          selectedAspectRatio={selectedAspectRatio}
          onAspectRatioChange={handleAspectRatioChange}
          onAddSlide={handleAddSlide}
          onExportPDF={handleExport}
          isExporting={isExporting}
          slides={slides}
          activeSlideId={activeSlideId}
          onSelectSlide={handleSelectActiveSlide}
          onRemoveSlide={handleRemoveSlide}
          onDuplicateSlide={handleDuplicateSlide}
          onClearData={handleOpenClearDataConfirm}
        />
      </Box>

      <Grid container spacing={{xs: 1.5, sm: 2}} sx={{ flexGrow: 1, minHeight: 0 }}>
        <Grid xs={12} md={4} lg={3.5} xl={3} sx={{ display: 'flex', flexDirection: 'column', minHeight: { md: 'auto' } }}>
          <Box sx={{ flexGrow: 1, height: '100%', minHeight: {xs: '400px', md: 'auto'} }}>
             <EditorPanel
                activeSlide={activeSlide}
                onUpdateSlide={(slideId, updates) => slidesActions.updateSlide(slideId, updates)} // Generic update
                onUpdateTextElement={handleUpdateTextElementInEditor}
                onApplyTextTemplate={handleApplyTextTemplateInEditor}
                onAddDecorationToSlide={handleAddDecorationToSlideInEditor}
                onRemoveDecorationFromSlide={handleRemoveDecorationFromSlideInEditor}
                onUpdateDecorationOnSlide={handleUpdateDecorationOnSlideInEditor}
                onAddTextElementToSlide={handleAddTextElementToSlideInEditor}
                onRemoveTextElementFromSlide={handleRemoveTextElementFromSlideInEditor}
                onApplySlideTheme={handleApplySlideThemeInEditor}
                onAddOrReplaceImage={handleAddOrReplaceImageInEditor}
                onRemoveImage={handleRemoveImageInEditor}
              />
          </Box>
        </Grid>

        <Grid xs={12} md={8} lg={8.5} xl={9} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper
            elevation={2}
            sx={{
                width: 'auto',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: {xs: `calc(100vh - 200px)`, md: `calc(100vh - 150px)`},
                aspectRatio: (slideDimensions.width && slideDimensions.height) ? `${slideDimensions.width} / ${slideDimensions.height}` : '1 / 1',
                p: {xs:1, sm:2},
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
            }}
          >
            {activeSlide && (
              <SlideDisplay
                slide={activeSlide}
                slideIndex={activeSlideIndex}
                dimensions={slideDimensions}
                selectedElementInfo={selectedElement}
                onSelectElement={setSelectedElement}
                onUpdateTextElement={handleUpdateActiveSlideTextElement}
                onUpdateImageElement={handleUpdateActiveSlideImageElement}
              />
            )}
            {!activeSlide && slides.length > 0 && (
                 <Box sx={{ width: slideDimensions.width, height: slideDimensions.height, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.200'}}>
                    <Typography>Loading slide...</Typography>
                 </Box>
            )}
             {!activeSlide && slides.length === 0 && (
                 <Box sx={{ width: slideDimensions.width, height: slideDimensions.height, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.200'}}>
                    <Typography>No slides available. Click "Add" in the carousel to begin.</Typography>
                 </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
       <Box component="footer" sx={{ py: 2, textAlign: 'center'}}>
        <Typography variant="caption" color="text.secondary">
          Slide Creator - Powered by MUI & React
        </Typography>
      </Box>
      <ConfirmationDialog
        open={isClearDataConfirmOpen}
        onClose={handleCloseClearDataConfirm}
        onConfirm={handleConfirmClearData}
        title="Confirm Clear Data"
        message="Are you sure you want to clear all saved data and reset the application? This action cannot be undone."
        confirmText="Clear Data"
      />
    </Container>
  );
};


const App: React.FC = () => {
  return (
    <AppThemeProvider>
      <AppContent />
    </AppThemeProvider>
  );
};

export default App;
