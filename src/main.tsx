import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import QueryProvider from './app/providers/QueryProvider';
import { router } from './app/router';
import { ToastProvider } from './ui/Toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryProvider>
    <ToastProvider>
      <RouterProvider router={router} />

    </ToastProvider>
  </QueryProvider>
);

// En desarrollo: sin StrictMode para evitar doble montaje/requests duplicados
