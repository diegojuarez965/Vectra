"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
import { submitChatbotMessage } from "@/app/lib/actions";
import Image from "next/image";

interface ChatMessage {
  role: "user" | "bot";
  content: string;
}

export default function Chatbox({ avatar }: { avatar: string }) {
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar si el chat está abierto o cerrado
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      content:
        "¡Hola! Soy tu asistente fitness de Vectra. ¿En qué puedo ayudarte hoy?",
    },
  ]); // Estado para almacenar los mensajes
  const [input, setInput] = useState(""); // Estado para almacenar el mensaje de entrada
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar si el chat está cargando
  const messagesEndRef = useRef<HTMLDivElement>(null); // Referencia al final de los mensajes

  // Función para desplazar el chat al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Hook para desplazar el chat al final cuando hay nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Función para enviar el mensaje
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    const res = await submitChatbotMessage(userMsg);

    if (res.success) {
      setMessages((prev) => [...prev, { role: "bot", content: res.message }]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: `Error: ${res.message}` },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 p-4 rounded-full bg-primary text-foreground shadow-[0_0_20px_rgba(255,87,34,0.3)] hover:scale-110 transition-transform z-50 cursor-pointer ${isOpen ? "hidden" : "flex"}`}
        aria-label="Abrir Asistente"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-4 right-4 w-[calc(100%-2rem)] sm:bottom-6 sm:right-6 max-w-sm h-128 max-h-[80vh] flex flex-col bg-background border border-foreground/10 shadow-2xl z-50 overflow-hidden animate-in slide-in-from-bottom-5 rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-foreground/5 border-b border-foreground/10">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Vectra AI</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-foreground/80 hover:text-foreground hover:bg-foreground/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                <div
                  className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-foreground/10`}
                >
                  {msg.role === "user" ? (
                    <Image
                      src={avatar}
                      alt="Avatar"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  ) : (
                    <Bot className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div
                  className={`p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-primary/10 text-foreground border border-primary/20" : "bg-foreground/5 text-foreground/90 border border-foreground/10"}`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-foreground/10">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="p-3 rounded-2xl bg-foreground/5 text-foreground/90 border border-foreground/10 flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-background border-t border-foreground/10">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta algo al experto..."
                className="flex-1 bg-foreground/5 text-foreground px-4 py-2 text-sm rounded-xl border border-foreground/10 focus:outline-none focus:border-primary/50 transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-xl bg-primary text-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
