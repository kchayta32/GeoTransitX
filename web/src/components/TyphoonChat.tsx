"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Bot, User, Sparkles, RefreshCw, Trash2, ArrowRight, Loader2 } from "lucide-react";

interface TyphoonChatProps {
  initialContext?: any;
}

export default function TyphoonChat({ initialContext }: TyphoonChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content:
        "สวัสดีครับ! ผมคือ **GeoTransitX AI Policy Advisor** ขับเคลื่อนโดย **Typhoon LLM** (`typhoon-v2.5-30b-a3b-instruct`)\n\nผมพร้อมตอบคำถาม วิเคราะห์ข้อมูลการจราจรเชิงพื้นที่ (GeoAI) ความแม่นยำภาพถ่ายโดรน และเสนอแนะมาตรการ Smart City สำหรับสนามบินบางพระและระเบียงเศรษฐกิจพิเศษ EEC คุณสามารถพิมพ์สอบถามหรือเลือกหัวข้อแนะนำด้านล่างได้เลยครับ",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "วิเคราะห์สาเหตุของจุดคอขวดช่วง 17:30 น. และแนวทางแก้ไขเร่งด่วน",
    "ขอข้อเสนอแนะจัดสรรพื้นที่ลานจอดรถและระบบ Smart Parking",
    "แผนพัฒนารถ Feeder Shuttle Bus เชื่อมสนามบินบางพระสู่ถนนสุขุมวิท",
    "ประเมินความถูกต้องแม่นยำของภาพถ่ายโดรน GSD 2.62 ซม. และ GCP 1.3 ซม.",
    "มาตรการลดการปล่อยคาร์บอน (ESG Green Mobility) ตามแผน 3 ระยะ",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      // Build messages array for API
      const apiMessages = messages
        .filter((m) => m.role !== "system")
        .concat(userMsg)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch("/api/typhoon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          contextData: initialContext,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || "Failed to reach Typhoon API");
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: `❌ ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ Typhoon LLM: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "msg-welcome",
        role: "assistant",
        content:
          "ยินดีต้อนรับอีกครั้งครับ! สอบถามข้อมูลระบบการจราจรและการวางแผน Smart Mobility ได้เลยครับ",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[700px] bg-slate-900/90 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-850 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative p-2 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-lg shadow-md">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-sm">Typhoon AI Policy Advisor</h3>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-mono">
                typhoon-v2.5-30b-a3b
              </span>
            </div>
            <p className="text-[11px] text-slate-400">ระบบสนทนาให้คำปรึกษาเชิงนโยบายและวิเคราะห์การจราจรแบบเรียลไทม์</p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition text-xs flex items-center gap-1"
          title="ล้างบทสนทนา"
        >
          <Trash2 className="w-4 h-4" />
          <span>ล้างแชท</span>
        </button>
      </div>

      {/* Quick Prompts Carousel */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-850 overflow-x-auto flex gap-2 no-scrollbar">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="shrink-0 text-[11px] bg-slate-800/80 hover:bg-emerald-900/50 hover:text-emerald-300 text-slate-300 px-3 py-1 rounded-full border border-slate-700 hover:border-emerald-700 transition flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 text-white shadow ${
                msg.role === "user" ? "bg-blue-600" : "bg-emerald-700"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs md:text-sm shadow-md leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600/20 border border-blue-500/40 text-blue-50 rounded-tr-none"
                  : "bg-slate-800/90 border border-slate-700 text-slate-200 rounded-tl-none"
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert prose-sm max-w-none">
                {msg.content}
              </ReactMarkdown>
              <div className="text-[10px] text-slate-400 text-right mt-1.5 font-mono">{msg.timestamp}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-700 text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-300 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Typhoon LLM กำลังวิเคราะห์และสังเคราะห์คำตอบ...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์คำถามเกี่ยวกับระบบจราจร ภาพถ่ายโดรน หรือคำแนะนำนโยบาย..."
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-medium transition shadow-md flex items-center gap-1 text-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
