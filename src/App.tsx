import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import AboutMe from './pages/AboutMe';
import Experience from './pages/Experience';
import Expertise from './pages/Expertise';
import WhyMe from './pages/WhyMe';

function AnalyticsPageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    const pagePath = location.pathname + location.search;

    (window as any).gtag('event', 'page_view', {
      page_path: pagePath,
    });
  }, [location.pathname, location.search]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AnalyticsPageViewTracker />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Navigation />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<AboutMe />} />
            <Route path="/expertise" element={<Expertise />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/why-me" element={<WhyMe />} />
          </Routes>
        </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}

export default App;