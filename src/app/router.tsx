// src/app/router.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import RequireAuth from "./RequireAuth";
import RequireRole from "./RequireRole";
import AppShell from "./AppShell";
import TastingsByDayPage from "@/features/tastings/pages/TastingsByDayPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import CalendarPage from "@/features/calendar/pages/CalendarPage";
import NewEventPage from "@/features/events/pages/NewEventPage";
import EventPage from "@/features/events/pages/EventPage";
import BlockDaysPage from "@/features/calendar/pages/BlockDaysPage";
import DishesPage from "@/features/dishes/pages/DishesPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },

  {
    path: "/",
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/calendar" replace /> },
      { path: "calendar", element: <CalendarPage /> },
      { path: "calendar/tastings/:date", element: <TastingsByDayPage /> },

      {
        path: "calendar/block-days",
        element: (
          <RequireRole allowed={["admin"]}>
            <BlockDaysPage />
          </RequireRole>
        ),
      },

      { path: "events/new", element: <NewEventPage /> },
      { path: "events/:id", element: <EventPage /> },

      {
        path: "dishes",
        element: (
          <RequireRole allowed={["admin"]}>
            <DishesPage />
          </RequireRole>
        ),
      },
    ],
  },

  { path: "*", element: <Navigate to="/calendar" replace /> },
]);
