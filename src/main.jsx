import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx';
import './index.css';

/* global Office */
Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
});
