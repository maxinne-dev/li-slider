
import React from 'react';
import { SlideThemePalette, Slide } from '../types';
import { SLIDE_THEMES } from '../constants';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2'; // Changed import
import Paper from '@mui/material/Paper';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface SlideThemeEditorProps {
  activeSlide: Slide; // To potentially indicate the current theme
  onApplySlideTheme: (theme: SlideThemePalette) => void;
}

const SlideThemeEditor: React.FC<SlideThemeEditorProps> = ({ activeSlide, onApplySlideTheme }) => {
  
  // Determine if a theme is currently "active" based on the slide's colors
  // This is a heuristic and might not be perfect if individual colors were manually changed.
  const getIsThemeActive = (theme: SlideThemePalette) => {
    if (!activeSlide) return false;
    // Check if all text elements exist and match theme's text color
    const allTextElementsMatch = activeSlide.textElements?.length > 0 ? activeSlide.textElements.every(el => el.color === theme.textColor) : true;
    // Check if all decorations exist and match theme's decoration color
    const allDecorationsMatch = activeSlide.decorations?.length > 0 ? activeSlide.decorations.every(dec => dec.color === theme.decorationColor) : true;
    // If there are no text elements or no decorations, those checks should pass for theme application purposes.
    // A theme can be considered active if background matches, and any existing text/decorations also match.
    
    return activeSlide.backgroundColor === theme.backgroundColor &&
           (activeSlide.textElements?.length === 0 || allTextElementsMatch) &&
           (activeSlide.decorations?.length === 0 || allDecorationsMatch);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" component="h4" color="text.secondary" sx={{ mb: 0.5 }}>
        Select a Slide Theme
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
        Applying a theme will update the background, text, and decoration colors.
      </Typography>
      <Grid container spacing={2}>
        {SLIDE_THEMES.map((theme) => {
          const isSelected = getIsThemeActive(theme);
          return (
            <Grid xs={6} sm={6} md={4} key={theme.id}>
              <Paper
                elevation={isSelected ? 4 : 1}
                onClick={() => onApplySlideTheme(theme)}
                sx={{
                  m: 1, // Increased margin around the Paper
                  p: 1.5, // Inner padding of the Paper
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: isSelected ? 'primary.main' : 'transparent',
                  position: 'relative',
                  transition: (muiTheme) => muiTheme.transitions.create(['border-color', 'box-shadow', 'margin']),
                  '&:hover': {
                    borderColor: isSelected ? 'primary.dark' : 'primary.light',
                    boxShadow: (muiTheme) => muiTheme.shadows[3],
                  },
                }}
                role="button"
                aria-pressed={isSelected}
                aria-label={`Apply ${theme.name} theme`}
              >
                {isSelected && (
                  <CheckCircleIcon 
                    sx={{ 
                      position: 'absolute', 
                      top: 4, 
                      right: 4, 
                      color: 'primary.main',
                      fontSize: '1.2rem'
                    }} 
                  />
                )}
                <Typography 
                  variant="body2" 
                  component="div" 
                  sx={{ 
                    fontWeight: 'medium', 
                    mb: 1, 
                    textAlign: 'center',
                    minHeight: (theme) => theme.spacing(5), // Approx 40px (2 lines of body2)
                    display: 'flex',
                    alignItems: 'center', // Vertically center text if it's shorter
                    justifyContent: 'center' 
                  }}
                >
                  {theme.name}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 24 }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: theme.backgroundColor, border: '1px solid rgba(0,0,0,0.2)' }} title={`Background: ${theme.backgroundColor}`}/>
                  <Box sx={{ width: 20, height: 20, bgcolor: theme.textColor, border: '1px solid rgba(0,0,0,0.2)' }} title={`Text: ${theme.textColor}`}/>
                  <Box sx={{ width: 20, height: 20, bgcolor: theme.decorationColor, border: '1px solid rgba(0,0,0,0.2)' }} title={`Decoration: ${theme.decorationColor}`}/>
                </Box>
                 <Typography variant="caption" display="block" sx={{ textAlign: 'center', mt: 0.5, color: 'text.secondary' }}>
                    ({theme.mode} slide)
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default SlideThemeEditor;
