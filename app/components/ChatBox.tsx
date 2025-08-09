"use client";
import React, { useState, useRef, useEffect } from "react";
import { Box, Paper, Typography, TextField, IconButton, Avatar, Stack } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

interface Message {
    id: number;
    text: string;
    sender: "me" | "other";
}

export default function ChatBox() {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hello! How can I help you?", sender: "other" },
        { id: 2, text: "Hi! I have a question about my order.", sender: "me" },
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages((prev) => [
            ...prev,
            { id: prev.length + 1, text: input, sender: "me" },
        ]);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Paper elevation={3} sx={{ maxWidth: 420, mx: "auto", p: 2, borderRadius: 3, display: "flex", flexDirection: "column", height: 500 }}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                Chat
            </Typography>
            <Box sx={{ flex: 1, overflowY: "auto", mb: 2, px: 1 }}>
                {messages.map((msg) => (
                    <Stack
                        key={msg.id}
                        direction={msg.sender === "me" ? "row-reverse" : "row"}
                        spacing={1}
                        alignItems="flex-end"
                        sx={{ mb: 1 }}
                    >
                        <Avatar sx={{ bgcolor: msg.sender === "me" ? "primary.main" : "grey.400", width: 32, height: 32 }}>
                            {msg.sender === "me" ? "M" : "O"}
                        </Avatar>
                        <Box
                            sx={{
                                bgcolor: msg.sender === "me" ? "primary.main" : "grey.200",
                                color: msg.sender === "me" ? "#fff" : "#222",
                                px: 2,
                                py: 1,
                                borderRadius: 2,
                                maxWidth: 260,
                                wordBreak: "break-word",
                            }}
                        >
                            <Typography variant="body2">{msg.text}</Typography>
                        </Box>
                    </Stack>
                ))}
                <div ref={messagesEndRef} />
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    multiline
                    maxRows={3}
                />
                <IconButton color="primary" onClick={handleSend} sx={{ alignSelf: "end" }}>
                    <SendIcon />
                </IconButton>
            </Box>
        </Paper>
    );
}
