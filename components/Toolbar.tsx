import React from 'react';
import { generateSlideSizeOptions, ASPECT_RATIO_OPTIONS } from '../constants'; // Updated import
import { useAppTheme } from '../contexts/ThemeContext';
import { Slide, AspectRatio, SlideDimensions, SlideSizeOption } from '../types'; // Updated import
import SlideCarousel from './SlideCarousel';

import AppBar from '@mui/material/AppBar';
import ToolbarMUI from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

import DownloadIcon from '@mui/icons-material/DownloadForOffline';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AspectRatioIcon from '@mui/icons-material/AspectRatio'; // For size dropdown
import CropOriginalIcon from '@mui/icons-material/CropOriginal'; // For aspect ratio dropdown
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'; // For Clear Data button

interface ToolbarProps {
  slideDimensions: SlideDimensions; // Changed from slideSize
  onSlideDimensionsChange: (newDimensions: SlideDimensions) => void; // Changed from onSlideSizeChange
  selectedAspectRatio: AspectRatio; // New prop
  onAspectRatioChange: (newRatio: AspectRatio) => void; // New prop
  onAddSlide: () => void;
  onExportPDF: () => void;
  isExporting: boolean;
  slides: Slide[];
  activeSlideId: string | null;
  onSelectSlide: (slideId: string) => void;
  onRemoveSlide: (slideId: string) => void;
  onDuplicateSlide: (slideId: string) => void;
  onClearData: () => void; // New prop for clearing data
}

const Toolbar: React.FC<ToolbarProps> = ({
  slideDimensions,
  onSlideDimensionsChange,
  selectedAspectRatio,
  onAspectRatioChange,
  onAddSlide,
  onExportPDF,
  isExporting,
  slides,
  activeSlideId,
  onSelectSlide,
  onRemoveSlide,
  onDuplicateSlide,
  onClearData, // New prop
}) => {
  const { mode, toggleTheme } = useAppTheme();

  const [sizeMenuAnchorEl, setSizeMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const isSizeMenuOpen = Boolean(sizeMenuAnchorEl);

  const [ratioMenuAnchorEl, setRatioMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const isRatioMenuOpen = Boolean(ratioMenuAnchorEl);

  const handleSizeMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSizeMenuAnchorEl(event.currentTarget);
  };
  const handleSizeMenuClose = () => {
    setSizeMenuAnchorEl(null);
  };
  const handleSizeMenuItemClick = (newDimensions: SlideDimensions) => {
    onSlideDimensionsChange(newDimensions);
    handleSizeMenuClose();
  };

  const handleRatioMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setRatioMenuAnchorEl(event.currentTarget);
  };
  const handleRatioMenuClose = () => {
    setRatioMenuAnchorEl(null);
  };
  const handleRatioMenuItemClick = (newRatio: AspectRatio) => {
    onAspectRatioChange(newRatio);
    handleRatioMenuClose();
  };

  const currentSizeLabel = `${slideDimensions.width}x${slideDimensions.height}px`;
  const currentRatioLabel = ASPECT_RATIO_OPTIONS.find(opt => opt.value === selectedAspectRatio)?.label || selectedAspectRatio;
  const availableSizeOptions = generateSlideSizeOptions(selectedAspectRatio);

  return (
    <AppBar position="static" color="default" elevation={1} sx={{ borderRadius: 1 }}>
      <ToolbarMUI sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, p: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: {xs: 1, sm: 1.5}, flexWrap: 'wrap' }}>
          {/* Aspect Ratio Selector */}
          <ButtonGroup variant="outlined" color="primary" aria-label="slide aspect ratio selection group">
            <Button
              sx={{ textTransform: 'none', cursor: 'default', '&:hover': { backgroundColor: 'transparent' } }}
              disableRipple disableFocusRipple aria-live="polite"
            >
              {currentRatioLabel}
            </Button>
            <Button
              id="aspect-ratio-button" aria-label="Change aspect ratio"
              aria-controls={isRatioMenuOpen ? 'aspect-ratio-menu' : undefined}
              aria-haspopup="true" aria-expanded={isRatioMenuOpen ? 'true' : undefined}
              onClick={handleRatioMenuClick} size="small" sx={{ minWidth: '30px', paddingLeft: '4px', paddingRight: '4px' }}
            >
              <CropOriginalIcon />
            </Button>
          </ButtonGroup>
          <Menu
            id="aspect-ratio-menu" anchorEl={ratioMenuAnchorEl} open={isRatioMenuOpen} onClose={handleRatioMenuClose}
            MenuListProps={{ 'aria-labelledby': 'aspect-ratio-button' }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {ASPECT_RATIO_OPTIONS.map((option) => (
              <MenuItem key={option.value} selected={option.value === selectedAspectRatio} onClick={() => handleRatioMenuItemClick(option.value)}>
                {option.label}
              </MenuItem>
            ))}
          </Menu>

          {/* Slide Size Selector */}
          <ButtonGroup variant="contained" color="primary" aria-label="slide dimension selection group">
            <Button
              disableElevation
              sx={{ textTransform: 'none', cursor: 'default', '&:hover': { backgroundColor: 'primary.main' } }}
              disableRipple disableFocusRipple aria-live="polite"
            >
              {currentSizeLabel}
            </Button>
            <Button
              id="slide-size-button" aria-label="Change slide dimensions"
              aria-controls={isSizeMenuOpen ? 'slide-size-menu' : undefined}
              aria-haspopup="true" aria-expanded={isSizeMenuOpen ? 'true' : undefined}
              onClick={handleSizeMenuClick} size="small" sx={{ minWidth: '30px', paddingLeft: '4px', paddingRight: '4px' }}
            >
              <AspectRatioIcon />
            </Button>
          </ButtonGroup>
          <Menu
            id="slide-size-menu" anchorEl={sizeMenuAnchorEl} open={isSizeMenuOpen} onClose={handleSizeMenuClose}
            MenuListProps={{ 'aria-labelledby': 'slide-size-button' }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            {availableSizeOptions.map((option) => (
              <MenuItem
                key={option.label}
                selected={option.value.width === slideDimensions.width && option.value.height === slideDimensions.height}
                onClick={() => handleSizeMenuItemClick(option.value)}
              >
                {option.label}
              </MenuItem>
            ))}
            {availableSizeOptions.length === 0 && (
                <MenuItem disabled>No sizes available for this ratio and constraints.</MenuItem>
            )}
          </Menu>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: {xs:0.5, sm:1}, flexWrap: 'wrap' }}>
          <IconButton onClick={toggleTheme} color="inherit" aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Tooltip title="Clear all saved data and reset application">
            <Button
              variant="outlined"
              color="warning"
              startIcon={<DeleteSweepIcon />}
              onClick={onClearData}
              size="small"
              disabled={isExporting}
              aria-label="Clear all saved data and reset application"
            >
              Clear Data
            </Button>
          </Tooltip>
          <Button
            variant="contained" color="secondary" startIcon={<DownloadIcon />}
            onClick={onExportPDF} disabled={isExporting} size="small"
          >
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </Button>
        </Box>
      </ToolbarMUI>
      <Box
        sx={{
          width: '100%', px: { xs: 1, sm: 2 }, py: 1,
          bgcolor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
          borderTop: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <SlideCarousel
          slides={slides} activeSlideId={activeSlideId} onSelectSlide={onSelectSlide}
          onAddSlide={onAddSlide} onRemoveSlide={onRemoveSlide} onDuplicateSlide={onDuplicateSlide}
        />
      </Box>
    </AppBar>
  );
};

export default Toolbar;
