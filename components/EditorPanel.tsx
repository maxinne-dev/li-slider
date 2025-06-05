import React, { useState } from 'react';
import { Slide, TextTemplate, DecorationType, TextElementType, SlideThemePalette, SlideImage } from '../types';
import SlideThemeEditor from './SlideThemeEditor';
import ContentEditorSection from './TextEditorSection'; // Changed import path
import DecorationEditorSection from './DecorationEditorSection';

import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface EditorPanelProps {
  activeSlide: Slide | null;
  onUpdateSlide: (slideId: string, updates: Partial<Slide>) => void;
  onUpdateTextElement: (slideId: string, elementId: string, updates: Partial<Slide['textElements'][0]>) => void;
  onApplyTextTemplate: (slideId: string, template: TextTemplate) => void;
  onAddDecorationToSlide: (slideId: string, type: DecorationType) => void;
  onRemoveDecorationFromSlide: (slideId: string, decorationId: string) => void;
  onUpdateDecorationOnSlide: (slideId: string, decorationId: string, updates: Partial<Slide['decorations'][0]>) => void;
  onAddTextElementToSlide: (slideId: string, type: TextElementType) => void;
  onRemoveTextElementFromSlide: (slideId: string, elementId: string) => void;
  onApplySlideTheme: (slideId: string, theme: SlideThemePalette) => void;
  onAddOrReplaceImage: (slideId: string, file: File) => void; // New prop
  onRemoveImage: (slideId: string) => void; // New prop
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`editor-tabpanel-${index}`}
      aria-labelledby={`editor-tab-${index}`}
      {...other}
      style={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}
    >
      {value === index && (
        <Box sx={{ p: {xs: 1.5, sm:2}, flexGrow: 1, overflowY: 'auto' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  activeSlide,
  onUpdateSlide,
  onUpdateTextElement,
  onApplyTextTemplate,
  onAddDecorationToSlide,
  onRemoveDecorationFromSlide,
  onUpdateDecorationOnSlide,
  onAddTextElementToSlide,
  onRemoveTextElementFromSlide,
  onApplySlideTheme,
  onAddOrReplaceImage, // New prop
  onRemoveImage, // New prop
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (!activeSlide) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: {xs:2, sm:3},
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
        }}
      >
        <Typography color="text.secondary">Select a slide to start editing.</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, overflow:'hidden' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Editor tabs" variant="fullWidth">
          <Tab label="Theme" id="editor-tab-0" aria-controls="editor-tabpanel-0" />
          <Tab label="CONTENT" id="editor-tab-1" aria-controls="editor-tabpanel-1" /> {/* Changed label */}
          <Tab label="Decorations" id="editor-tab-2" aria-controls="editor-tabpanel-2" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <SlideThemeEditor
          activeSlide={activeSlide}
          onApplySlideTheme={(theme) => onApplySlideTheme(activeSlide.id, theme)}
        />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <ContentEditorSection
          activeSlide={activeSlide}
          onUpdateTextElement={(elementId, updates) => onUpdateTextElement(activeSlide.id, elementId, updates)}
          onApplyTextTemplate={(template) => onApplyTextTemplate(activeSlide.id, template)}
          onRemoveTextElement={(elementId) => onRemoveTextElementFromSlide(activeSlide.id, elementId)}
          onAddOrReplaceImage={(file) => onAddOrReplaceImage(activeSlide.id, file)} // Pass new handler
          onRemoveImage={() => onRemoveImage(activeSlide.id)} // Pass new handler
        />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <DecorationEditorSection
          activeSlide={activeSlide}
          onAddDecoration={(type) => onAddDecorationToSlide(activeSlide.id, type)}
          onRemoveDecoration={(decorationId) => onRemoveDecorationFromSlide(activeSlide.id, decorationId)}
          onUpdateDecoration={(decorationId, updates) => onUpdateDecorationOnSlide(activeSlide.id, decorationId, updates)}
        />
      </TabPanel>
    </Paper>
  );
};

export default EditorPanel;