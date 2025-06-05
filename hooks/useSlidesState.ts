
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Slide, TextElement, Decoration, TextTemplate, DecorationType, TextElementType,
  FontFamily, TextTemplateType, SlideThemePalette, SlideImage, GeometricShapeItem,
  GeometricShapeType
} from '../types';
import {
  LOCAL_STORAGE_KEY, TEXT_TEMPLATES, SLIDE_THEMES, CAROUSEL_THUMBNAIL_SIZE,
  DEFAULT_BORDER_WIDTH, DEFAULT_BLOB_EDGES, DEFAULT_BLOB_GROWTH, BLOB_GENERATION_SIZE
} from '../constants';
import { generateSlideThumbnail } from '../utils/thumbnailGenerator';
import { generateGeometricShapes } from '../utils/graphicUtils';
import blobshape from 'blobshape';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const defaultSlideTheme = SLIDE_THEMES[0];
const defaultTextStyles = {
  fontWeight: 'normal' as 'normal' | 'bold',
  fontStyle: 'normal' as 'normal' | 'italic',
  textDecoration: 'none' as 'none' | 'underline',
  zIndex: 10,
};

const createNewSlideInternal = (referenceSlide?: Slide, slidesCountForPageNumber?: number): Slide => {
  const newId = generateId();
  if (referenceSlide) {
    return {
      id: newId,
      backgroundColor: referenceSlide.backgroundColor,
      decorations: referenceSlide.decorations.map(dec => {
        const newDecId = generateId();
        let geometricShapes: GeometricShapeItem[] | undefined = undefined;
        let selectedShapeType: GeometricShapeType | 'mixed' | undefined = undefined;
        let visibleShapeCount: number | undefined = undefined;

        if (dec.type === DecorationType.GEOMETRIC_BACKGROUND) {
            selectedShapeType = dec.selectedShapeType || 'mixed';
            geometricShapes = dec.geometricShapes
                ? dec.geometricShapes.map(shape => ({...shape, id: generateId()}))
                : generateGeometricShapes(dec.color || defaultSlideTheme.decorationColor, 100, selectedShapeType);
            visibleShapeCount = dec.visibleShapeCount !== undefined ? dec.visibleShapeCount : geometricShapes.length;
        }

        return {
          ...dec,
          id: newDecId,
          borderSides: dec.type === DecorationType.BORDER_SIMPLE ? (dec.borderSides || { top: true, right: true, bottom: true, left: true }) : undefined,
          borderWidth: dec.type === DecorationType.BORDER_SIMPLE ? (dec.borderWidth || DEFAULT_BORDER_WIDTH) : undefined,
          blobEdges: dec.type.startsWith('CORNER_BLOB_') ? (dec.blobEdges || DEFAULT_BLOB_EDGES) : undefined,
          blobGrowth: dec.type.startsWith('CORNER_BLOB_') ? (dec.blobGrowth || DEFAULT_BLOB_GROWTH) : undefined,
          blobPathData: dec.type.startsWith('CORNER_BLOB_')
            ? (dec.blobPathData || blobshape({ size: BLOB_GENERATION_SIZE, edges: dec.blobEdges || DEFAULT_BLOB_EDGES, growth: dec.blobGrowth || DEFAULT_BLOB_GROWTH }).path)
            : undefined,
          geometricShapes: geometricShapes,
          selectedShapeType: selectedShapeType,
          visibleShapeCount: visibleShapeCount,
        };
      }),
      textElements: referenceSlide.textElements.map(el => ({ ...el, id: generateId(), fontWeight: el.fontWeight || defaultTextStyles.fontWeight, fontStyle: el.fontStyle || defaultTextStyles.fontStyle, textDecoration: el.textDecoration || defaultTextStyles.textDecoration, zIndex: el.zIndex ?? defaultTextStyles.zIndex })),
      image: referenceSlide.image ? { ...referenceSlide.image, id: generateId() } : undefined,
      thumbnailSrc: null,
    };
  }
  // Default new slide
  const defaultElements = TEXT_TEMPLATES.find(t => t.id === TextTemplateType.TITLE_ONLY)?.elements
    .map(el => ({ ...el, id: generateId(), content: `Your ${el.type.toLowerCase()} here`, color: defaultSlideTheme.textColor, ...defaultTextStyles })) || [];
  
  return {
    id: newId,
    backgroundColor: defaultSlideTheme.backgroundColor,
    decorations: [],
    textElements: defaultElements,
    image: undefined,
    thumbnailSrc: null,
  };
};

export interface SlidesState {
  slides: Slide[];
  activeSlideId: string | null;
  activeSlide: Slide | null;
  activeSlideIndex: number | undefined;
  isSlidesLoaded: boolean;
}

export interface SlidesActions {
  addSlide: (referenceSlideId?: string) => string;
  removeSlide: (slideIdToRemove: string) => void;
  duplicateSlide: (slideIdToDuplicate: string) => void;
  updateSlide: (slideId: string, updates: Partial<Slide>) => void;
  selectSlide: (slideId: string) => string | null;
  addOrReplaceImage: (slideId: string, file: File) => void;
  removeImage: (slideId: string) => void;
  applySlideTheme: (slideId: string, theme: SlideThemePalette) => void;
  updateTextElement: (slideId: string, elementId: string, updates: Partial<TextElement>) => void;
  removeTextElement: (slideId: string, elementId: string) => void;
  applyTextTemplate: (slideId: string, template: TextTemplate) => void;
  addDecoration: (slideId: string, type: DecorationType) => void;
  removeDecoration: (slideId: string, decorationId: string) => void;
  updateDecoration: (slideId: string, decorationId: string, updates: Partial<Decoration>) => void;
  addTextElement: (slideId: string, type: TextElementType) => void;
  resetSlidesState: () => void;
  forceThumbnailUpdate: (slideId: string) => void;
}


export const useSlidesState = (
    initialSlideDimensions: () => import('../types').SlideDimensions // Function to get current dimensions
): [SlidesState, SlidesActions] => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const [isSlidesLoaded, setIsSlidesLoaded] = useState(false);

  const slidesRef = useRef(slides);
  useEffect(() => { slidesRef.current = slides; }, [slides]);

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerThumbnailUpdate = useCallback((slideId: string) => {
    if (!slideId || !isSlidesLoaded) return;
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

    debounceTimeoutRef.current = setTimeout(async () => {
      const currentSlides = slidesRef.current;
      const slideToUpdate = currentSlides.find(s => s.id === slideId);
      const slideIndexToUpdate = currentSlides.findIndex(s => s.id === slideId);

      if (!slideToUpdate || slideIndexToUpdate === -1) return;
      
      const currentSlideRenderDimensions = initialSlideDimensions();
      const thumbnail = await generateSlideThumbnail(slideToUpdate, slideIndexToUpdate, currentSlideRenderDimensions, CAROUSEL_THUMBNAIL_SIZE);
      setSlides(prevSlides => prevSlides.map(s => s.id === slideId ? { ...s, thumbnailSrc: thumbnail } : s));
    }, 300);
  }, [isSlidesLoaded, initialSlideDimensions]);


  // Load state from localStorage on mount
  useEffect(() => {
    const initializeDefaultState = () => {
      const firstSlide = createNewSlideInternal();
      setSlides([firstSlide]);
      setActiveSlideId(firstSlide.id);
      setIsSlidesLoaded(true);
    };

    try {
      const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        if (savedState.slides && Array.isArray(savedState.slides)) {
           const rehydratedSlides = savedState.slides.map((loadedSlide: Slide) => {
            const rehydratedDecorations = loadedSlide.decorations.map(dec => {
              let newDec = { ...dec };
              if (dec.type.startsWith('CORNER_BLOB_')) {
                newDec.blobEdges = dec.blobEdges ?? DEFAULT_BLOB_EDGES;
                newDec.blobGrowth = dec.blobGrowth ?? DEFAULT_BLOB_GROWTH;
                if (!dec.blobPathData) {
                  newDec.blobPathData = blobshape({ size: BLOB_GENERATION_SIZE, edges: newDec.blobEdges, growth: newDec.blobGrowth }).path;
                }
              }
              if (dec.type === DecorationType.GEOMETRIC_BACKGROUND) {
                newDec.selectedShapeType = dec.selectedShapeType || 'mixed';
                if (!dec.geometricShapes || dec.geometricShapes.length === 0) {
                  const shapes = generateGeometricShapes(dec.color, 100, newDec.selectedShapeType);
                  newDec.geometricShapes = shapes;
                  newDec.visibleShapeCount = dec.visibleShapeCount !== undefined ? Math.min(dec.visibleShapeCount, shapes.length) : shapes.length;
                } else {
                  newDec.geometricShapes = dec.geometricShapes.map(shape => ({ ...shape, id: shape.id || generateId() }));
                  newDec.visibleShapeCount = dec.visibleShapeCount !== undefined ? Math.min(dec.visibleShapeCount, newDec.geometricShapes.length) : newDec.geometricShapes.length;

                }
              }
              if (dec.type === DecorationType.BORDER_SIMPLE) {
                  newDec.borderSides = dec.borderSides || { top: true, right: true, bottom: true, left: true };
                  newDec.borderWidth = dec.borderWidth || DEFAULT_BORDER_WIDTH;
              }
              return newDec;
            });
            const rehydratedTextElements = (loadedSlide.textElements || []).map(el => ({
                ...el,
                fontWeight: el.fontWeight || defaultTextStyles.fontWeight,
                fontStyle: el.fontStyle || defaultTextStyles.fontStyle,
                textDecoration: el.textDecoration || defaultTextStyles.textDecoration,
                zIndex: el.zIndex ?? defaultTextStyles.zIndex,
            }));
            return { ...loadedSlide, decorations: rehydratedDecorations, textElements: rehydratedTextElements, thumbnailSrc: null }; // Force thumbnail regen
          });

          setSlides(rehydratedSlides.length > 0 ? rehydratedSlides : [createNewSlideInternal()]);
          setActiveSlideId(savedState.activeSlideId || (rehydratedSlides.length > 0 ? rehydratedSlides[0].id : null));
        } else {
          initializeDefaultState();
        }
      } else {
        initializeDefaultState();
      }
    } catch (error) {
      console.error("Could not load slides state from localStorage:", error);
      initializeDefaultState();
    }
    setIsSlidesLoaded(true);
  }, []);

  // Save slides state to localStorage
  useEffect(() => {
    if (isSlidesLoaded) {
      const stateToSave = {
        slides: slidesRef.current,
        activeSlideId: activeSlideId,
      };
      // Only pick slide-related parts for this hook's concern
      const fullStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      let fullState = {};
      if (fullStateJSON) {
        try {
          fullState = JSON.parse(fullStateJSON);
        } catch (e) { console.error("Error parsing existing localStorage state", e); }
      }
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...fullState, ...stateToSave }));
    }
  }, [slides, activeSlideId, isSlidesLoaded]);


  // Auto-select slide if activeSlideId is null or invalid
 useEffect(() => {
    if (isSlidesLoaded) {
      if (slides.length > 0) {
        const activeExists = slides.some(s => s.id === activeSlideId);
        if (!activeSlideId || !activeExists) {
          setActiveSlideId(slides[0].id);
        }
      } else { // No slides exist, create one
        const newSlide = createNewSlideInternal();
        setSlides([newSlide]);
        setActiveSlideId(newSlide.id);
      }
    }
  }, [slides, activeSlideId, isSlidesLoaded]);

  // Trigger thumbnail updates for slides that need it
  useEffect(() => {
    if(isSlidesLoaded) {
        slidesRef.current.forEach(slide => {
            if (slide.id && slide.thumbnailSrc === null) {
                triggerThumbnailUpdate(slide.id);
            }
        });
    }
  }, [slides, triggerThumbnailUpdate, isSlidesLoaded]);


  const addSlide = useCallback((referenceSlideId?: string) => {
    const refSlide = referenceSlideId ? slidesRef.current.find(s => s.id === referenceSlideId) : slidesRef.current[slidesRef.current.length -1];
    const newSlide = createNewSlideInternal(refSlide, slidesRef.current.length);
    setSlides(prevSlides => [...prevSlides, newSlide]);
    setActiveSlideId(newSlide.id);
    return newSlide.id;
  }, []);

  const removeSlide = useCallback((slideIdToRemove: string) => {
    setSlides(prevSlides => {
      const slideToRemoveIndex = prevSlides.findIndex(s => s.id === slideIdToRemove);
      const newSlides = prevSlides.filter(s => s.id !== slideIdToRemove);
      if (activeSlideId === slideIdToRemove) {
          if (newSlides.length > 0) {
            const newIndex = Math.min(Math.max(0, slideToRemoveIndex -1), newSlides.length - 1);
            setActiveSlideId(newSlides[newIndex].id);
          } else {
            const defaultNewSlide = createNewSlideInternal(undefined, 0);
            setActiveSlideId(defaultNewSlide.id);
            return [defaultNewSlide];
          }
      }
      if (newSlides.length === 0) {
          const defaultNewSlide = createNewSlideInternal(undefined, 0);
          setActiveSlideId(defaultNewSlide.id);
          return [defaultNewSlide];
      }
      return newSlides;
    });
  }, [activeSlideId]);

  const duplicateSlide = useCallback((slideIdToDuplicate: string) => {
    const slideToDuplicate = slidesRef.current.find(s => s.id === slideIdToDuplicate);
    if (slideToDuplicate) {
      const newSlide = createNewSlideInternal(slideToDuplicate, slidesRef.current.length);
      const slideIndex = slidesRef.current.findIndex(s => s.id === slideIdToDuplicate);
      setSlides(prevSlides => {
          const newSlidesArray = [...prevSlides];
          newSlidesArray.splice(slideIndex + 1, 0, newSlide);
          return newSlidesArray;
      });
      setActiveSlideId(newSlide.id);
    }
  }, []);

  const updateSlideInternal = useCallback((slideId: string, updates: Partial<Slide>) => {
    setSlides(prevSlides => prevSlides.map(s => (s.id === slideId ? { ...s, ...updates } : s)));
    triggerThumbnailUpdate(slideId);
  }, [triggerThumbnailUpdate]);

  const selectSlide = useCallback((slideId: string) : string | null => {
    if (slidesRef.current.find(s => s.id === slideId)) {
        setActiveSlideId(slideId);
        return slideId;
    }
    return null;
  }, []);

  const addOrReplaceImage = useCallback((slideId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (src) {
        const img = new Image();
        img.onload = () => {
          const newImage: SlideImage = { id: generateId(), src, alt: file.name || 'Uploaded image', originalWidth: img.width, originalHeight: img.height, x: 5, y: 5, width: 90, height: 90, zIndex: 1 };
          updateSlideInternal(slideId, { image: newImage });
          // Caller might want to setSelectedElement({id: newImage.id, type: 'image'})
        };
        img.src = src;
      }
    };
    reader.readAsDataURL(file);
  }, [updateSlideInternal]);

  const removeImage = useCallback((slideId: string) => {
    updateSlideInternal(slideId, { image: undefined });
    // Caller might want to setSelectedElement(null) if this image was selected
  }, [updateSlideInternal]);

  const applySlideTheme = useCallback((slideId: string, theme: SlideThemePalette) => {
    const slideToUpdate = slidesRef.current.find(s => s.id === slideId);
    if (!slideToUpdate) return;

    const newTextElements = slideToUpdate.textElements.map(el => ({ ...el, color: theme.textColor }));
    const newDecorations = slideToUpdate.decorations.map(dec => {
        const updatedDec = { ...dec, color: theme.decorationColor };
        if (dec.type === DecorationType.GEOMETRIC_BACKGROUND) {
          const newShapes = generateGeometricShapes(theme.decorationColor, 100, dec.selectedShapeType || 'mixed');
          updatedDec.geometricShapes = newShapes;
          updatedDec.visibleShapeCount = dec.visibleShapeCount !== undefined && dec.visibleShapeCount <= newShapes.length ? dec.visibleShapeCount : newShapes.length;
        }
        return updatedDec;
    });
    updateSlideInternal(slideId, { backgroundColor: theme.backgroundColor, textElements: newTextElements, decorations: newDecorations });
  }, [updateSlideInternal]);

  const updateTextElement = useCallback((slideId: string, elementId: string, updates: Partial<TextElement>) => {
    const slide = slidesRef.current.find(s => s.id === slideId);
    if (slide) {
      const newTextElements = slide.textElements.map(el => el.id === elementId ? { ...el, ...updates } : el);
      updateSlideInternal(slideId, { textElements: newTextElements });
    }
  }, [updateSlideInternal]);

  const removeTextElement = useCallback((slideId: string, elementId: string) => {
     const slide = slidesRef.current.find(s => s.id === slideId);
     if (slide) {
        const newTextElements = slide.textElements.filter(el => el.id !== elementId);
        updateSlideInternal(slideId, {textElements: newTextElements});
        // Caller might want to setSelectedElement(null)
     }
  }, [updateSlideInternal]);

  const applyTextTemplate = useCallback((slideId: string, template: TextTemplate) => {
    const currentSlideData = slidesRef.current.find(s => s.id === slideId);
    let themeTextColor = defaultSlideTheme.textColor;
    if (currentSlideData) {
        const slideTheme = SLIDE_THEMES.find(st => st.backgroundColor === currentSlideData.backgroundColor && st.textColor === currentSlideData.textElements?.[0]?.color);
        themeTextColor = slideTheme ? slideTheme.textColor : (currentSlideData.textElements?.[0]?.color || defaultSlideTheme.textColor);
    }
    const newTextElements: TextElement[] = template.elements.map(el => ({ ...el, id: generateId(), content: `${el.type.charAt(0).toUpperCase() + el.type.slice(1).toLowerCase().replace('_', ' ')} Text`, color: themeTextColor, zIndex: el.zIndex ?? defaultTextStyles.zIndex }));
    updateSlideInternal(slideId, { textElements: newTextElements });
    // Caller might want to setSelectedElement(null)
  }, [updateSlideInternal]);

  const addDecoration = useCallback((slideId: string, type: DecorationType) => {
    if (type === DecorationType.NONE) return;
    const currentSlideData = slidesRef.current.find(s => s.id === slideId);
    let determinedDecorationColor = defaultSlideTheme.decorationColor;
     if (currentSlideData) {
        const themeMatchingBackground = SLIDE_THEMES.find(st => st.backgroundColor === currentSlideData.backgroundColor);
        if (themeMatchingBackground) determinedDecorationColor = themeMatchingBackground.decorationColor;
        else if (currentSlideData.decorations.length > 0) determinedDecorationColor = currentSlideData.decorations[0].color;
        else { const themeMatchingTextColor = SLIDE_THEMES.find(st => st.textColor === currentSlideData.textElements?.[0]?.color); if(themeMatchingTextColor) determinedDecorationColor = themeMatchingTextColor.decorationColor; }
    }

    const newDecoration: Decoration = { id: generateId(), type, color: determinedDecorationColor, showPageNumber: false };
    if (type === DecorationType.BORDER_SIMPLE) {
      newDecoration.borderSides = { top: true, right: true, bottom: true, left: true };
      newDecoration.borderWidth = DEFAULT_BORDER_WIDTH;
    } else if (type.startsWith('CORNER_BLOB_')) {
      newDecoration.blobEdges = DEFAULT_BLOB_EDGES; newDecoration.blobGrowth = DEFAULT_BLOB_GROWTH;
      newDecoration.blobPathData = blobshape({ size: BLOB_GENERATION_SIZE, edges: DEFAULT_BLOB_EDGES, growth: DEFAULT_BLOB_GROWTH }).path;
    } else if (type === DecorationType.GEOMETRIC_BACKGROUND) {
      const initialShapes = generateGeometricShapes(determinedDecorationColor, 100, 'mixed');
      newDecoration.geometricShapes = initialShapes; newDecoration.selectedShapeType = 'mixed';
      newDecoration.visibleShapeCount = initialShapes.length; newDecoration.showPageNumber = undefined;
    }
    const slide = slidesRef.current.find(s => s.id === slideId);
    if (slide) {
        updateSlideInternal(slideId, { decorations: [...slide.decorations, newDecoration] });
    }
  }, [updateSlideInternal]);

  const removeDecoration = useCallback((slideId: string, decorationId: string) => {
    const slide = slidesRef.current.find(s => s.id === slideId);
    if (slide) {
        const newDecorations = slide.decorations.filter(d => d.id !== decorationId);
        updateSlideInternal(slideId, { decorations: newDecorations });
    }
  }, [updateSlideInternal]);

  const updateDecoration = useCallback((slideId: string, decorationId: string, updates: Partial<Decoration>) => {
    const slide = slidesRef.current.find(s => s.id === slideId);
    if (slide) {
        const newDecorations = slide.decorations.map(d => d.id === decorationId ? { ...d, ...updates } : d);
        updateSlideInternal(slideId, { decorations: newDecorations });
    }
  }, [updateSlideInternal]);

  const addTextElement = useCallback((slideId: string, type: TextElementType) => {
     const currentSlideData = slidesRef.current.find(s => s.id === slideId);
     let themeTextColor = defaultSlideTheme.textColor;
     if (currentSlideData) {
        const theme = SLIDE_THEMES.find(st => st.backgroundColor === currentSlideData.backgroundColor);
        themeTextColor = theme ? theme.textColor : (currentSlideData.textElements?.[0]?.color || defaultSlideTheme.textColor);
     }
     const defaultElementProps = TEXT_TEMPLATES.find(t => t.id === TextTemplateType.TITLE_ONLY)?.elements[0] || { type: TextElementType.BODY, fontFamily: FontFamily.Roboto, fontSize: 18, x: 10, y: 50, width: 80, textAlign: 'left' };
     const newElement: TextElement = {
        ...defaultElementProps,
        id: generateId(),
        type: type,
        content: `New ${type.toLowerCase()} text`,
        color: themeTextColor,
        zIndex: defaultTextStyles.zIndex,
     };
    const slide = slidesRef.current.find(s => s.id === slideId);
    if (slide) {
        updateSlideInternal(slideId, { textElements: [...slide.textElements, newElement] });
    }
  }, [updateSlideInternal]);

  const resetSlidesState = useCallback(() => {
    const firstSlide = createNewSlideInternal(undefined, 0);
    setSlides([firstSlide]);
    setActiveSlideId(firstSlide.id);
    // Thumbnails will be regen'd by useEffect
  }, []);
  
  const activeSlide = slides.find(s => s.id === activeSlideId) || null;
  const activeSlideIndex = activeSlide ? slides.findIndex(s => s.id === activeSlideId) : undefined;


  return [
    { slides, activeSlideId, activeSlide, activeSlideIndex, isSlidesLoaded },
    {
      addSlide, removeSlide, duplicateSlide, updateSlide: updateSlideInternal, selectSlide,
      addOrReplaceImage, removeImage, applySlideTheme, updateTextElement,
      removeTextElement, applyTextTemplate, addDecoration, removeDecoration,
      updateDecoration, addTextElement, resetSlidesState,
      forceThumbnailUpdate: triggerThumbnailUpdate,
    }
  ];
};
