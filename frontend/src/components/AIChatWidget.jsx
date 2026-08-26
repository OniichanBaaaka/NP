import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, User, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';
import ChatProductCard from './ChatProductCard';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Xin chào! Mình là **XIV AI Shopping Assistant** (Gemini 3.6 Flash RAG). Mình có thể giúp bạn tư vấn chọn size, phối đồ Streetwear hoặc tra cứu sản phẩm có sẵn trong kho!\n\nBạn có thể tham khảo mẫu bán chạy hôm nay:\n[PRODUCT_CARD: 1]',
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const quickQuestions = [
    'Tư vấn size theo chiều cao & cân nặng',
    'Tìm áo hoodie acid wash hot nhất',
    'Quần cargo chống nước còn hàng không?',
    'Thanh toán qua VietQR Napas 247 thế nào?',
  ];

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputMessage.trim();
    if (!textToSend || isStreaming) return;

    setInputMessage('');
    const userMsg = { role: 'user', content: textToSend };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    // Chuẩn bị tin nhắn assistant đang stream
    const assistantMsg = { role: 'assistant', content: '' };
    setMessages([...newMessages, assistantMsg]);
    setIsStreaming(true);

    try {
      const response = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          userQuery: textToSend,
        }),
      });

      if (!response.ok) {
        throw new Error('Lỗi kết nối đến máy chủ AI');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let streamedContent = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.replace('data: ', '').trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                streamedContent += parsed.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: streamedContent,
                  };
                  return updated;
                });
              }
            } catch (e) {
              // Bỏ qua nếu không parse được JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Xin lỗi bạn, đã xảy ra lỗi kết nối khi xử lý câu hỏi. Vui lòng thử lại sau giây lát!',
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  /**
   * Render nội dung tin nhắn kết hợp Markdown text và ChatProductCard
   */
  const renderMessageContent = (content) => {
    // Regex tìm thẻ [PRODUCT_CARD: <id>]
    const regex = /\[PRODUCT_CARD:\s*(\d+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push({
          type: 'text',
          value: content.substring(lastIndex, matchIndex),
        });
      }
      parts.push({
        type: 'product_card',
        productId: parseInt(match[1], 10),
      });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        value: content.substring(lastIndex),
      });
    }

    return (
      <div className="space-y-1.5 leading-relaxed text-sm">
        {parts.map((part, index) => {
          if (part.type === 'product_card') {
            return <ChatProductCard key={`card-${index}-${part.productId}`} productId={part.productId} />;
          }
          return (
            <div key={`text-${index}`} className="whitespace-pre-wrap">
              {part.value}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-3.5 md:p-4 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-pink-500 text-white shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
          title="Tư vấn AI XIV Assistant"
        >
          <div className="absolute inset-0 rounded-full bg-cyan-400 blur-md opacity-40 group-hover:opacity-75 transition-opacity"></div>
          <div className="relative flex items-center justify-center">
            {isOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <Bot className="w-6 h-6 md:w-7 md:h-7" />}
          </div>
          {/* Pulsing indicator */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-black"></span>
          </span>
        </button>
      </div>

      {/* Chat Window Popup */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-24 right-3 sm:right-6 w-[94vw] sm:w-[420px] h-[540px] md:h-[580px] max-h-[75vh] md:max-h-[82vh] z-50 flex flex-col rounded-2xl bg-gray-950/95 border border-cyan-500/30 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-bold shadow-lg shadow-cyan-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white font-heading">XIV AI ASSISTANT</h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono">
                    RAG Grounded
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Tư vấn mua sắm & kho vận 24/7
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 flex-shrink-0 flex items-center justify-center text-cyan-400 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-md'
                      : 'bg-gray-900/90 text-gray-200 border border-gray-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  {renderMessageContent(msg.content)}
                  {isStreaming && idx === messages.length - 1 && (
                    <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1 align-middle"></span>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-gray-800 flex-shrink-0 flex items-center justify-center text-gray-300 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Chips */}
          <div className="px-3 py-2 bg-gray-900/50 border-t border-gray-800/80 overflow-x-auto whitespace-nowrap flex gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={isStreaming}
                className="text-[11px] px-2.5 py-1 rounded-full bg-gray-800/90 hover:bg-cyan-950 hover:text-cyan-300 hover:border-cyan-500/40 text-gray-300 border border-gray-700 transition-all flex-shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-gray-900 border-t border-gray-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Hỏi về size, mẫu áo, thanh toán VietQR..."
                disabled={isStreaming}
                className="flex-1 bg-gray-950 border border-gray-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isStreaming}
                className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold transition-all shadow-md flex items-center justify-center"
              >
                {isStreaming ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
