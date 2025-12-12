import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApiKeyProvider } from '@/contexts/ApiKeyContext';
import HomePage from '@/components/HomePage';
import Dashboard from '@/components/Dashboard';

function App() {
  return (
    <ApiKeyProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard/:jdId" element={<Dashboard />} />
        </Routes>
      </Router>
    </ApiKeyProvider>
  );
}

export default App;
