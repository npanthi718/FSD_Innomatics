import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  // your routes
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});