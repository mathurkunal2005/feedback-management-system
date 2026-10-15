import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 600,
              color: '#1F1A3D',
              border: '2px solid #1F1A3D',
              borderRadius: '14px',
              boxShadow: '3px 3px 0 0 #1F1A3D',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
