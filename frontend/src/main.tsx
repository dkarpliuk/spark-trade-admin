import './index.css'
import './styles/index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { TooltipProvider } from '@/components/ui/tooltip'

import App from './App.tsx'
import Home from './pages/Home.tsx'
import PipelineRuns from './pages/PipelineRuns.tsx'
import PipelineStatus from './pages/PipelineStatus.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'pipeline-runs', element: <PipelineRuns /> },
      { path: 'pipeline-status', element: <PipelineStatus /> },
    ],
  },
])

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: false },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
)
