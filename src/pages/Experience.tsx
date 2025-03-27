import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const experiences = [
  {
    company: 'VitrueTraffic.',
    position: 'Senior R&D Engineer',
    period: '2022 - 2024',
    description:
      'Developed cloud-native, hight-load, AI-powered platform for traffic management and optimization.',
  },
  {
    company: 'StreetShares',
    position: 'Full Stack Developer',
    period: '2019 - 2022',
    description:
      'Developed and maintained multiple client fintech applications using React and Python. Helped to build PPP loan platform.',
  },
  {
    company: 'Spartacs',
    position: 'Full Stack Developer',
    period: '2018 - 2020',
    description:
      'Built hight-load traffic management applications using React and Node.js',
  },
  {
    company: 'Sandsiv',
    position: 'Backend Developer',
    period: '2015 - 2018',
    description:
      'Developed analytics and big data processing ML applications using Python and Angular.',
  },
];

const Experience = () => {
  return (
    <PageTransition>
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-12">
            Professional Journey
          </h2>
          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.company}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative pl-8 border-l-2 border-gray-700"
              >
                <div className="absolute -left-3 top-0">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1.5 rounded-full">
                    <Briefcase className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-all">
                  <h3 className="text-xl font-semibold text-white">{exp.company}</h3>
                  <p className="text-gray-300 mt-1">{exp.position}</p>
                  <p className="text-gray-400 text-sm mt-1">{exp.period}</p>
                  <p className="text-gray-400 mt-4">{exp.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Experience;