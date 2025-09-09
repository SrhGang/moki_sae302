import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import About from './pages/About';
import NotFound from './pages/NotFound';
import Contact from './pages/Contact';
import Skills from './pages/Skills';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';
import useAuth from './hooks/useAuth';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Vérifie si l'utilisateur est connecte avant de le rediriger vers /administration. S'il est connecte rediriger directment dans /administration/dashboard en utilisant useAuth */}
        <Route path="/administration" element={<Login />} />
        <Route path="/administration/dashboard" element={<Dashboard />} />

        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/project" element={<Project />} />

      </Routes>
    </Router>
  );
};

export default App;
