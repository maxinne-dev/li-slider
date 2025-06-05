
import React from 'react';
import { SLIDE_SIZE_OPTIONS } from '../constants';
import { useAppTheme } from '../contexts/ThemeContext';
import { Slide } from '../types';
import SlideCarousel from './SlideCarousel';

import AppBar from '@mui/material/AppBar';
import ToolbarMUI from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';

import DownloadIcon from '@mui/icons-material/DownloadForOffline';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';

interface ToolbarProps {
  slideSize: number;
  onSlideSizeChange: (newSize: number) => void;
  onAddSlide: () => void;
  onExportPDF: () => void;
  isExporting: boolean;
  slides: Slide[];
  activeSlideId: string | null;
  onSelectSlide: (slideId: string) => void;
  onRemoveSlide: (slideId: string) => void;
  onDuplicateSlide: (slideId: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  slideSize,
  onSlideSizeChange,
  onAddSlide,
  onExportPDF,
  isExporting,
  slides,
  activeSlideId,
  onSelectSlide,
  onRemoveSlide,
  onDuplicateSlide,
}) => {
  const { mode, toggleTheme } = useAppTheme();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleSizeMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSizeMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSizeMenuItemClick = (newSize: number) => {
    onSlideSizeChange(newSize);
    handleSizeMenuClose();
  };

  const currentSizeLabel = SLIDE_SIZE_OPTIONS.find(opt => opt.value === slideSize)?.label || `${slideSize}x${slideSize}px`;

  return (
    <AppBar position="static" color="default" elevation={1} sx={{ borderRadius: 1 }}>
      <ToolbarMUI sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, p: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: {xs: 1, sm: 1.5}, flexWrap: 'wrap' }}>
          <ButtonGroup variant="contained" color="primary" aria-label="slide size selection group">
            <Button
              disableElevation // Added to remove shadow effects on hover
              sx={{
                textTransform: 'none',
                cursor: 'default',
                '&:hover': {
                   backgroundColor: 'primary.main', 
                },
              }}
              disableRipple
              disableFocusRipple
              aria-live="polite" 
            >
              {currentSizeLabel}
            </Button>
            <Button
              id="slide-size-button"
              aria-label="Change slide size"
              aria-controls={open ? 'slide-size-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleSizeMenuClick}
              size="small" 
              sx={{
                minWidth: '30px', 
                paddingLeft: '4px', 
                paddingRight: '4px', 
              }}
            >
              <AspectRatioIcon />
            </Button>
          </ButtonGroup>
          <Menu
            id="slide-size-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleSizeMenuClose}
            MenuListProps={{
              'aria-labelledby': 'slide-size-button',
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {SLIDE_SIZE_OPTIONS.map((option) => (
              <MenuItem
                key={option.value}
                selected={option.value === slideSize}
                onClick={() => handleSizeMenuItemClick(option.value)}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: {xs:0.5, sm:1}, flexWrap: 'wrap' }}>
          <IconButton onClick={toggleTheme} color="inherit" aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DownloadIcon />}
            onClick={onExportPDF}
            disabled={isExporting}
            size="small"
          >
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </Button>
        </Box>
      </ToolbarMUI>
      <Box
        sx={{
          width: '100%',
          px: { xs: 1, sm: 2 },
          py: 1,
          bgcolor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
          borderTop: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <SlideCarousel
          slides={slides}
          activeSlideId={activeSlideId}
          onSelectSlide={onSelectSlide}
          onAddSlide={onAddSlide}
          onRemoveSlide={onRemoveSlide}
          onDuplicateSlide={onDuplicateSlide}
        />
      </Box>
    </AppBar>
  );
};

export default Toolbar;
