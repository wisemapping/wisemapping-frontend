import React from 'react';
import App from './app';
import { createRoot } from 'react-dom/client';

async function bootstrapApplication() {
  const container = document.getElementById('root') as HTMLElement
  const root = createRoot(container!);
  root.render(<App />);
}

bootstrapApplication();
