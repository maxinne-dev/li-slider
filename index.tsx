
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Ensure hooks directory is recognized by the build system if not already.
// No specific import needed here, but noting its conceptual addition.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
