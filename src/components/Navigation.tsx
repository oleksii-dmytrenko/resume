import { motion } from 'framer-motion';
import { Brain, Code, User, Zap } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Navigation = () => {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

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
        <div className="flex items-center justify-center h-16">
          <div className="flex space-x-8">
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
      </div>
    </nav>
  );
};

export default Navigation;