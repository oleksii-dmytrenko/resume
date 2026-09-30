import { motion } from 'framer-motion';
import { DeepChat } from 'deep-chat-react';
import type { DeepChat as DeepChatElement } from 'deep-chat';
import { RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// keep in sync with the height transition on the DeepChat host style
const EXPAND_TRANSITION_MS = 350;

const questionSuggestions = [
  "What is your experience with AI?",
  "Are you available?",
  "What is your timezone?",
];

// auxiliaryStyle is injected inside deep-chat's shadow DOM, so selectors must
// match the component's internal structure and must be set as a property -
// React passes string props to custom elements as attributes, which deep-chat
// ignores. Colors/typography mirror the site: white/5 cards, white/10 borders,
// blue-500 -> purple-600 accents, gray-200/300 text, system-ui font. The input
// is sized like modern chatbots (ChatGPT et al): full-width container, 1rem
// text with generous padding, and an oversized gradient submit button.
const chatStyles = `
  :host {
    background-color: transparent;
  }

  #chat-view, #input, #text-input {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
      Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  #messages {
    padding: 6px 10px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
  }
  #messages::-webkit-scrollbar { width: 6px; }
  #messages::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
  }

  .message-bubble {
    background-color: rgba(255, 255, 255, 0.05);
    color: #e5e7eb;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 10px 16px;
    font-size: 0.95rem;
    line-height: 1.55;
    max-width: 75%;
  }
  .message-bubble.user-message {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.45), rgba(147, 51, 234, 0.45));
    border-color: rgba(147, 197, 253, 0.25);
    color: #ffffff;
  }
  .message-bubble.error-message {
    background-color: rgba(239, 68, 68, 0.12);
    border-color: rgba(239, 68, 68, 0.35);
    color: #fca5a5;
  }
  .message-bubble p { margin: 0 0 0.5em; }
  .message-bubble p:last-child { margin-bottom: 0; }
  .message-bubble code {
    background: rgba(255, 255, 255, 0.08);
    padding: 0 4px;
    border-radius: 4px;
  }

  #input {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 10px;
  }
  #text-input-container {
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    width: 100%;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
  #text-input-container:focus-within {
    border-color: rgba(59, 130, 246, 0.6);
  }
  #text-input {
    color: #ffffff;
    font-size: 1rem;
    line-height: 1.5;
    padding: 12px 16px;
  }
  #text-input span { color: #9ca3af; }

  .input-button-svg {
    background: linear-gradient(90deg, #3b82f6, #9333ea);
    border-radius: 12px;
    width: 1.9em;
    height: 1.9em;
  }
  .input-button { border-radius: 12px; }
  .input-button-svg svg { fill: #ffffff; }
  .input-button.disabled-button .input-button-svg {
    background: rgba(255, 255, 255, 0.08);
  }
  .input-button.disabled-button .input-button-svg svg { fill: #6b7280; }

  .loading-message-dots-container { --loading-message-color: #60a5fa; }
`;

const AskMeAnything = () => {
  const chatRef = useRef<DeepChatElement | null>(null);
  const chatAreaRef = useRef<HTMLDivElement | null>(null);
  const scrollTimerRef = useRef<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  // browserStorage restores past conversations before this effect runs; keep
  // the chat tall for returning visitors instead of cramming history into the
  // collapsed box.
  useEffect(() => {
    const id = window.setTimeout(() => {
      if ((chatRef.current?.getMessages().length ?? 0) > 0) setExpanded(true);
    }, 0);
    return () => {
      window.clearTimeout(id);
      if (scrollTimerRef.current !== null) window.clearTimeout(scrollTimerRef.current);
    };
  }, []);

  // The chat grows downward, so the input can end up below the fold. Once the
  // height transition settles, jump the page just enough to bring the input
  // back. The jump must be instant (not smooth): deep-chat snapshots
  // window.scrollY on every keydown and rewinds it on the following input
  // event (a Chromium caret workaround), so an animated page scroll between
  // two keystrokes makes the page snap back and the caret look lost.
  const expandChat = (refocusInput = false) => {
    if (expanded) return;
    setExpanded(true);
    if (scrollTimerRef.current !== null) window.clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = window.setTimeout(() => {
      chatAreaRef.current?.scrollIntoView({ block: 'nearest' });
      if (refocusInput) chatRef.current?.focusInput();
    }, EXPAND_TRANSITION_MS);
  };

  const handleSuggestionClick = (suggestion: string) => {
    expandChat();
    chatRef.current?.submitUserMessage({ text: suggestion });
  };

  const handleClearChat = () => {
    setExpanded(false);
    chatRef.current?.clearMessages(true);
  };

  // focusin/input originate inside deep-chat's shadow DOM but are composed,
  // so they bubble through the host and can be caught here.
  const handleChatInteract = () => expandChat(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-12 sm:mt-16"
    >
      <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
        Ask Anything About Me
      </h2>
      <div className="relative max-w-2xl mx-auto">
        <div className="relative bg-white/5 border border-white/10 rounded-lg p-4 sm:p-6 ask-me-anything">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap gap-2">
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
            <motion.button
              type="button"
              onClick={handleClearChat}
              title="Clear conversation"
              aria-label="Clear conversation"
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>
          </div>
          <div ref={chatAreaRef} onFocus={handleChatInteract} onInput={handleChatInteract}>
            <DeepChat
              ref={(el: DeepChatElement | null) => {
                if (el) el.auxiliaryStyle = chatStyles;
                chatRef.current = el;
              }}
              style={{
                height: expanded ? 'min(520px, 70vh)' : 'min(210px, 35vh)',
                transition: `height ${EXPAND_TRANSITION_MS}ms ease`,
                width: '100%',
                display: 'block',
                fontFamily: 'inherit',
                background: 'transparent',
              }}
              connect={{
                url: '/api/chat',
                method: 'POST',
                stream: true,
              }}
              requestBodyLimits={{ maxMessages: 12 }}
              browserStorage={{ key: 'ask-me-anything-thread' }}
              textInput={{ placeholder: { text: 'Type your message here...' } }}
              errorMessages={{ displayServiceErrorMessages: true }}
              auxiliaryStyle={chatStyles}
            />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Instant Response
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AskMeAnything;
