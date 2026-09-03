import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Bot, User, Loader2, Plus, Menu, Trash2, Edit2, Check, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import {
  sendMessageToBot,
  fetchConversations,
  fetchMessages,
  deleteConversation,
  renameConversation,
  type ChatConversation,
  type ChatMessage
} from '../lib/chatbot';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

export const AiAssistantPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    } else {
      // Empty state
      setMessages([
        {
          role: 'model',
          content: 'Hello! I am the LegalMetrix Assistant. Start a new conversation or select an existing one from the sidebar.'
        }
      ]);
    }
  }, [activeConvId]);

  useEffect(() => {
    // Scroll to bottom when messages update
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const loadConversations = async () => {
    const data = await fetchConversations();
    setConversations(data);
    if (data.length > 0 && !activeConvId) {
      setActiveConvId(data[0].id);
    }
  };

  const loadMessages = async (id: string) => {
    setIsLoading(true);
    const data = await fetchMessages(id);
    setMessages(data);
    setIsLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      const success = await deleteConversation(id);
      if (success) {
        if (activeConvId === id) {
          setActiveConvId(null);
        }
        loadConversations();
      }
    }
  };

  const startEdit = (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation();
    setEditingConvId(id);
    setEditTitle(currentTitle);
  };

  const saveEdit = async (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
    e.stopPropagation();
    if (!editTitle.trim()) {
      setEditingConvId(null);
      return;
    }
    const success = await renameConversation(id, editTitle.trim());
    if (success) {
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: editTitle.trim() } : c));
    }
    setEditingConvId(null);
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingConvId(null);
  };

  const startNewChat = () => {
    setActiveConvId(null);
    setMessages([
      {
        role: 'model',
        content: 'Hello! I am the LegalMetrix Assistant. How can I help you today?'
      }
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const { responseText, conversationId: newConvId } = await sendMessageToBot(
        userMsg,
        location.pathname,
        activeConvId,
        messages.filter(m => m.id) // Only pass messages that were saved (have id) or actual conversation history
      );
      
      if (newConvId && newConvId !== activeConvId) {
        setActiveConvId(newConvId);
        // Refresh conversations list to show the newly created chat
        loadConversations();
      }
      
      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'model', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-1 w-full h-full min-h-0 relative overflow-hidden bg-[#0B1020] sm:bg-transparent">
      {/* Sidebar - History */}
      <div 
        className={cn(
          "bg-[#0B1020]/95 backdrop-blur-xl md:bg-obsidian/60 border-r border-white/10 flex flex-col min-h-0 transition-all duration-300 absolute md:relative z-20 h-full",
          isSidebarOpen ? "w-[280px] translate-x-0" : "w-[280px] -translate-x-full md:translate-x-0 md:w-0 md:border-none md:opacity-0"
        )}
      >
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <button
            onClick={startNewChat}
            className="w-full py-2.5 px-4 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl flex items-center justify-center gap-2 transition-colors font-medium border border-primary/30"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-2 mb-2">Recent Chats</div>
          {conversations.length === 0 ? (
            <div className="text-sm text-content-muted px-2 py-4 text-center">No recent conversations</div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => {
                  if (editingConvId !== conv.id) {
                    setActiveConvId(conv.id);
                  }
                }}
                className={cn(
                  "w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 transition-colors group text-sm cursor-pointer relative",
                  activeConvId === conv.id 
                    ? "bg-primary/20 text-white border border-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" 
                    : "text-content-muted hover:bg-white/5 hover:text-white border border-transparent"
                )}
              >
                <MessageSquare className={cn("w-4 h-4 shrink-0", activeConvId === conv.id ? "text-primary" : "text-white/40")} />
                
                {editingConvId === conv.id ? (
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveEdit(e, conv.id);
                        if (e.key === 'Escape') cancelEdit(e as any);
                      }}
                      className="flex-1 min-w-0 bg-obsidian border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-primary/50 w-full"
                      autoFocus
                      onClick={e => e.stopPropagation()}
                    />
                    <button onClick={(e) => saveEdit(e, conv.id)} className="p-1 hover:text-emerald-400 text-content-muted transition-colors flex-shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={cancelEdit} className="p-1 hover:text-red-400 text-content-muted transition-colors flex-shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="truncate flex-1 font-medium tracking-wide">{conv.title}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 bg-gradient-to-l from-obsidian/80 to-transparent pl-2">
                      <button 
                        onClick={(e) => startEdit(e, conv.id, conv.title)} 
                        className="p-1.5 hover:bg-white/10 rounded-md text-white/50 hover:text-white transition-colors"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, conv.id)} 
                        className="p-1.5 hover:bg-white/10 hover:text-red-400 rounded-md text-white/50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#0B1020]/30 relative z-10">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-black/50 z-10 md:hidden"
            />
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="h-16 border-b border-white/10 flex items-center px-4 bg-white/[0.02]">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 mr-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">LegalMetrix Assistant</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <span className="text-xs text-content-muted font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-lg overflow-hidden ${
                  msg.role === 'user'
                    ? 'bg-primary border-primary/50 text-white'
                    : 'bg-obsidian border-white/10 text-primary'
                }`}
              >
                {msg.role === 'user' ? (
                  user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[15px] font-bold">{user.name?.charAt(0) || 'U'}</span>
                  )
                ) : (
                  <Bot className="w-5 h-5" />
                )}
              </div>
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-[15px] leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-sm shadow-primary/20'
                    : 'bg-white/5 text-content-muted rounded-tl-sm border border-white/10'
                }`}
              >
                {msg.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i !== msg.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-obsidian border border-white/10 flex items-center justify-center shrink-0 text-primary shadow-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white/5 text-content-muted rounded-2xl rounded-tl-sm border border-white/10 p-4 text-[15px] flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input */}
        <div className="p-3 md:p-6 bg-obsidian/40 border-t border-white/10">
          <div className="relative max-w-4xl mx-auto flex items-center min-w-0">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about Legal Metrology compliance..."
              className="w-full bg-[#0B1020]/80 border border-white/10 rounded-full pl-5 md:pl-6 pr-12 md:pr-14 py-3 md:py-4 text-sm md:text-base focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-content placeholder-content-muted transition-all shadow-inner truncate"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-1.5 md:right-2 p-2 md:p-2.5 bg-primary hover:bg-primary-hover disabled:bg-primary/30 disabled:cursor-not-allowed text-white rounded-full transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center justify-center group flex-shrink-0"
            >
              <Send className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
          <div className="text-center mt-2 md:mt-3 text-[10px] md:text-xs text-content-muted font-medium tracking-wide">
            LegalMetrix AI can make mistakes. Verify important compliance information.
          </div>
        </div>
      </div>
    </div>
  );
};
