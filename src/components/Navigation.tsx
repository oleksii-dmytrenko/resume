import { motion } from 'framer-motion';
import { Brain, Code, User, Zap, Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Navigation = () => {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const startRandomHighlight = () => {
      if (!isHovering) {
        const randomIndex = Math.floor(Math.random() * links.length);
        setHighlightedIndex(randomIndex);
        
        // Reset after 1 second
        setTimeout(() => {
          setHighlightedIndex(null);
        }, 3000);
      }
    };

    // Start the random highlight cycle
    const interval = setInterval(startRandomHighlight, 10000); // Every 3 seconds

    return () => clearInterval(interval);
  }, [isHovering]);

  const links = [
    { to: '/', icon: User, text: 'About Me' },
    { to: '/expertise', icon: Brain, text: 'My Expertise' },
    { to: '/experience', icon: Code, text: 'My Experience' },
    { to: '/why-me', icon: Zap, text: 'Why Me' },
  ];

  return (
    <nav 
      className="fixed top-0 left-0 w-full bg-black/10 backdrop-blur-lg z-50"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="md:hidden">
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={isMobileOpen}
              onClick={() => setIsMobileOpen((v) => !v)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
           >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          <div className="hidden md:flex space-x-8 mx-auto">
            {links.map(({ to, icon: Icon, text }, index) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-5 h-5" />
                  <motion.span
                    className={`${
                      highlightedIndex === index && !isHovering
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent'
                        : ''
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    exit={{ opacity: 0 }}
                  >
                    {text}
                  </motion.span>
                </motion.div>
              </NavLink>
            ))}
          </div>
        </div>
        {isMobileOpen && (
          <div className="md:hidden pb-4">
            <div className="space-y-2">
              {links.map(({ to, icon: Icon, text }, index) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <motion.span
                    className={`${
                      highlightedIndex === index && !isHovering
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent'
                        : ''
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    exit={{ opacity: 0 }}
                  >
                    {text}
                  </motion.span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;