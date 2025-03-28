import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot } from 'lucide-react';
import { useState, useRef } from 'react';

const questionSuggestions = [
  "What is your experience with AI?",
  "Are you available?",
  "What is your timezone?",
];

const predefinedResponses = {
  "What is your experience with AI?": "I started utilizing ML back in 2017 for sentiment analysis and have used it for different purposes over the years. Now I'm all in into generative AI.",
  "Are you available?": "I'm currently available but that's not likely to stay this way for long.",
  "What is your timezone?": "I frequently work from Europe and East Asia and tend to have half day overlap with US."
};

const AskMeAnything = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    // Simulate AI response delay
    setTimeout(() => {
      const predefinedResponse = predefinedResponses[message as keyof typeof predefinedResponses];
      setResponse(predefinedResponse || "I'm an AI assistant. I can only answer specific questions about Olek's experience, availability, and timezone. Please try one of the suggested questions or rephrase your question.");
      setIsLoading(false);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    setResponse(''); // Clear previous response
    // Trigger form submission after a small delay to ensure state is updated
    setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-16"
    >
      <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
        Ask Anything About Me
      </h2>
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-lg blur opacity-30 animate-gradient-x"></div>
        <form ref={formRef} onSubmit={handleSubmit} className="relative bg-white/5 rounded-lg p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {questionSuggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-gray-300 hover:text-white transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setResponse(''); // Clear response when typing
            }}
            placeholder="Type your message here..."
            className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="mt-4 flex items-center gap-3">
            <motion.button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5 mr-2" />
              Get AI Response
            </motion.button>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Instant Response
            </span>
          </div>
        </form>

        <AnimatePresence>
          {(response || isLoading) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-lg blur opacity-30 animate-gradient-x"></div>
              <div className="relative bg-white/5 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    ) : (
                      <p className="text-gray-300">{response}</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AskMeAnything; 