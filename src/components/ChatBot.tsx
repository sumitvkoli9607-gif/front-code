import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User } from 'lucide-react';
import type { ChatMessage, MarketData } from '../types';

interface ChatBotProps {
  onClose: () => void;
  selectedAsset?: MarketData | null;
}

const getAIResponse = (message: string, asset?: MarketData | null): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('analysis') || lowerMessage.includes('analyze')) {
    if (asset) {
      return `Based on current market conditions for ${asset.symbol}, I see ${asset.change >= 0 ? 'positive' : 'negative'} momentum with a ${Math.abs(asset.change)}% change. The technical indicators suggest ${asset.change >= 0 ? 'bullish' : 'bearish'} sentiment in the short term. Key support levels are holding, and volume analysis indicates ${asset.volume > 1000000 ? 'strong' : 'moderate'} institutional interest.`;
    }
    return "I can provide detailed technical and fundamental analysis for any asset. Please specify which market or symbol you'd like me to analyze.";
  }
  
  if (lowerMessage.includes('buy') || lowerMessage.includes('sell') || lowerMessage.includes('trade')) {
    return "I can't provide specific trading advice, but I can help you understand market conditions, technical indicators, and risk factors to consider for your investment decisions. What specific aspect would you like to explore?";
  }
  
  if (lowerMessage.includes('risk') || lowerMessage.includes('volatility')) {
    return "Risk management is crucial in trading. Consider position sizing (never risk more than 2-3% per trade), set stop losses, diversify your portfolio, and stay informed about macroeconomic factors that could impact your positions.";
  }
  
  if (lowerMessage.includes('news') || lowerMessage.includes('events')) {
    return "I monitor global financial news, central bank announcements, earnings reports, and geopolitical events that impact markets. Recent developments include Federal Reserve policy decisions and institutional crypto adoption trends.";
  }
  
  return "I'm your AI trading assistant. I can help with market analysis, explain trading concepts, discuss risk management strategies, and provide insights on market sentiment. How can I assist you today?";
};

export const ChatBot: React.FC<ChatBotProps> = ({ onClose, selectedAsset }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: selectedAsset 
        ? `Hi! I'm ready to help you analyze ${selectedAsset.symbol}. What would you like to know?`
        : "Hello! I'm your AI trading assistant. I can help you with market analysis, trading strategies, and market insights. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(inputValue, selectedAsset),
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "Analyze current market sentiment",
    "What are the key risk factors?",
    "Show me trading opportunities",
    "Explain market psychology indicators"
  ];

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="font-semibold">AI Trading Assistant</h3>
            <p className="text-sm text-blue-100">
              {selectedAsset ? `Analyzing ${selectedAsset.symbol}` : 'Ready to help'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.isUser ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              message.isUser 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border border-gray-200 text-gray-600'
            }`}>
              {message.isUser ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[70%] p-3 rounded-2xl ${
              message.isUser
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
            }`}>
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-2 opacity-70`}>
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-600">
              <Bot size={16} />
            </div>
            <div className="bg-white p-3 rounded-2xl rounded-bl-sm border border-gray-200">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-gray-200 bg-white">
          <p className="text-sm text-gray-600 mb-3">Quick questions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputValue(question)}
                className="text-xs p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about market analysis, trading strategies, or risk management..."
              className="w-full p-3 pr-12 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};