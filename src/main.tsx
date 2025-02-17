import App from './App';
import { MantineProvider } from '@mantine/core';
import { Notifications } from "@mantine/notifications"
import { BrowserRouter } from 'react-router-dom';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import "./index.css"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
    <MantineProvider>
      <Notifications />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
    </QueryClientProvider>
  </StrictMode>,
)

