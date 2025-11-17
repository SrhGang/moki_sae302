import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';


import Login from './pages/Login';
import Signup from './pages/Signup';
import Avatar from './pages/Avatar';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from 'contexts/AuthContext';


import './styles/global.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/avatar" element={<Avatar />} />
        </Routes>
      </Router>
    </AuthProvider>
    
  );
};

export default App;
