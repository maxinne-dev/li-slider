
import React from 'react';
import { Slide } from '../types';
import CarouselItem from './CarouselItem';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';

interface SlideCarouselProps {
  slides: Slide[];
  activeSlideId: string | null;
  onSelectSlide: (slideId: string) => void;
  onAddSlide: () => void;
  onRemoveSlide: (slideId: string) => void;
  onDuplicateSlide: (slideId: string) => void; // New prop
}

const SlideCarousel: React.FC<SlideCarouselProps> = ({ slides, activeSlideId, onSelectSlide, onAddSlide, onRemoveSlide, onDuplicateSlide }) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (activeSlideId && carouselRef.current) {
      const activeItem = carouselRef.current.querySelector(`[data-slide-id="${activeSlideId}"]`);
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeSlideId]);
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        // No explicit padding here, let the container in Toolbar manage it.
        // Or, if specific padding is needed: pt: 0.5, pb:0.5
        // bgcolor: 'transparent' // To blend with Toolbar's Box background
      }}
    >
      {/* Removed Typography heading "Slides" */}
      <Box
        ref={carouselRef} 
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          overflowX: 'auto',
          pb: 1, // For scrollbar visibility if items overflow
          // Custom scrollbar styling
          '&::-webkit-scrollbar': {
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.600' : 'grey.400',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.500' : 'grey.500',
          },
        }}
      >
        {slides.map((slide, index) => (
          <div key={slide.id} data-slide-id={slide.id}> {/* Keep data-slide-id for scrollIntoView */}
            <CarouselItem
              slide={slide}
              isActive={slide.id === activeSlideId}
              onSelect={() => onSelectSlide(slide.id)}
              onRemove={() => onRemoveSlide(slide.id)}
              onDuplicate={() => onDuplicateSlide(slide.id)} // Pass handler
              index={index}
            />
          </div>
        ))}
        <Button
          onClick={onAddSlide}
          variant="outlined"
          aria-label="Add new slide"
          sx={{
            flexShrink: 0,
            width: '80px', 
            height: '80px',
            minWidth: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover'
            }
          }}
        >
          <AddIcon sx={{ fontSize: '2rem', mb: 0.5 }} />
          <Typography variant="caption" sx={{ lineHeight: 1 }}>Add</Typography>
        </Button>
      </Box>
    </Paper>
  );
};

export default SlideCarousel;
