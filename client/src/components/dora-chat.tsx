import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Send,
    Bot,
    User,
    Sparkles,
    Loader2,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// ---------- Types ----------

interface DoraDataCard {
    label: string;
    value: string;
    color?: "green" | "red" | "amber" | "default";
}

interface DoraAction {
    label: string;
    type: "navigate" | "info";
    target?: string;
}

interface DoraApiResponse {
    text: string;
    data?: DoraDataCard[];
    actions?: DoraAction[];
    // NEW: Compliance extensions
    complianceBadge?: "approved" | "needs_review" | "informational";
    sources?: { title: string; snippet: string }[];
}

interface ChatMessage {
    id: string;
    role: "user" | "dora";
    text: string;
    data?: DoraDataCard[];
    actions?: DoraAction[];
    complianceBadge?: "approved" | "needs_review" | "informational";
    sources?: { title: string; snippet: string }[]; // Added sources
    timestamp: Date;
}

const bgColorMap: Record<string, string> = {
    green: "bg-emerald-500/10",
    red: "bg-rose-500/10",
    amber: "bg-amber-500/10",
    default: "bg-muted",
};

const colorMap: Record<string, string> = {
    green: "text-emerald-600",
    red: "text-rose-600",
    amber: "text-amber-600",
    default: "text-foreground",
};

function renderMarkdown(text: string) {
    // Simple bold formatting
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
}

interface DoraChatProps {
    clientId?: string;
    clientName?: string;
}

// ---------- Component ----------

export function DoraChat({ clientId, clientName }: DoraChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "dora-welcome",
            role: "dora",
            text: clientName
                ? `Hello! I'm DORA. I've analyzed **${clientName}'s** portfolio. Ask me about their goals, risk, or recommendations — or research our **house views** on any sector, country, or strategy.`
                : "Hello! I'm DORA, your AI research assistant. Ask me about our **house views** on sectors, countries, currencies, or strategies — or select a client for portfolio-specific insights.",
            actions: clientName
                ? [
                    { label: "Portfolio summary", type: "info" as const },
                    { label: "House view: Technology", type: "info" as const },
                    { label: "Philippines market outlook", type: "info" as const },
                    { label: "USD/PHP forecast", type: "info" as const },
                    { label: "Recommendations", type: "info" as const },
                ]
                : [
                    { label: "House view: Equities", type: "info" as const },
                    { label: "Tech sector outlook", type: "info" as const },
                    { label: "Philippines market", type: "info" as const },
                    { label: "ESG investing", type: "info" as const },
                    { label: "Interest rate outlook", type: "info" as const },
                ],
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isLoading) return;

        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            text: trimmed,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await apiRequest("POST", "/api/dora/chat", {
                message: trimmed,
                clientId: clientId || undefined,
            });
            const data = (await res.json()) as { response: DoraApiResponse; intent: string };

            const doraMsg: ChatMessage = {
                id: `dora-${Date.now()}`,
                role: "dora",
                text: data.response.text,
                data: data.response.data,
                actions: data.response.actions,
                complianceBadge: data.response.complianceBadge,
                sources: data.response.sources,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, doraMsg]);
        } catch (error) {
            console.error("Dora Error:", error);
            const errorMsg: ChatMessage = {
                id: `dora-error-${Date.now()}`,
                role: "dora",
                text: "I'm sorry, I encountered an error processing your request. Please try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [clientId, isLoading]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const handleQuickAction = (action: string) => {
        sendMessage(action);
    };

    return (
        <div className="flex flex-col h-full" data-testid="dora-chat">
            {/* Header */}
            <div className="flex items-center gap-2 pb-3 border-b mb-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#00A758] to-[#0C7143] shadow-sm">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-bold flex items-center gap-1.5" data-testid="text-dora-title">
                        DORA
                        <Badge variant="outline" className="text-[9px] px-1 py-0 font-medium text-[#00A758] border-[#00A758]/30">
                            AI
                        </Badge>
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                        {clientName ? `Analyzing ${clientName}` : "Cross-client analysis"}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
                <AnimatePresence mode="popLayout">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            {/* Avatar */}
                            <div
                                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${msg.role === "dora"
                                    ? "bg-gradient-to-br from-[#00A758] to-[#0C7143] text-white"
                                    : "bg-muted text-muted-foreground"
                                    }`}
                            >
                                {msg.role === "dora" ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                            </div>

                            {/* Bubble */}
                            <div
                                className={`max-w-[85%] rounded-xl px-3 py-2 ${msg.role === "user"
                                    ? "bg-[#00A758] text-white rounded-br-sm"
                                    : "bg-muted/50 rounded-bl-sm"
                                    }`}
                            >
                                {msg.complianceBadge && (
                                    <div className="mb-2 flex items-center gap-1.5">
                                        {msg.complianceBadge === "approved" && (
                                            <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200 text-[9px] px-1.5 py-0 h-5">
                                                ✓ Compliance Approved
                                            </Badge>
                                        )}
                                        {msg.complianceBadge === "needs_review" && (
                                            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-200 text-[9px] px-1.5 py-0 h-5">
                                                ⚠ Needs Review
                                            </Badge>
                                        )}
                                        {msg.complianceBadge === "informational" && (
                                            <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200 text-[9px] px-1.5 py-0 h-5">
                                                ℹ Informational Only
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                <p className={`text-[11px] leading-relaxed ${msg.role === "user" ? "text-white/95" : "text-muted-foreground"}`}>
                                    {renderMarkdown(msg.text)}
                                </p>

                                {/* Data cards */}
                                {msg.data && msg.data.length > 0 && (
                                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                                        {msg.data.map((d, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-1.5 rounded-md text-center ${bgColorMap[d.color || "default"]}`}
                                            >
                                                <p className="text-[9px] text-muted-foreground truncate">{d.label}</p>
                                                <p className={`text-[11px] font-bold truncate ${colorMap[d.color || "default"]}`}>
                                                    {d.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Action chips */}
                                {msg.actions && msg.actions.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {msg.actions.map((a, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleQuickAction(a.label)}
                                                className="text-[10px] px-2 py-0.5 rounded-full border border-[#00A758]/30 text-[#00A758] hover:bg-[#00A758]/10 transition-colors cursor-pointer"
                                                data-testid={`dora-action-${idx}`}
                                            >
                                                {a.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {/* Typing indicator */}
                    {isLoading && (
                        <motion.div
                            key="typing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-2"
                        >
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00A758] to-[#0C7143] flex items-center justify-center">
                                <Bot className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="bg-muted/50 rounded-xl rounded-bl-sm px-3 py-2">
                                <div className="flex items-center gap-1">
                                    <Loader2 className="w-3 h-3 text-[#00A758] animate-spin" />
                                    <span className="text-[10px] text-muted-foreground">DORA is thinking...</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input */}
            <div className="mt-3 pt-3 border-t">
                <div className="flex items-center gap-1.5">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask DORA anything..."
                        className="flex-1 text-xs bg-muted/40 border border-border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-[#00A758]/50 placeholder:text-muted-foreground/50"
                        disabled={isLoading}
                        data-testid="dora-input"
                    />
                    <Button
                        size="sm"
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || isLoading}
                        className="h-8 w-8 p-0 bg-[#00A758] hover:bg-[#0C7143] text-white rounded-lg"
                        data-testid="dora-send"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </Button>
                </div>
                <p className="text-[9px] text-muted-foreground/60 text-center mt-1.5">
                    Powered by DORA · Digital Operations & Recommendations Assistant
                </p>
            </div>
        </div>
    );
}
