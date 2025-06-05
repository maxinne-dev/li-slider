
import React from 'react';
import { TextElement, Slide, FontFamily, TextTemplate, TextElementType, SlideImage } from '../types';
import { AVAILABLE_FONTS, TEXT_TEMPLATES, FONT_SIZE_OPTIONS } from '../constants';

import Typography from '@mui/material/Typography';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ReplaceIcon from '@mui/icons-material/ChangeCircle';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import Stack from '@mui/material/Stack';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';


interface ContentEditorSectionProps {
  activeSlide: Slide;
  onUpdateTextElement: (elementId: string, updates: Partial<TextElement>) => void;
  onApplyTextTemplate: (template: TextTemplate) => void;
  onRemoveTextElement: (elementId: string) => void;
  onAddOrReplaceImage: (file: File) => void;
  onRemoveImage: () => void;
}

const alignmentOptions = [
  { value: 'left' as const, label: 'Align Left', icon: <FormatAlignLeftIcon fontSize="small" /> },
  { value: 'center' as const, label: 'Align Center', icon: <FormatAlignCenterIcon fontSize="small" /> },
  { value: 'right' as const, label: 'Align Right', icon: <FormatAlignRightIcon fontSize="small" /> },
];

const getCurrentAlignmentIcon = (textAlign: 'left' | 'center' | 'right') => {
  const option = alignmentOptions.find(opt => opt.value === textAlign);
  return option ? React.cloneElement(option.icon, { fontSize: 'medium' }) : <FormatAlignLeftIcon fontSize="medium" />; // Default icon
};


const ContentEditorSection: React.FC<ContentEditorSectionProps> = ({
  activeSlide,
  onUpdateTextElement,
  onApplyTextTemplate,
  onRemoveTextElement,
  onAddOrReplaceImage,
  onRemoveImage,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [alignmentMenuAnchorEl, setAlignmentMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [currentEditingTextElementId, setCurrentEditingTextElementId] = React.useState<string | null>(null);

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAddOrReplaceImage(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleTemplateChange = (event: SelectChangeEvent<string>) => {
    const templateId = event.target.value;
    const selectedTemplate = TEXT_TEMPLATES.find(t => t.id === templateId);
    if (selectedTemplate) {
      onApplyTextTemplate(selectedTemplate);
    }
  };

  const handleAlignmentMenuClick = (event: React.MouseEvent<HTMLElement>, elementId: string) => {
    setAlignmentMenuAnchorEl(event.currentTarget);
    setCurrentEditingTextElementId(elementId);
  };

  const handleAlignmentMenuClose = () => {
    setAlignmentMenuAnchorEl(null);
    setCurrentEditingTextElementId(null);
  };

  const handleAlignmentSelect = (elementId: string, newAlignment: 'left' | 'center' | 'right') => {
    onUpdateTextElement(elementId, { textAlign: newAlignment });
    handleAlignmentMenuClose();
  };


  const renderTextElementEditor = (el: TextElement) => {
    return (
      <Paper key={el.id} elevation={2} sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 'medium', color: 'primary.main', textTransform: 'uppercase' }}>
            {el.type}
          </Typography>
          <Button
            onClick={() => onRemoveTextElement(el.id)}
            size="small"
            color="error"
            variant="text"
            startIcon={<DeleteOutlineIcon />}
            aria-label={`Remove ${el.type} element`}
          >
            Remove
          </Button>
        </Box>

        <TextField
          label="Content"
          value={el.content}
          onChange={(e) => onUpdateTextElement(el.id, { content: e.target.value })}
          multiline
          rows={3}
          fullWidth
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
          placeholder={`Enter ${el.type.toLowerCase()} text...`}
        />

        <Stack spacing={1.5} direction="column">
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 150, flexGrow: 1 }}>
              <InputLabel id={`font-family-label-${el.id}`}>Font</InputLabel>
              <Select
                labelId={`font-family-label-${el.id}`}
                label="Font"
                value={el.fontFamily}
                onChange={(e) => onUpdateTextElement(el.id, { fontFamily: e.target.value as FontFamily })}
              >
                {AVAILABLE_FONTS.map(font => (
                  <MenuItem key={font.value} value={font.value} className={font.className}>{font.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <InputLabel id={`font-size-label-${el.id}`}>Size</InputLabel>
              <Select
                labelId={`font-size-label-${el.id}`}
                label="Size"
                value={el.fontSize}
                onChange={(e) => onUpdateTextElement(el.id, { fontSize: Number(e.target.value) })}
              >
                {FONT_SIZE_OPTIONS.map(sizeOpt => (
                  <MenuItem key={sizeOpt.value} value={sizeOpt.value}>{sizeOpt.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <ToggleButtonGroup size="small" aria-label="Text formatting">
              <ToggleButton
                value="bold"
                selected={el.fontWeight === 'bold'}
                onChange={() => onUpdateTextElement(el.id, { fontWeight: el.fontWeight === 'bold' ? 'normal' : 'bold' })}
                aria-label="Bold"
              >
                <FormatBoldIcon />
              </ToggleButton>
              <ToggleButton
                value="italic"
                selected={el.fontStyle === 'italic'}
                onChange={() => onUpdateTextElement(el.id, { fontStyle: el.fontStyle === 'italic' ? 'normal' : 'italic' })}
                aria-label="Italic"
              >
                <FormatItalicIcon />
              </ToggleButton>
              <ToggleButton
                value="underline"
                selected={el.textDecoration === 'underline'}
                onChange={() => onUpdateTextElement(el.id, { textDecoration: el.textDecoration === 'underline' ? 'none' : 'underline' })}
                aria-label="Underline"
              >
                <FormatUnderlinedIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Box>
              <Tooltip title={`Alignment: ${el.textAlign.charAt(0).toUpperCase() + el.textAlign.slice(1)}`}>
                <Button
                  id={`alignment-button-${el.id}`}
                  aria-controls={Boolean(alignmentMenuAnchorEl) && currentEditingTextElementId === el.id ? `alignment-menu-${el.id}` : undefined}
                  aria-haspopup="true"
                  aria-expanded={Boolean(alignmentMenuAnchorEl) && currentEditingTextElementId === el.id ? 'true' : undefined}
                  onClick={(e) => handleAlignmentMenuClick(e, el.id)}
                  size="small"
                  variant="outlined"
                  sx={{ minWidth: 'auto', p: '5px' }} 
                >
                  {getCurrentAlignmentIcon(el.textAlign)}
                </Button>
              </Tooltip>
              <Menu
                id={`alignment-menu-${el.id}`}
                anchorEl={alignmentMenuAnchorEl}
                open={Boolean(alignmentMenuAnchorEl) && currentEditingTextElementId === el.id}
                onClose={handleAlignmentMenuClose}
                MenuListProps={{ 'aria-labelledby': `alignment-button-${el.id}` }}
              >
                {alignmentOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    selected={option.value === el.textAlign}
                    onClick={() => handleAlignmentSelect(el.id, option.value)}
                  >
                    {React.cloneElement(option.icon, { sx: { mr: 1.5 }})}
                    {option.label}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Stack>
        </Stack>
      </Paper>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="subtitle2" component="h4" color="text.secondary" sx={{ mb: 1.5 }}>
          Image
        </Typography>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          aria-label="Upload image file"
        />
        {activeSlide.image && (
          <Paper elevation={1} sx={{ p: 1.5, mb: 1.5, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'action.selected' }}>
            <Box
              component="img"
              src={activeSlide.image.src}
              alt={activeSlide.image.alt || 'Current slide image'}
              sx={{
                width: 'auto',
                height: '60px',
                maxHeight: '60px',
                maxWidth: '100px',
                objectFit: 'contain',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="caption" display="block" noWrap sx={{ mb: 0.5, maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeSlide.image.alt}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activeSlide.image.originalWidth}x{activeSlide.image.originalHeight}px
              </Typography>
            </Box>
            <IconButton
              onClick={onRemoveImage}
              size="small"
              color="error"
              aria-label="Remove image from slide"
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Paper>
        )}
        <Button
          onClick={handleImageUploadClick}
          variant="contained"
          startIcon={activeSlide.image ? <ReplaceIcon /> : <AddPhotoAlternateIcon />}
          fullWidth
        >
          {activeSlide.image ? 'Replace Image' : 'Add Image'}
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Image will be centered and fit proportionally.
        </Typography>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box>
        <Typography variant="subtitle2" component="h4" color="text.secondary" sx={{ mb: 1.5 }}>
          Text Templates
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel id="text-template-label">Text Templates</InputLabel>
          <Select
            labelId="text-template-label"
            label="Text Templates"
            value=""
            onChange={handleTemplateChange}
            displayEmpty
          >
            <MenuItem value="" disabled>
              <em>Select a template to apply...</em>
            </MenuItem>
            {TEXT_TEMPLATES.map(template => (
              <MenuItem key={template.id} value={template.id}>{template.name}</MenuItem>
            ))}
          </Select>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            Applying a template will replace existing text elements.
          </Typography>
        </FormControl>
      </Box>

      {activeSlide.textElements.length > 0 && (
        <Box>
          <Typography variant="subtitle2" component="h4" color="text.secondary" sx={{ mt: 1, mb: 1.5 }}>
            Edit Text Elements
          </Typography>
          {activeSlide.textElements.map(renderTextElementEditor)}
        </Box>
      )}
      {activeSlide.textElements.length === 0 && !activeSlide.image && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2, mt: 1 }}>
          No content on this slide. Add an image or apply a text template.
        </Typography>
      )}
      {activeSlide.textElements.length === 0 && activeSlide.image && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2, mt: 1 }}>
          No text elements on this slide. Apply a template to add text.
        </Typography>
      )}
    </Box>
  );
};

export default ContentEditorSection;
