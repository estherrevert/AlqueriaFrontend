import { createBrowserRouter, Navigate } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import AppShell from './AppShell';
import TastingsByDayPage from '@/features/tastings/pages/TastingsByDayPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import CalendarPage from '@/features/calendar/pages/CalendarPage';
import NewEventPage from '@/features/events/pages/NewEventPage';
import EventPage from '@/features/events/pages/EventPage';
import BlockDaysPage from '@/features/calendar/pages/BlockDaysPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  
  {
    path: '/',
    
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/calendar" replace /> },
      { path: 'calendar', element: <CalendarPage /> },
{ path: 'calendar/tastings/:date', element: <TastingsByDayPage /> }, // ⬅️ nueva
      { path: 'events/new', element: <NewEventPage /> },
      { path: 'events/:id', element: <EventPage /> },
      { path: "/calendar/block-days", element: <BlockDaysPage /> }, 

    ],
  },
  { path: '*', element: <Navigate to="/calendar" replace /> },
]);
