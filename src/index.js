import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import CustomThemeProvider from './ThemeContext';

const root = ReactDOM.createRoot(document.getElementById('root')).render(
  <CustomThemeProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </CustomThemeProvider>
);