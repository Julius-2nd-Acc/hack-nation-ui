"use client";
import React, { useState, useRef } from "react";
import { Box, Paper, Typography, TextField, IconButton, Avatar, Stack, Button, CircularProgress } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { trpc } from '@/app/_trpc/client';

interface Message {
    role: "user" | "ai";
    content: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);


    const chatMutation = trpc.python.chat.useMutation();
    const talkFileMutation = trpc.python.talkFile.useMutation();
    const healthQuery = trpc.python.health.useQuery();

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        setLoading(true);
        const userMsg: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        try {
            const res = await chatMutation.mutateAsync({
                history: [...messages, userMsg],
                message: input,
            });
            setMessages(res.history.map((msg: { role: string; content: string }) => ({
                role: (msg.role === "user" || msg.role === "ai") ? msg.role : "ai",
                content: msg.content,
            })));
        } catch (e) {
            setMessages((prev) => [...prev, { role: "ai", content: "Error: Could not get response." }]);
        }
        setLoading(false);
    };


    const playAudio = (urlOrBase64: string, mimeType?: string) => {
        // If it's a base64 string, create a blob URL
        if (urlOrBase64.startsWith('data:') || urlOrBase64.startsWith('blob:') || urlOrBase64.startsWith('http')) {
            const audio = new Audio(urlOrBase64);
            audio.play();
            setAudioUrl(urlOrBase64);
        } else {
            // Assume base64
            const type = mimeType || 'audio/mpeg';
            const byteCharacters = atob(urlOrBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type });
            const blobUrl = URL.createObjectURL(blob);
            const audio = new Audio(blobUrl);
            audio.play();
            setAudioUrl(blobUrl);
        }
    };



    // File-based audio (not streaming)
    const handleTalkFile = async () => {
        if (!input.trim()) return;
        setLoading(true);
        try {
            const res = await talkFileMutation.mutateAsync({
                history: messages,
                message: input,
            });
            if (res.audioBase64) playAudio(res.audioBase64, res.mimeType);
        } catch (e) {
            setAudioUrl(null);
        }
        setLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Box sx={{ maxWidth: 500, mx: "auto", p: 2 }}>
            <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
                Python FastAPI Chat
            </Typography>
            <Paper elevation={3} sx={{ p: 2, minHeight: 400, mb: 2, display: "flex", flexDirection: "column", height: 400 }}>
                <Box sx={{ flex: 1, overflowY: "auto", mb: 2, px: 1 }}>
                    {messages.map((msg, i) => (
                        <Stack
                            key={i}
                            direction={msg.role === "user" ? "row-reverse" : "row"}
                            spacing={1}
                            alignItems="flex-end"
                            sx={{ mb: 1 }}
                        >
                            <Avatar sx={{ bgcolor: msg.role === "user" ? "primary.main" : "grey.400", width: 32, height: 32 }}>
                                {msg.role === "user" ? "U" : "AI"}
                            </Avatar>
                            <Box
                                sx={{
                                    bgcolor: msg.role === "user" ? "primary.main" : "grey.200",
                                    color: msg.role === "user" ? "#fff" : "#222",
                                    px: 2,
                                    py: 1,
                                    borderRadius: 2,
                                    maxWidth: 260,
                                    wordBreak: "break-word",
                                }}
                            >
                                <Typography variant="body2">{msg.content}</Typography>
                            </Box>
                        </Stack>
                    ))}
                    <div ref={messagesEndRef} />
                </Box>
                {audioUrl && (
                    <Box sx={{ mb: 2 }}>
                        <audio src={audioUrl} controls autoPlay style={{ width: "100%" }} />
                    </Box>
                )}
                {loading && <CircularProgress size={24} sx={{ mx: "auto", display: "block" }} />}
            </Paper>
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    multiline
                    maxRows={3}
                    InputProps={{
                        sx: {
                            backgroundColor: '#fff',
                            color: '#222',
                        },
                    }}
                />
                <IconButton color="primary" onClick={handleSend} disabled={loading} sx={{ alignSelf: "end" }}>
                    <SendIcon />
                </IconButton>
            </Box>
            <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                <Button variant="outlined" onClick={handleTalkFile} disabled={loading || !input.trim()}>
                    Talk File
                </Button>
            </Box>
            <Box sx={{ mt: 2, textAlign: "center" }}>
                <Typography variant="caption" color={healthQuery.data?.status === "ok" ? "success.main" : "error.main"}>
                    Python API Health: {healthQuery.isLoading ? "Checking..." : healthQuery.data?.status || "Unavailable"}
                </Typography>
            </Box>
        </Box>
    );
}
