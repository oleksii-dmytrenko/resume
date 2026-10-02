import { motion } from 'framer-motion';
import { Award, MessageSquare, Target, Zap } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const reasons = [
  {
    icon: Award,
    title: 'Business-Oriented',
    description:
      'Always focused on the business goals and the customer needs.',
  },
  {
    icon: Target,
    title: 'Results-Driven',
    description:
      'Proven track record of delivering solutions that exceed expectations.',
  },
  {
    icon: Zap,
    title: 'Fast Learner',
    description:
      'Quick to adapt to new technologies and methodologies, ensuring cutting-edge solutions.',
  },
  
];

const testimonials = [
  {
    text: "We loved working with Oleksii, highly talented professional.",
    author: "Sharon Leon",
    position: "CEO, VitrueTraffic",
    image: "/sharon.webp"
  },
  {
    text: "I can highly recommend Oleksii, as he is very skilled, disciplined, and always delivered high-quality work.",
    author: "Andreas Schroth",
    position: "CEO, hPage",
    image: "/andreas.jpg"
  }
];

const WhyMe = () => {
  return (
    <PageTransition>
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-12">
            Why Choose Me?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {reasons.map((reason, index) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-all"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <reason.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {reason.title}
                </h3>
                <p className="text-gray-400">{reason.description}</p>
              </motion.div>
            ))}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-center text-white mb-8">
            What Others Say
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex items-start mb-4">
                  <MessageSquare className="w-8 h-8 text-purple-500 mr-3 flex-shrink-0" />
                  <p className="text-gray-300 italic">{testimonial.text}</p>
                </div>
                <div className="flex items-center mt-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <p className="text-white font-semibold">{testimonial.author}</p>
                    <p className="text-gray-400 text-sm">{testimonial.position}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default WhyMe;