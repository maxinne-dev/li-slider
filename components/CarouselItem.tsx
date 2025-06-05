
import React from 'react';
import { Slide } from '../types';
// SlideDisplay is no longer rendered here directly
import { CAROUSEL_THUMBNAIL_SIZE } from '../constants';

import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy'; // New Icon for duplicate
import CircularProgress from '@mui/material/CircularProgress'; // For loading state
import BrokenImageIcon from '@mui/icons-material/BrokenImage'; // For error state

interface CarouselItemProps {
  slide: Slide; // Still need full slide for id, index, and thumbnailSrc
  isActive: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onDuplicate: () => void; // New prop for duplicating
  index: number;
}

const CarouselItem: React.FC<CarouselItemProps> = ({ slide, isActive, onSelect, onRemove, onDuplicate, index }) => {
  return (
    <Paper
      elevation={isActive ? 6 : 2}
      onClick={onSelect}
      sx={{
        position: 'relative',
        flexShrink: 0,
        borderRadius: 1,
        overflow: 'hidden',
        cursor: 'pointer',
        width: CAROUSEL_THUMBNAIL_SIZE,
        height: CAROUSEL_THUMBNAIL_SIZE,
        border: isActive ? '2px solid' : '1px solid',
        borderColor: isActive ? 'primary.main' : 'grey.400',
        transition: (theme) => theme.transitions.create(['box-shadow', 'border-color', 'background-color'], {
          duration: theme.transitions.duration.short,
        }),
        '&:hover': {
          borderColor: 'primary.light',
        },
        display: 'flex', // For centering loading/error states
        alignItems: 'center',
        justifyContent: 'center',
        // Set background to slide's background if thumbnail is loaded, else a fallback
        bgcolor: typeof slide.thumbnailSrc === 'string' ? slide.backgroundColor : 'grey.200',
      }}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && onSelect()}
      aria-label={`Select slide ${index + 1}`}
    >
      {slide.thumbnailSrc === undefined && ( // Error state (optional, if we distinguish error from loading)
        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
            <BrokenImageIcon sx={{ fontSize: '2rem' }}/>
            <Typography variant="caption">Error</Typography>
        </Box>
      )}
      {slide.thumbnailSrc === null && ( // Loading state
        <CircularProgress size={24} />
      )}
      {typeof slide.thumbnailSrc === 'string' && ( // Thumbnail loaded
        <img
          src={slide.thumbnailSrc}
          alt={`Slide ${index + 1} thumbnail`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain', // Ensure entire slide is visible
            display: 'block',
          }}
        />
      )}
      
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          p: '2px',
          bgcolor: 'rgba(0,0,0,0.5)',
          borderBottomLeftRadius: (theme) => theme.shape.borderRadius,
        }}
      >
        <IconButton
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            size="small"
            aria-label={`Remove slide ${index + 1}`}
            sx={{ 
              color: 'white',
              padding: '2px', 
              '&:hover': { color: 'error.light' } 
            }}
        >
            <DeleteIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Box>

      {/* Duplicate Button - MOVED TO TOP-LEFT */}
      <Box
        sx={{
          position: 'absolute',
          top: 0, // Changed from bottom
          left: 0,
          p: '2px',
          bgcolor: 'rgba(0,0,0,0.5)',
          borderBottomRightRadius: (theme) => theme.shape.borderRadius, // Adjusted radius corner
        }}
      >
        <IconButton
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            size="small"
            aria-label={`Duplicate slide ${index + 1}`}
            sx={{ 
              color: 'white',
              padding: '2px', 
              '&:hover': { color: 'primary.light' } 
            }}
        >
            <ContentCopyIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      </Box>


      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)', // Center horizontally
          width: '100%', // Ensure it spans enough width to center text
          bgcolor: 'rgba(0,0,0,0.6)',
          color: 'white',
          py: '2px',
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" component="div">
          {index + 1}
        </Typography>
      </Box>

       {/* Active Slide Indicator - MOVED TO BOTTOM-LEFT */}
       {isActive && (
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 2, // Changed from top
            left: 2, 
            p: '2px', 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <VisibilityIcon sx={{ fontSize: '0.8rem' }} />
        </Box>
      )}
    </Paper>
  );
};

export default CarouselItem;
