
import { useState, useEffect, useCallback } from 'react';
import { AspectRatio, SlideDimensions } from '../types';
import { LOCAL_STORAGE_KEY, DEFAULT_SLIDE_DIMENSIONS, DEFAULT_ASPECT_RATIO, generateSlideSizeOptions, MIN_DIMENSION } from '../constants';

export interface SlideCanvasState {
  slideDimensions: SlideDimensions;
  selectedAspectRatio: AspectRatio;
  isCanvasStateLoaded: boolean;
}

export interface SlideCanvasActions {
  changeSlideDimensions: (newDimensions: SlideDimensions) => void;
  changeAspectRatio: (newRatio: AspectRatio) => SlideDimensions; // Returns the new dimensions
  resetCanvasState: () => void;
}

export const useSlideCanvasState = (): [SlideCanvasState, SlideCanvasActions] => {
  const [slideDimensions, setSlideDimensions] = useState<SlideDimensions>(DEFAULT_SLIDE_DIMENSIONS);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>(DEFAULT_ASPECT_RATIO);
  const [isCanvasStateLoaded, setIsCanvasStateLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const initializeDefaultCanvasState = () => {
        setSlideDimensions(DEFAULT_SLIDE_DIMENSIONS);
        setSelectedAspectRatio(DEFAULT_ASPECT_RATIO);
        setIsCanvasStateLoaded(true);
    };

    try {
      const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        if (
          savedState.slideDimensions && typeof savedState.slideDimensions.width === 'number' && typeof savedState.slideDimensions.height === 'number' &&
          savedState.selectedAspectRatio && typeof savedState.selectedAspectRatio === 'string'
        ) {
          setSlideDimensions(savedState.slideDimensions);
          setSelectedAspectRatio(savedState.selectedAspectRatio);
        } else {
          initializeDefaultCanvasState();
        }
      } else {
        initializeDefaultCanvasState();
      }
    } catch (error) {
      console.error("Could not load canvas state from localStorage:", error);
      initializeDefaultCanvasState();
    }
    setIsCanvasStateLoaded(true);
  }, []);

  // Save canvas state to localStorage
  useEffect(() => {
    if (isCanvasStateLoaded) {
      const stateToSave = {
        slideDimensions,
        selectedAspectRatio,
      };
       const fullStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      let fullState = {};
      if (fullStateJSON) {
        try {
          fullState = JSON.parse(fullStateJSON);
        } catch (e) { console.error("Error parsing existing localStorage state for canvas save", e); }
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...fullState, ...stateToSave }));
    }
  }, [slideDimensions, selectedAspectRatio, isCanvasStateLoaded]);

  const changeSlideDimensions = useCallback((newDimensions: SlideDimensions) => {
    setSlideDimensions(newDimensions);
  }, []);

  const changeAspectRatio = useCallback((newRatio: AspectRatio) => {
    setSelectedAspectRatio(newRatio);
    const newOptions = generateSlideSizeOptions(newRatio);
    let newDims: SlideDimensions;
    if (newOptions.length > 0) {
      newDims = newOptions[0].value;
    } else {
      // Fallback if no options generated (should be rare)
      const fallbackWidth = MIN_DIMENSION;
      const [ratioW, ratioH] = newRatio.split(':').map(Number);
      let fallbackHeight = Math.round((fallbackWidth * ratioH) / ratioW);
      if (fallbackHeight < MIN_DIMENSION) fallbackHeight = MIN_DIMENSION;
      newDims = { width: Math.min(fallbackWidth, MIN_DIMENSION), height: Math.min(fallbackHeight, MIN_DIMENSION) };
    }
    setSlideDimensions(newDims);
    return newDims;
  }, []);

  const resetCanvasState = useCallback(() => {
    setSlideDimensions(DEFAULT_SLIDE_DIMENSIONS);
    setSelectedAspectRatio(DEFAULT_ASPECT_RATIO);
  }, []);

  return [
    { slideDimensions, selectedAspectRatio, isCanvasStateLoaded },
    { changeSlideDimensions, changeAspectRatio, resetCanvasState }
  ];
};
