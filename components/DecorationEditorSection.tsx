import React, { useState } from 'react';
import { Decoration, DecorationType, Slide, DecorationOption, GeometricShapeType } from '../types'; 
import { DECORATION_OPTIONS, CORNER_TYPES_OPTIONS, BORDER_THICKNESS_OPTIONS, DEFAULT_BORDER_WIDTH, BLOB_CORNER_TYPES_OPTIONS, BLOB_GENERATION_SIZE, DEFAULT_BLOB_EDGES, DEFAULT_BLOB_GROWTH, GEOMETRIC_SHAPE_FILTER_OPTIONS } from '../constants';
import { generateGeometricShapes } from '../utils/graphicUtils'; // New import
import blobshape from 'blobshape';

import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh'; 
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Slider from '@mui/material/Slider'; // New import

import BorderTopIcon from '@mui/icons-material/BorderTop';
import BorderRightIcon from '@mui/icons-material/BorderRight';
import BorderBottomIcon from '@mui/icons-material/BorderBottom';
import BorderLeftIcon from '@mui/icons-material/BorderLeft';


interface DecorationEditorSectionProps {
  activeSlide: Slide;
  onAddDecoration: (type: DecorationType) => void;
  onRemoveDecoration: (decorationId: string) => void;
  onUpdateDecoration: (decorationId: string, updates: Partial<Decoration>) => void;
}

const DecorationEditorSection: React.FC<DecorationEditorSectionProps> = ({
  activeSlide,
  onAddDecoration,
  onRemoveDecoration,
  onUpdateDecoration
}) => {
  const [cornerMenuAnchorEl, setCornerMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [blobCornerMenuAnchorEl, setBlobCornerMenuAnchorEl] = useState<null | HTMLElement>(null);


  const handleCornerMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setCornerMenuAnchorEl(event.currentTarget);
  };

  const handleCornerMenuClose = () => {
    setCornerMenuAnchorEl(null);
  };

  const handleAddSpecificCorner = (type: DecorationType) => {
    onAddDecoration(type);
    handleCornerMenuClose();
  };
  
  const handleBlobCornerMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setBlobCornerMenuAnchorEl(event.currentTarget);
  };

  const handleBlobCornerMenuClose = () => {
    setBlobCornerMenuAnchorEl(null);
  };

  const handleAddSpecificBlobCorner = (type: DecorationType) => {
    onAddDecoration(type);
    handleBlobCornerMenuClose();
  };


  const handleAddDecoration = (type: DecorationType) => {
    if (type !== DecorationType.NONE && type !== DecorationType.CORNER_SELECTOR && type !== DecorationType.BLOB_SELECTOR) {
      onAddDecoration(type);
    }
  };


  const handleBorderWidthChange = (decorationId: string, event: SelectChangeEvent<number>) => {
    onUpdateDecoration(decorationId, { borderWidth: Number(event.target.value) });
  };

  const handleRefreshBlobShape = (decoration: Decoration) => {
    const newPathData = blobshape({
      size: BLOB_GENERATION_SIZE,
      edges: decoration.blobEdges ?? DEFAULT_BLOB_EDGES,
      growth: decoration.blobGrowth ?? DEFAULT_BLOB_GROWTH,
    }).path;
    onUpdateDecoration(decoration.id, { blobPathData: newPathData });
  };
  
  const handleRefreshGeometricShapes = (decoration: Decoration) => {
    const newGeometricShapes = generateGeometricShapes(decoration.color, 100, decoration.selectedShapeType || 'mixed');
    onUpdateDecoration(decoration.id, { 
      geometricShapes: newGeometricShapes,
      visibleShapeCount: newGeometricShapes.length // Reset count to new total
    });
  };

  const handleGeometricShapeTypeChange = (decorationId: string, event: SelectChangeEvent<GeometricShapeType | 'mixed'>) => {
    const newShapeType = event.target.value as GeometricShapeType | 'mixed';
    // First, update the selectedShapeType
    // Then, trigger a refresh which will use this new type and also reset visibleShapeCount
    // This requires onUpdateDecoration to be synchronous enough for the new type to be available for generateGeometricShapes,
    // or we pass the newShapeType directly to a modified handleRefreshGeometricShapes.
    // For simplicity with current structure, we'll assume onUpdateDecoration is quick,
    // then the refresh will pick up the latest from the activeSlide prop (which might have a slight delay if not careful)
    // A safer way:
    const currentDecoration = activeSlide.decorations.find(d => d.id === decorationId);
    if (currentDecoration) {
        const newGeometricShapes = generateGeometricShapes(currentDecoration.color, 100, newShapeType);
        onUpdateDecoration(decorationId, {
            selectedShapeType: newShapeType,
            geometricShapes: newGeometricShapes,
            visibleShapeCount: newGeometricShapes.length
        });
    }
  };
  
  const handleVisibleShapeCountChange = (decorationId: string, newValue: number | number[]) => {
     onUpdateDecoration(decorationId, { visibleShapeCount: newValue as number });
  };


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <div>
        <Typography variant="subtitle2" component="h4" color="text.secondary" sx={{ mb: 1.5 }}>
          Add Decoration
        </Typography>
        <Grid container spacing={1.5}>
          {DECORATION_OPTIONS.filter(opt => opt.id !== DecorationType.NONE).map(option => (
            <Grid xs={6} sm={4} key={option.id}>
              <Button
                id={option.id === DecorationType.CORNER_SELECTOR ? 'corner-shape-button' : (option.id === DecorationType.BLOB_SELECTOR ? 'blob-corner-shape-button' : undefined)}
                variant="outlined"
                fullWidth
                onClick={(event) => {
                  if (option.id === DecorationType.CORNER_SELECTOR) {
                    handleCornerMenuClick(event);
                  } 
                  else if (option.id === DecorationType.BLOB_SELECTOR) {
                    handleBlobCornerMenuClick(event);
                  }
                   else {
                    handleAddDecoration(option.id);
                  }
                }}
                title={`Add ${option.name}`}
                aria-haspopup={option.id === DecorationType.CORNER_SELECTOR || option.id === DecorationType.BLOB_SELECTOR ? "true" : undefined}
                aria-controls={
                  option.id === DecorationType.CORNER_SELECTOR ? "corner-select-menu" :
                  (option.id === DecorationType.BLOB_SELECTOR ? "blob-corner-select-menu" : undefined)
                }
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    p:1,
                    height: '100px',
                    textAlign: 'center',
                    borderColor: 'divider',
                    '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover'
                    }
                }}
              >
                <Box sx={{
                    height: '40px',
                    width: '100%',
                    mb: 0.5,
                    borderRadius: 0.5,
                    overflow: 'hidden',
                    bgcolor: (theme) => option.id === DecorationType.NONE ? 'transparent' : (theme.palette.mode === 'dark' ? 'grey.700' : 'grey.100'),
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: option.id !== DecorationType.NONE ? '1px dashed' : 'none',
                    borderColor: 'divider'
                 }}>
                  {option.preview}
                </Box>
                <Typography variant="caption" sx={{ lineHeight: 1.2, display: 'block', width: '100%' }}>{option.name}</Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
        <Menu
          id="corner-select-menu"
          anchorEl={cornerMenuAnchorEl}
          open={Boolean(cornerMenuAnchorEl)}
          onClose={handleCornerMenuClose}
          MenuListProps={{
            'aria-labelledby': 'corner-shape-button',
          }}
        >
          {CORNER_TYPES_OPTIONS.map((cornerOpt) => (
            <MenuItem
              key={cornerOpt.type}
              onClick={() => handleAddSpecificCorner(cornerOpt.type)}
            >
              <Typography component="span" sx={{ mr: 1.5, fontSize: '1.2em' }} aria-hidden="true">{cornerOpt.icon}</Typography>
              {cornerOpt.label}
            </MenuItem>
          ))}
        </Menu>
        <Menu
          id="blob-corner-select-menu"
          anchorEl={blobCornerMenuAnchorEl}
          open={Boolean(blobCornerMenuAnchorEl)}
          onClose={handleBlobCornerMenuClose}
          MenuListProps={{
            'aria-labelledby': 'blob-corner-shape-button',
          }}
        >
          {BLOB_CORNER_TYPES_OPTIONS.map((blobOpt) => (
            <MenuItem
              key={blobOpt.type}
              onClick={() => handleAddSpecificBlobCorner(blobOpt.type)}
            >
              <Typography component="span" sx={{ mr: 1.5, fontSize: '1.2em' }} aria-hidden="true">{blobOpt.icon}</Typography>
              {blobOpt.label}
            </MenuItem>
          ))}
        </Menu>
      </div>

      {activeSlide.decorations.length > 0 && (
        <div>
          <Typography variant="subtitle2" component="h4" color="text.secondary" sx={{ mt:1, mb: 1.5 }}>
            Active Decorations
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {activeSlide.decorations.map(dec => {
              let decorationName = 'Unknown Decoration';
              const cornerOptInfo = CORNER_TYPES_OPTIONS.find(opt => opt.type === dec.type);
              const blobOptInfo = BLOB_CORNER_TYPES_OPTIONS.find(opt => opt.type === dec.type);
              const generalOptInfo = DECORATION_OPTIONS.find(opt => opt.id === dec.type);

              if (cornerOptInfo) decorationName = cornerOptInfo.label;
              else if (blobOptInfo) decorationName = blobOptInfo.label;
              else if (generalOptInfo) decorationName = generalOptInfo.name;


              const currentBorderSides = dec.borderSides || { top: true, right: true, bottom: true, left: true };
              const selectedSideValues = Object.entries(currentBorderSides)
                                          .filter(([, isActive]) => isActive)
                                          .map(([sideName]) => sideName);

              const currentBorderWidth = dec.borderWidth === undefined ? DEFAULT_BORDER_WIDTH : dec.borderWidth;
              
              const isTraditionalCorner = CORNER_TYPES_OPTIONS.some(opt => opt.type === dec.type);
              const isBlobCorner = BLOB_CORNER_TYPES_OPTIONS.some(opt => opt.type === dec.type);
              const isGeometricBackground = dec.type === DecorationType.GEOMETRIC_BACKGROUND;
              const showPageNumberSwitch = (isTraditionalCorner || isBlobCorner) && dec.showPageNumber !== undefined;

              const totalGeometricShapes = dec.geometricShapes?.length ?? 0;
              const currentVisibleGeometricShapes = dec.visibleShapeCount ?? totalGeometricShapes;


              return (
                <Paper key={dec.id} elevation={2} sx={{ p: 1.5, bgcolor: 'action.hover' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: (isGeometricBackground || showPageNumberSwitch || dec.type === DecorationType.BORDER_SIMPLE) ? 1 : 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.primary', flexGrow: 1 }}>
                      {decorationName}
                    </Typography>
                    {(isBlobCorner || isGeometricBackground) && (
                       <IconButton
                        onClick={() => isBlobCorner ? handleRefreshBlobShape(dec) : handleRefreshGeometricShapes(dec)}
                        size="small"
                        color="default" 
                        aria-label={`Refresh ${decorationName} ${isBlobCorner ? 'shape' : 'pattern'}`}
                        sx={{ mr: 0.5 }} 
                      >
                        <RefreshIcon fontSize="small"/>
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() => onRemoveDecoration(dec.id)}
                      size="small"
                      color="error"
                      aria-label={`Remove ${decorationName}`}
                    >
                      <DeleteIcon fontSize="small"/>
                    </IconButton>
                  </Box>

                  {showPageNumberSwitch && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(dec.showPageNumber)}
                          onChange={(e) => onUpdateDecoration(dec.id, { showPageNumber: e.target.checked })}
                          size="small"
                        />
                      }
                      label={<Typography variant="caption">Show Page Number</Typography>}
                      sx={{mt: -0.5, mb: 0.5}} 
                    />
                  )}

                  {isGeometricBackground && (
                    <Stack spacing={2} sx={{ mt: 1 }}>
                       <Divider sx={{mb:1}}/>
                       <FormControl fullWidth size="small">
                         <InputLabel id={`geo-shape-type-label-${dec.id}`}>Shape Type</InputLabel>
                         <Select
                           labelId={`geo-shape-type-label-${dec.id}`}
                           value={dec.selectedShapeType || 'mixed'}
                           label="Shape Type"
                           onChange={(e) => handleGeometricShapeTypeChange(dec.id, e as SelectChangeEvent<GeometricShapeType | 'mixed'>)}
                         >
                           {GEOMETRIC_SHAPE_FILTER_OPTIONS.map(opt => (
                             <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                           ))}
                         </Select>
                       </FormControl>
                       <Box>
                          <Typography variant="caption" display="block" id={`visible-shapes-slider-label-${dec.id}`} gutterBottom>
                            Visible Shapes: {currentVisibleGeometricShapes} / {totalGeometricShapes}
                          </Typography>
                          <Slider
                            size="small"
                            value={currentVisibleGeometricShapes}
                            min={0}
                            max={totalGeometricShapes}
                            onChange={(_, newValue) => handleVisibleShapeCountChange(dec.id, newValue)}
                            aria-labelledby={`visible-shapes-slider-label-${dec.id}`}
                            valueLabelDisplay="auto"
                            disabled={totalGeometricShapes === 0}
                          />
                       </Box>
                    </Stack>
                  )}

                  {dec.type === DecorationType.BORDER_SIMPLE && (
                    <Stack spacing={2} sx={{ mt: 1.5 }}>
                       <Divider sx={{mb:1}}/>
                       <Box>
                          <Typography variant="caption" display="block" sx={{ mb: 1, fontWeight: 'medium' }}>
                            Border Sides
                          </Typography>
                          <ToggleButtonGroup
                            value={selectedSideValues}
                            aria-label="Select border sides"
                            size="small"
                          >
                            <ToggleButton 
                              value="top" 
                              aria-label="Top Border"
                              selected={currentBorderSides.top}
                              onClick={() => onUpdateDecoration(dec.id, { borderSides: { ...currentBorderSides, top: !currentBorderSides.top }})}
                            >
                              <BorderTopIcon />
                            </ToggleButton>
                            <ToggleButton 
                              value="right" 
                              aria-label="Right Border"
                              selected={currentBorderSides.right}
                              onClick={() => onUpdateDecoration(dec.id, { borderSides: { ...currentBorderSides, right: !currentBorderSides.right }})}
                            >
                              <BorderRightIcon />
                            </ToggleButton>
                            <ToggleButton 
                              value="bottom" 
                              aria-label="Bottom Border"
                              selected={currentBorderSides.bottom}
                              onClick={() => onUpdateDecoration(dec.id, { borderSides: { ...currentBorderSides, bottom: !currentBorderSides.bottom }})}
                            >
                              <BorderBottomIcon />
                            </ToggleButton>
                            <ToggleButton 
                              value="left" 
                              aria-label="Left Border"
                              selected={currentBorderSides.left}
                              onClick={() => onUpdateDecoration(dec.id, { borderSides: { ...currentBorderSides, left: !currentBorderSides.left }})}
                            >
                              <BorderLeftIcon />
                            </ToggleButton>
                          </ToggleButtonGroup>
                        </Box>
                        <FormControl fullWidth size="small">
                          <InputLabel id={`border-width-label-${dec.id}`}>Thickness</InputLabel>
                          <Select
                            labelId={`border-width-label-${dec.id}`}
                            value={currentBorderWidth}
                            label="Thickness"
                            onChange={(e) => handleBorderWidthChange(dec.id, e as SelectChangeEvent<number>)}
                          >
                            {BORDER_THICKNESS_OPTIONS.map(opt => (
                              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                    </Stack>
                  )}
                </Paper>
              );
            })}
          </Box>
        </div>
      )}
      {activeSlide.decorations.length === 0 && (
         <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center', py: 2, mt:1}}>
           No decorations on this slide. Click above to add one.
         </Typography>
      )}
    </Box>
  );
};

export default DecorationEditorSection;