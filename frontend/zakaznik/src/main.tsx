import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import Formular from './app/formular/Formular';
import Pozadavek from './app/pozadavek/Pozadavek';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { index: true, path: "/", element: <Formular /> },
  { path: "/pozadavek/:id", element: <Pozadavek/> },
  { path: "/*", element: <Navigate to="/" /> },
]);

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
)
