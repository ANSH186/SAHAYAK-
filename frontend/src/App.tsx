import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './lib/authContext';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
