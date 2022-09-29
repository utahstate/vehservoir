import React from 'react';
import 'terminal.css';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { Router } from './components/router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer theme={'colored'} />
        <Router />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
