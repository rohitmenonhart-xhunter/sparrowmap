import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import PublicMap from './pages/PublicMap';
import PlotterMap from './pages/PlotterMap';
import AdminMap from './pages/AdminMap';
import PlotterSignIn from './pages/PlotterSignIn';
import PlotterSignUp from './pages/PlotterSignUp';
import Landing from './pages/Landing';
import About from './pages/About';
import Contact from './pages/Contact';
import { Bird, Map, Shield } from 'lucide-react';

function Navigation() {
  const location = useLocation();
  
  // Don't show navigation on landing page, about page, or contact page
  if (location.pathname === '/' || location.pathname === '/about' || location.pathname === '/contact') {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-2 bg-white rounded-full shadow-lg p-2">
      <Link 
        to="/map" 
        className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Map className="w-5 h-5" />
        <span>Public Map</span>
      </Link>
      <Link 
        to="/plotter-signin" 
        className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bird className="w-5 h-5" />
        <span>Plot Sparrow</span>
      </Link>
      <Link 
        to="/admin" 
        className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Shield className="w-5 h-5" />
        <span>Admin</span>
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/map" element={<PublicMap />} />
        <Route path="/plotter-signin" element={<PlotterSignIn />} />
        <Route path="/plotter-signup" element={<PlotterSignUp />} />
        <Route path="/plotter" element={<PlotterMap />} />
        <Route path="/admin" element={<AdminMap />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}