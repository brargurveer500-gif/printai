import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  BookOpen, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  FileText, 
  Layers, 
  ChevronDown, 
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { RetrievedChunk } from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  retrieved_chunks?: RetrievedChunk[];
  grounded?: boolean;
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Hello! I am the **PrintAI Assistant**. I provide answers strictly grounded in our official print center policies, pricing schedules, paper size guidelines, and operating procedures.\n\nHow can I help you with your printing job today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      grounded: true
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedChunkMsgId, setExpandedChunkMsgId] = useState<string | null>(null);

  // Suggested quick prompts per PRD test cases
  const suggestedPrompts = [
    'What is your refund policy if the colors are faded or toner smudges?',
    'How much does it cost to print 50 duplex pages in color with spiral binding?',
    'What are the dimensions of A3 paper and what is it best used for?',
    'How quickly does an Urgent priority order get printed?',
    'Can I cancel an order once it is in Processing status?',
    'Do you print 3D plastic figurines and resin prototypes?' // Tests out-of-scope grounding!
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuestion).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      });

      if (!res.ok) {
        throw new Error('Failed to get answer from AI Assistant');
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        retrieved_chunks: data.retrieved_chunks,
        grounded: data.grounded
      };

      setMessages(prev => [...prev, assistantMsg]);
      // Auto expand chunk indicator if grounded context exists
      if (data.retrieved_chunks && data.retrieved_chunks.length > 0) {
        setExpandedChunkMsgId(assistantMsg.id);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `Service notification: Unable to complete AI query (${err.message}). Please contact Counter #2 directly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          grounded: false
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Gemini + RAG Print Assistant</h1>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Grounded in Knowledge Base
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Powered by Google Gemini 3.8 Flash with Retrieval-Augmented Generation (RAG) over official print store documents.
          </p>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="self-start md:self-auto px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs border border-slate-800 flex items-center space-x-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Conversation</span>
        </button>
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <span className="text-xs text-slate-400 block font-semibold mb-2.5 flex items-center space-x-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>Try asking a grounded knowledge base inquiry:</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(p)}
              disabled={isLoading}
              className="text-left text-xs px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-indigo-500/40 transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <span className="truncate max-w-xs">{p}</span>
              <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 min-h-[440px] max-h-[600px] overflow-y-auto space-y-6 shadow-sm">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isExpanded = expandedChunkMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none'
                }`}
              >
                {/* Assistant Label & Grounding Status */}
                {!isUser && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-xs">
                    <div className="flex items-center space-x-1.5 font-bold text-indigo-400">
                      <Bot className="w-4 h-4" />
                      <span>PrintAI Knowledge Engine</span>
                    </div>

                    {msg.grounded !== undefined && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1 ${
                        msg.grounded 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {msg.grounded ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Grounded in Knowledge Base</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3 h-3" />
                            <span>Out-of-Scope / Non-Policy</span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-wrap font-sans text-sm space-y-2">
                  {msg.text.split('\n\n').map((para, pIdx) => (
                    <p key={pIdx}>
                      {para.startsWith('**') ? (
                        <span>{para}</span>
                      ) : (
                        para
                      )}
                    </p>
                  ))}
                </div>

                {/* Retrieved Context Indicator Drawer */}
                {!isUser && msg.retrieved_chunks && msg.retrieved_chunks.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => setExpandedChunkMsgId(isExpanded ? null : msg.id)}
                      className="w-full flex items-center justify-between text-xs text-indigo-400 hover:text-indigo-300 font-medium py-1 transition-colors"
                    >
                      <div className="flex items-center space-x-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>
                          Retrieved Context Indicator ({msg.retrieved_chunks.length} matching knowledge {msg.retrieved_chunks.length === 1 ? 'chunk' : 'chunks'})
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-2.5 animate-in fade-in duration-150">
                        {msg.retrieved_chunks.map((chk, cIdx) => (
                          <div 
                            key={cIdx}
                            className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white flex items-center space-x-1">
                                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                <span>{chk.title}</span>
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                                Match Score: {chk.score.toFixed(1)}
                              </span>
                            </div>
                            <p className="text-slate-400 italic line-clamp-3 leading-relaxed">
                              "{chk.snippet}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-500 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-indigo-400 text-xs p-4 bg-slate-950 rounded-2xl border border-slate-800 w-fit">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="font-medium">Searching knowledge documents & grounding response with Gemini...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center space-x-3 bg-slate-900 p-2.5 rounded-2xl border border-slate-800 shadow-md focus-within:border-indigo-500 transition-colors"
      >
        <input
          type="text"
          placeholder="Ask a question about printing policies, turnaround times, pricing, paper sizes..."
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-transparent px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !inputQuestion.trim()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-40"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
