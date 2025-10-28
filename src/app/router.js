import { jsx as _jsx } from "react/jsx-runtime";
// src/app/router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import RequireRole from './RequireRole';
import AppShell from './AppShell';
import TastingsByDayPage from '@/features/tastings/pages/TastingsByDayPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import CalendarPage from '@/features/calendar/pages/CalendarPage';
import NewEventPage from '@/features/events/pages/NewEventPage';
import EventPage from '@/features/events/pages/EventPage';
import BlockDaysPage from '@/features/calendar/pages/BlockDaysPage';
export const router = createBrowserRouter([
    { path: '/login', element: _jsx(LoginPage, {}) },
    {
        path: '/',
        element: (_jsx(RequireAuth, { children: _jsx(AppShell, {}) })),
        children: [
            { index: true, element: _jsx(Navigate, { to: "/calendar", replace: true }) },
            { path: 'calendar', element: _jsx(CalendarPage, {}) },
            { path: 'calendar/tastings/:date', element: _jsx(TastingsByDayPage, {}) },
            {
                path: 'calendar/block-days',
                element: (_jsx(RequireRole, { allowed: ['admin'], children: _jsx(BlockDaysPage, {}) })),
            },
            { path: 'events/new', element: _jsx(NewEventPage, {}) },
            { path: 'events/:id', element: _jsx(EventPage, {}) },
        ],
    },
    { path: '*', element: _jsx(Navigate, { to: "/calendar", replace: true }) },
]);
