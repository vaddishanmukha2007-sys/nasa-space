import React from 'react';
import { ChatIcon } from './Icons';

interface ChatButtonProps {
    onClick: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            aria-label="Open chat assistant"
            className="fixed bottom-6 right-6 z-30 w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 text-white rounded-full shadow-2xl shadow-amber-500/30 flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-500/50"
        >
            <ChatIcon className="w-8 h-8" />
        </button>
    );
};

export default ChatButton;
