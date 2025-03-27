import { motion } from 'framer-motion';
import { Download, Github, Linkedin, Briefcase } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const AboutMe = () => {
  const greetingVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const greeting = "Hi, my name is Olek";

  return (
    <PageTransition>
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src="/avatar3.jpeg"
              alt="Profile"
              className="w-64 h-64 rounded-full object-cover border-4 border-white/10"
            />
            <div className="text-center md:text-left">
              <motion.h1
                className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
                variants={greetingVariants}
                initial="hidden"
                animate="visible"
              >
                {greeting.split('').map((char, index) => (
                  <motion.span
                    key={index}
                    variants={letterVariants}
                    className="inline-block mx-[0.05em]"
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
              </motion.h1>
              <p className="text-xl text-gray-300 mt-2">I am a Full Stack AI Engineer</p>
              <p className="text-gray-400 mt-4">
                Passionate about creating innovative solutions and pushing the boundaries
                of what's possible with modern web technologies. With over 8 years of
                experience in full-stack development, I specialize in building
                scalable, cost effective applications.
              </p>
              <motion.a
                href="https://docs.google.com/document/d/1rLNO-tLTGXTvR9_KiIeCA_Lhk7F1U0stWZFH_s4g6N8/export?format=pdf"
                download="OleksiiDmytrenko_CV.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-5 h-5 mr-2" />
                Download CV
              </motion.a>
              <div className="flex gap-4 mt-6 justify-center md:justify-start">
                <motion.a
                  href="https://github.com/oleksii-dmytrenko"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Github className="w-6 h-6 text-white" />
                </motion.a>
                <motion.a
                  href="https://www.linkedin.com/in/oleksii-dmytrenko-606953b1/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Linkedin className="w-6 h-6 text-white" />
                </motion.a>
                <motion.a
                  href="https://www.upwork.com/freelancers/~01577e3b655ae9340e"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Briefcase className="w-6 h-6 text-white" />
                </motion.a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AboutMe;