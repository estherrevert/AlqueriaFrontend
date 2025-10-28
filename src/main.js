import { jsx as _jsx } from "react/jsx-runtime";
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import QueryProvider from './app/providers/QueryProvider';
import { router } from './app/router';
import { ToastProvider } from './ui/Toast';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(QueryProvider, { children: _jsx(ToastProvider, { children: _jsx(RouterProvider, { router: router }) }) }));
