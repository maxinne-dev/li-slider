import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme, CssBaseline } from '@mui/material';
import type { PaletteMode } from '@mui/material';
import { AppThemeContextType, ThemeMode } from '../types';

// Define default state for our custom context
const defaultState: AppThemeContextType = {
  mode: 'light',
  toggleTheme: () => {},
};

// Our custom context, still named AppThemeContext for clarity
const AppThemeContext = createContext<AppThemeContextType>(defaultState);

export const AppThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('app-theme') as ThemeMode | null;
      if (savedTheme) {
        return savedTheme;
      }
      // Return system preference if available, else default to light
      // return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light'; // Default to light
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark'); // For Tailwind compatibility if any parts still use it
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('app-theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Create MUI theme based on the current mode
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode, // 'light' or 'dark'
          ...(mode === 'light' 
            ? {
                // primary: { main: '#1976d2' }, // Default blue
                // secondary: { main: '#dc004e' }, // Default pink
                background: {
                  // default: '#f5f5f5', // Lighter grey for light mode
                  // paper: '#ffffff',
                }
              }
            : {
                // primary: { main: '#90caf9' }, // Lighter blue for dark mode
                // secondary: { main: '#f48fb1' }, // Lighter pink for dark mode
                background: {
                  // default: '#121212', // Standard dark background
                  // paper: '#1e1e1e', // Slightly lighter for paper elements
                }
            }
          ),
        },
        // You can customize typography, spacing, breakpoints, etc. here
        typography: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            // You might want to scale down some font sizes for a compact tool
            // h6: { fontSize: '1rem' },
            // subtitle1: { fontSize: '0.9rem' },
            // body1: { fontSize: '0.9rem' },
            // button: { textTransform: 'none' } // If you prefer buttons not to be all caps
        },
        shape: {
            borderRadius: 8, // Default is 4, 8 gives a bit more rounded look
        },
        components: {
            MuiButtonBase: {
                defaultProps: {
                    // disableRipple: true, // Example: disable ripple effect globally
                },
            },
            MuiPaper: {
                // defaultProps: {
                //     elevation: 2, // Slightly less prominent paper elements by default
                // }
            }
        }
      }),
    [mode]
  );

  return (
    <AppThemeContext.Provider value={{ mode, toggleTheme }}>
      <MUIThemeProvider theme={muiTheme}>
        <CssBaseline /> {/* Normalizes styles and applies background based on theme */}
        {children}
      </MUIThemeProvider>
    </AppThemeContext.Provider>
  );
};

// Custom hook to use our AppThemeContext
export const useAppTheme = (): AppThemeContextType => {
  const context = useContext(AppThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }
  return context;
};