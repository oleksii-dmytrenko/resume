import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import { TagCloud } from '../components/TagCloud';

const skills = [
  { name: 'Full Stack Development', level: 90 },
  { name: 'Cloud Architecture', level: 85 },
  { name: 'AI/ML Engineering', level: 80 },
  { name: 'High-Load & Big Data', level: 75 },
  { name: 'UI/UX Design', level: 70 },
];

const Expertise = () => {
  return (
    <PageTransition>
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            className="text-4xl font-bold text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Technical Expertise
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
          </motion.div>
          
          <div className="space-y-8">
            {skills.map((skill, index) => (
              <div key={skill.name} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">{skill.name}</span>
                  <span className="text-gray-400">{skill.level}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
          <TagCloud />
        </div>
      </div>
    </PageTransition>
  );
};

export default Expertise;