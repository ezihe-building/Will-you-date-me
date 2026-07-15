import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// Generated API URLs already include /api prefix; only set a base URL
// when VITE_API_URL points to a different origin (e.g. cross-origin Expo dev).
setBaseUrl(import.meta.env.VITE_API_URL || null);

createRoot(document.getElementById('root')!).render(<App />);
