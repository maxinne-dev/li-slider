
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Slide, TextElement, Decoration, TextTemplate, DecorationType, TextElementType, FontFamily, TextTemplateType, SlideThemePalette, SlideImage, SelectedElementInfo } from './types';
import { DEFAULT_SLIDE_SIZE, TEXT_TEMPLATES, SLIDE_THEMES, DEFAULT_TEXT_COLOR, DEFAULT_DECORATION_COLOR, DEFAULT_BACKGROUND_COLOR, CAROUSEL_THUMBNAIL_SIZE, DEFAULT_BORDER_WIDTH } from './constants';
import Toolbar from './components/Toolbar';
// SlideCarousel is now rendered within Toolbar
import SlideDisplay from './components/SlideDisplay';
import EditorPanel from './components/EditorPanel';
import { exportSlidesToPDF } from './utils/pdfExporter';
import { generateSlideThumbnail } from './utils/thumbnailGenerator'; // New import
import { AppThemeProvider, useAppTheme } from './contexts/ThemeContext';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2'; // Changed import
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const defaultSlideTheme = SLIDE_THEMES[0];
const defaultTextStyles = {
  fontWeight: 'normal' as 'normal' | 'bold',
  fontStyle: 'normal' as 'normal' | 'italic',
  textDecoration: 'none' as 'none' | 'underline',
};

const createNewSlide = (referenceSlide?: Slide): Slide => {
  const newId = generateId();
  if (referenceSlide) {
    return {
      id: newId,
      backgroundColor: referenceSlide.backgroundColor,
      decorations: referenceSlide.decorations.map(dec => ({
        ...dec,
        id: generateId(),
        // Ensure new border properties are initialized if duplicating from an old slide
        borderSides: dec.type === DecorationType.BORDER_SIMPLE ? (dec.borderSides || { top: true, right: true, bottom: true, left: true }) : undefined,
        borderWidth: dec.type === DecorationType.BORDER_SIMPLE ? (dec.borderWidth || DEFAULT_BORDER_WIDTH) : undefined,
      })),
      textElements: referenceSlide.textElements.map(el => ({
        ...el, // This will include fontWeight, fontStyle, textDecoration if they exist on ref
        id: generateId(),
        // Ensure defaults if properties are missing from reference (e.g., older slide structure)
        fontWeight: el.fontWeight || defaultTextStyles.fontWeight,
        fontStyle: el.fontStyle || defaultTextStyles.fontStyle,
        textDecoration: el.textDecoration || defaultTextStyles.textDecoration,
      })),
      image: referenceSlide.image ? { ...referenceSlide.image, id: generateId() } : undefined,
      thumbnailSrc: null,
    };
  }
  // Default creation if no reference slide
  return {
    id: newId,
    backgroundColor: defaultSlideTheme.backgroundColor,
    decorations: [],
    textElements: TEXT_TEMPLATES.find(t => t.id === TextTemplateType.TITLE_ONLY)?.elements.map(el => ({
      ...el, // Template elements now include default styles from constants.ts
      id: generateId(),
      content: `Your ${el.type.toLowerCase()} here`,
      color: defaultSlideTheme.textColor,
      zIndex: 10,
    })) || [],
    image: undefined,
    thumbnailSrc: null,
  };
};


const AppContent: React.FC = () => {
  const { mode: appThemeMode } = useAppTheme();

  const [slides, setSlides] = useState<Slide[]>([createNewSlide()]);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(slides[0]?.id || null);
  const [slideSize, setSlideSize] = useState<number>(DEFAULT_SLIDE_SIZE);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElementInfo>(null);

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slidesRef = useRef(slides);
  const slideSizeRef = useRef(slideSize);

  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  useEffect(() => {
    slideSizeRef.current = slideSize;
  }, [slideSize]);


  const activeSlide = slides.find(s => s.id === activeSlideId) || null;
  const activeSlideIndex = activeSlide ? slides.findIndex(s => s.id === activeSlideId) : undefined;

  const triggerThumbnailUpdate = useCallback((slideId: string) => {
    if (!slideId) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      const currentSlides = slidesRef.current;
      const currentSlideRenderSize = slideSizeRef.current;
      const slideToUpdate = currentSlides.find(s => s.id === slideId);
      const slideIndexToUpdate = currentSlides.findIndex(s => s.id === slideId);


      if (!slideToUpdate || slideIndexToUpdate === -1) {
        console.warn(`[Thumbnail] Slide ${slideId} not found when debounced execution ran.`);
        return;
      }

      const thumbnail = await generateSlideThumbnail(slideToUpdate, slideIndexToUpdate, currentSlideRenderSize, CAROUSEL_THUMBNAIL_SIZE);

      setSlides(prevSlides =>
        prevSlides.map(s =>
          s.id === slideId ? { ...s, thumbnailSrc: thumbnail } : s
        )
      );
    }, 500);
  }, []);


  useEffect(() => {
    if (!activeSlideId && slides.length > 0) {
      setActiveSlideId(slides[0].id);
    } else if (slides.length === 0 && !isExporting) {
       const newSlide = createNewSlide();
       setSlides([newSlide]);
       setActiveSlideId(newSlide.id);
    }
  }, [slides, activeSlideId, isExporting]);


   useEffect(() => {
    slides.forEach(slide => {
      if (slide.id && slide.thumbnailSrc === null) {
        triggerThumbnailUpdate(slide.id);
      }
    });
  }, [slides, triggerThumbnailUpdate]);


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


  const handleAddSlide = useCallback(() => {
    const lastSlide = slidesRef.current.length > 0 ? slidesRef.current[slidesRef.current.length - 1] : undefined;
    const newSlide = createNewSlide(lastSlide);
    setSlides(prevSlides => [...prevSlides, newSlide]);
    setActiveSlideId(newSlide.id);
    setSelectedElement(null);
  }, []);

  const handleRemoveSlide = useCallback((slideIdToRemove: string) => {
    setSlides(prevSlides => {
      const slideToRemoveIndex = prevSlides.findIndex(s => s.id === slideIdToRemove);
      const newSlides = prevSlides.filter(s => s.id !== slideIdToRemove);

      if (activeSlideId === slideIdToRemove) {
          if (newSlides.length > 0) {
            const newIndex = Math.min(Math.max(0, slideToRemoveIndex), newSlides.length - 1);
            setActiveSlideId(newSlides[newIndex].id);
          } else {
            setActiveSlideId(null);
          }
          setSelectedElement(null);
      }
      return newSlides;
    });
  }, [activeSlideId]);

  const handleDuplicateSlide = useCallback((slideIdToDuplicate: string) => {
    const slideToDuplicate = slidesRef.current.find(s => s.id === slideIdToDuplicate);
    if (slideToDuplicate) {
      const newSlide = createNewSlide(slideToDuplicate);
      setSlides(prevSlides => [...prevSlides, newSlide]);
      setActiveSlideId(newSlide.id);
      setSelectedElement(null);
    }
  }, []);

  const handleUpdateSlide = useCallback((slideId: string, updates: Partial<Slide>) => {
    setSlides(prevSlides =>
      prevSlides.map(s => (s.id === slideId ? { ...s, ...updates } : s))
    );
    triggerThumbnailUpdate(slideId);
  }, [triggerThumbnailUpdate]);

  const handleAddOrReplaceImage = useCallback((slideId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (src) {
        const img = new Image();
        img.onload = () => {
          const newImage: SlideImage = {
            id: generateId(),
            src,
            alt: file.name || 'Uploaded image',
            originalWidth: img.width,
            originalHeight: img.height,
            x: 5,
            y: 5,
            width: 90,
            height: 90,
            zIndex: 1,
          };
          setSlides(prevSlides =>
            prevSlides.map(s =>
              s.id === slideId ? { ...s, image: newImage } : s
            )
          );
          setSelectedElement({ id: newImage.id, type: 'image' });
          triggerThumbnailUpdate(slideId);
        };
        img.onerror = () => console.error("Error loading image for dimension calculation.");
        img.src = src;
      }
    };
    reader.onerror = () => console.error("Error reading file.");
    reader.readAsDataURL(file);
  }, [triggerThumbnailUpdate]);

  const handleRemoveImage = useCallback((slideId: string) => {
    setSlides(prevSlides =>
      prevSlides.map(s => {
        if (s.id === slideId) {
          if (selectedElement && selectedElement.type === 'image' && selectedElement.id === s.image?.id) {
            setSelectedElement(null);
          }
          return { ...s, image: undefined };
        }
        return s;
      })
    );
    triggerThumbnailUpdate(slideId);
  }, [selectedElement, triggerThumbnailUpdate]);


  const handleApplySlideTheme = useCallback((slideId: string, theme: SlideThemePalette) => {
    setSlides(prevSlides =>
      prevSlides.map(s => {
        if (s.id === slideId) {
          return {
            ...s,
            backgroundColor: theme.backgroundColor,
            textElements: s.textElements.map(el => ({ ...el, color: theme.textColor })),
            decorations: s.decorations.map(dec => ({ ...dec, color: theme.decorationColor })),
          };
        }
        return s;
      })
    );
    triggerThumbnailUpdate(slideId);
  }, [triggerThumbnailUpdate]);

  const handleUpdateTextElement = useCallback((slideId: string, elementId: string, updates: Partial<TextElement>) => {
    setSlides(prevSlides =>
      prevSlides.map(s =>
        s.id === slideId
          ? { ...s, textElements: s.textElements.map(el => el.id === elementId ? { ...el, ...updates } : el) }
          : s
      )
    );
    triggerThumbnailUpdate(slideId);
  }, [triggerThumbnailUpdate]);

  const handleUpdateActiveSlideTextElement = useCallback((elementId: string, updates: Partial<TextElement>) => {
    if (activeSlideId) {
      setSlides(prevSlides =>
        prevSlides.map(s =>
          s.id === activeSlideId
            ? { ...s, textElements: s.textElements.map(el => el.id === elementId ? { ...el, ...updates } : el) }
            : s
        )
      );
      triggerThumbnailUpdate(activeSlideId);
    }
  }, [activeSlideId, triggerThumbnailUpdate]);

  const handleUpdateActiveSlideImageElement = useCallback((updates: Partial<SlideImage>) => {
    if (activeSlideId && activeSlide?.image) {
        const currentImage = activeSlide.image;
        const updatedImage: SlideImage = { ...currentImage, ...updates };
        setSlides(prevSlides =>
            prevSlides.map(s => (s.id === activeSlideId ? { ...s, image: updatedImage } : s))
        );
        triggerThumbnailUpdate(activeSlideId);
    }
  }, [activeSlideId, activeSlide, triggerThumbnailUpdate]);


  const handleRemoveTextElement = useCallback((slideId: string, elementId: string) => {
    setSlides(prevSlides =>
      prevSlides.map(s => {
        if (s.id === slideId) {
          if (selectedElement && selectedElement.type === 'text' && selectedElement.id === elementId) {
            setSelectedElement(null);
          }
          return { ...s, textElements: s.textElements.filter(el => el.id !== elementId) };
        }
        return s;
      })
    );
    triggerThumbnailUpdate(slideId);
  }, [selectedElement, triggerThumbnailUpdate]);

  const handleApplyTextTemplate = useCallback((slideId: string, template: TextTemplate) => {
    const currentSlideData = slidesRef.current.find(s => s.id === slideId);
    let themeTextColor = defaultSlideTheme.textColor;
    if (currentSlideData) {
        const slideTheme = SLIDE_THEMES.find(st => st.backgroundColor === currentSlideData.backgroundColor && st.textColor === currentSlideData.textElements?.[0]?.color);
        themeTextColor = slideTheme ? slideTheme.textColor : (currentSlideData.textElements?.[0]?.color || defaultSlideTheme.textColor);
    }

    const newTextElements: TextElement[] = template.elements.map(el => ({
      ...el, // This includes default fontWeight, fontStyle, textDecoration from constants.ts
      id: generateId(),
      content: `${el.type.charAt(0).toUpperCase() + el.type.slice(1).toLowerCase().replace('_', ' ')} Text`,
      color: themeTextColor,
      zIndex: el.zIndex ?? 10,
    }));
    handleUpdateSlide(slideId, { textElements: newTextElements });
    setSelectedElement(null);
  }, [handleUpdateSlide]);

  const handleAddDecorationToSlide = useCallback((slideId: string, type: DecorationType) => {
    if (type === DecorationType.NONE) return;

    const currentSlideData = slidesRef.current.find(s => s.id === slideId);
    let determinedDecorationColor = defaultSlideTheme.decorationColor;

    if (currentSlideData) {
        const themeMatchingBackground = SLIDE_THEMES.find(st => st.backgroundColor === currentSlideData.backgroundColor);
        if (themeMatchingBackground) {
            determinedDecorationColor = themeMatchingBackground.decorationColor;
        }
    }

    const newDecoration: Decoration = {
      id: generateId(),
      type,
      color: determinedDecorationColor,
      showPageNumber: false, // Default for all decorations initially
    };

    if (type === DecorationType.BORDER_SIMPLE) {
      newDecoration.borderSides = { top: true, right: true, bottom: true, left: true };
      newDecoration.borderWidth = DEFAULT_BORDER_WIDTH;
    }

    setSlides(prevSlides =>
      prevSlides.map(s => s.id === slideId ? { ...s, decorations: [...s.decorations, newDecoration] } : s)
    );
    triggerThumbnailUpdate(slideId);
  }, [triggerThumbnailUpdate]);

  const handleRemoveDecorationFromSlide = useCallback((slideId: string, decorationId: string) => {
    setSlides(prevSlides =>
      prevSlides.map(s => s.id === slideId ? { ...s, decorations: s.decorations.filter(d => d.id !== decorationId) } : s)
    );
    triggerThumbnailUpdate(slideId);
  }, [triggerThumbnailUpdate]);

  const handleUpdateDecorationOnSlide = useCallback((slideId: string, decorationId: string, updates: Partial<Decoration>) => {
    setSlides(prevSlides =>
      prevSlides.map(s =>
        s.id === slideId
          ? { ...s, decorations: s.decorations.map(d => d.id === decorationId ? { ...d, ...updates } : d) }
          : s
      )
    );
    triggerThumbnailUpdate(slideId);
  }, [triggerThumbnailUpdate]);

  const handleAddTextElementToSlide = useCallback((slideId: string, type: TextElementType) => {
    const currentSlideData = slidesRef.current.find(s => s.id === slideId);
    let textColor = defaultSlideTheme.textColor;
    if (currentSlideData) {
        const slideTheme = SLIDE_THEMES.find(st => st.backgroundColor === currentSlideData.backgroundColor && st.textColor === currentSlideData.textElements?.[0]?.color);
        textColor = slideTheme ? slideTheme.textColor : (currentSlideData.textElements?.[0]?.color || defaultSlideTheme.textColor);
    }
    const newTextElement: TextElement = {
      id: generateId(), type, content: `New ${type.toLowerCase()} text`,
      fontFamily: FontFamily.Roboto, fontSize: type === TextElementType.TITLE ? 32 : 16,
      color: textColor, x: 10, y: 40, width: 80, textAlign: 'left',
      ...defaultTextStyles, // Add default style properties
      zIndex: 10,
    };
     setSlides(prevSlides =>
      prevSlides.map(s => s.id === slideId ? { ...s, textElements: [...s.textElements, newTextElement] } : s)
    );
    triggerThumbnailUpdate(slideId);
  }, [triggerThumbnailUpdate]);


  const handleExport = async () => {
    if (slidesRef.current.length === 0) { alert("No slides to export."); return; }
    setIsExporting(true);
    setSelectedElement(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      await exportSlidesToPDF(slidesRef.current, slideSizeRef.current);
    } catch (error) {
      console.error("PDF Export failed:", error);
      alert("Failed to export PDF. See console for details.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectActiveSlide = (slideId: string) => {
    setActiveSlideId(slideId);
    setSelectedElement(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box component="header" sx={{ mb: { xs: 1.5, sm: 2 } }}>
        <Toolbar
          slideSize={slideSize}
          onSlideSizeChange={(newSize) => {
            setSlideSize(newSize);
            setSelectedElement(null);
            slidesRef.current.forEach(s => triggerThumbnailUpdate(s.id));
          }}
          onAddSlide={handleAddSlide}
          onExportPDF={handleExport}
          isExporting={isExporting}
          slides={slides}
          activeSlideId={activeSlideId}
          onSelectSlide={handleSelectActiveSlide}
          onRemoveSlide={handleRemoveSlide}
          onDuplicateSlide={handleDuplicateSlide}
        />
      </Box>

      <Grid container spacing={{xs: 1.5, sm: 2}} sx={{ flexGrow: 1, minHeight: 0 }}>
        <Grid xs={12} md={4} lg={3.5} xl={3} sx={{ display: 'flex', flexDirection: 'column', minHeight: { md: 'auto' } }}>
          <Box sx={{ flexGrow: 1, height: '100%', minHeight: {xs: '400px', md: 'auto'} }}>
             <EditorPanel
                activeSlide={activeSlide}
                onUpdateSlide={handleUpdateSlide}
                onUpdateTextElement={handleUpdateTextElement}
                onApplyTextTemplate={handleApplyTextTemplate}
                onAddDecorationToSlide={handleAddDecorationToSlide}
                onRemoveDecorationFromSlide={handleRemoveDecorationFromSlide}
                onUpdateDecorationOnSlide={handleUpdateDecorationOnSlide}
                onAddTextElementToSlide={handleAddTextElementToSlide}
                onRemoveTextElementFromSlide={handleRemoveTextElement}
                onApplySlideTheme={handleApplySlideTheme}
                onAddOrReplaceImage={handleAddOrReplaceImage}
                onRemoveImage={handleRemoveImage}
              />
          </Box>
        </Grid>

        <Grid xs={12} md={8} lg={8.5} xl={9} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper
            elevation={2}
            sx={{
                width: '100%',
                height: {xs: 'auto', md: '100%'},
                aspectRatio: {xs: '1 / 1', md: 'auto'},
                p: {xs:1, sm:2},
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
                minHeight: {xs: '300px', sm: '400px', md: 'auto'}
            }}
          >
            {activeSlide && (
              <SlideDisplay
                slide={activeSlide}
                slideIndex={activeSlideIndex}
                size={slideSize}
                selectedElementInfo={selectedElement}
                onSelectElement={setSelectedElement}
                onUpdateTextElement={handleUpdateActiveSlideTextElement}
                onUpdateImageElement={handleUpdateActiveSlideImageElement}
              />
            )}
            {!activeSlide && (
                 <Box sx={{ width: slideSize, height: slideSize, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.200'}}>
                    <Typography>No slide selected or available.</Typography>
                 </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
       <Box component="footer" sx={{ py: 2, textAlign: 'center'}}>
        <Typography variant="caption" color="text.secondary">
          Square Slide Creator - Powered by MUI & React
        </Typography>
      </Box>
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