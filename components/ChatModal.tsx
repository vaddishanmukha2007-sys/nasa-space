// Fix: Implemented the ChatModal component to resolve module resolution errors and provide a functional chat interface.
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { SendIcon, CloseIcon } from './Icons';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const SUGGESTED_PROMPTS = [
  "What's the most unusual exoplanet ever found?",
  "How do you detect an exoplanet?",
  "Tell me about the TRAPPIST-1 system.",
  "What is a 'Hot Jupiter'?",
];

const TypingIndicator = () => (
    <div className="flex gap-1.5 items-center p-2">
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
    </div>
);

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !chatRef.current) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: "You are Astro, your friendly AI Exoplanetologist. Your personality is enthusiastic, curious, and full of wonder about the universe. Your goal is to make learning about exoplanets exciting and accessible. When answering questions, not only provide the direct answer but also try to include a related, fascinating 'Cosmic Fact!'. Keep your tone conversational and encouraging, and feel free to use space-themed emojis like 🚀, ✨, 🔭, and 🪐 to add excitement.",
          },
        });
        setMessages([{ role: 'model', text: "Greetings, star-traveler! I'm Astro, your friendly AI Exoplanetologist. I'm buzzing with cosmic energy and ready to explore the universe with you. What amazing things can we learn about exoplanets today?" }]);
      } catch (e) {
        console.error("Failed to initialize chat:", e);
        setError("Could not connect to the AI assistant. Please check your API key and refresh the page.");
      }
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || !chatRef.current) return;

    const userMessage: Message = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
    setIsLoading(true);
    setError(null);
    
    try {
      const stream = await chatRef.current.sendMessageStream({ message: messageText });

      for await (const chunk of stream) {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text += chunk.text;
          return newMessages;
        });
      }
    } catch (e) {
      console.error("Error sending message:", e);
      const errorMessage = "Sorry, I encountered an error. Please try again.";
      setError(errorMessage);
       setMessages(prev => {
          const newMessages = [...prev];
          if(newMessages[newMessages.length - 1].text === '') {
             newMessages[newMessages.length - 1].text = errorMessage;
          } else {
             newMessages.push({ role: 'model', text: errorMessage});
          }
          return newMessages;
        });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
    setInput('');
  };

  const handleSuggestionClick = (prompt: string) => {
    sendMessage(prompt);
  };


  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-100 dark:bg-slate-900 border border-amber-500/20 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full h-[90vh] sm:h-auto sm:max-h-[80vh] max-w-2xl text-slate-800 dark:text-gray-200 flex flex-col transform transition-transform duration-300 animate-slide-up-fast"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-title"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-300 dark:border-slate-700 flex-shrink-0">
          <h2 id="chat-title" className="text-lg font-bold text-amber-500 dark:text-amber-400">Astro - AI Exoplanetologist</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close chat"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-grow p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex-shrink-0 self-start"></div>
                )}
                <div 
                  className={`max-w-md lg:max-w-lg p-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-amber-500 text-white rounded-br-none' 
                      : 'bg-white dark:bg-slate-700/80 rounded-bl-none'
                  }`}
                >
                  {msg.role === 'model' && msg.text === '' && isLoading ? (
                    <TypingIndicator />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Proactive Suggestions */}
        {messages.length === 1 && !isLoading && (
            <div className="px-4 pb-3 flex-shrink-0 border-t border-slate-200 dark:border-slate-800 pt-3">
                <p className="text-xs text-slate-500 dark:text-gray-400 mb-2">Here are a few stellar starting points:</p>
                <div className="flex flex-wrap gap-2">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                        <button
                            key={prompt}
                            onClick={() => handleSuggestionClick(prompt)}
                            className="px-3 py-1.5 text-sm bg-white dark:bg-slate-700/80 border border-slate-300 dark:border-slate-600 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600/80 transition-colors"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            </div>
        )}
        
        {error && <p className="text-red-500 text-xs px-4 pb-2 text-center">{error}</p>}

        {/* Input Form */}
        <div className="p-4 border-t border-slate-300 dark:border-slate-700 flex-shrink-0 bg-slate-200/50 dark:bg-slate-800/50">
          <form onSubmit={handleFormSubmit} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about exoplanets..."
              disabled={isLoading}
              className="w-full bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-amber-500 text-white rounded-full hover:bg-amber-400 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;