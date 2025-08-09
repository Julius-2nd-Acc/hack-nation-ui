import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

const API_BASE = "http://127.0.0.1:8000";

const messageSchema = z.object({
    role: z.string(), // 'user' or 'ai'
    content: z.string(),
});

const chatRequestSchema = z.object({
    history: z.array(messageSchema),
    message: z.string(),
});

const chatResponseSchema = z.object({
    response: z.string(),
    history: z.array(messageSchema),
});

export const pythonRouter = router({
    health: publicProcedure.query(async () => {
        const url = `${API_BASE}/health`;
        console.log('[pythonRouter] GET', url);
        const res = await fetch(url);
        console.log('[pythonRouter] Response status:', res.status);
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            console.error('[pythonRouter] Error body:', text);
            throw new Error('Python API health check failed');
        }
        return res.json();
    }),

    chat: publicProcedure
        .input(chatRequestSchema)
        .mutation(async ({ input }) => {
            const url = `${API_BASE}/chat`;
            console.log('[pythonRouter] POST', url, input);
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });
            console.log('[pythonRouter] Response status:', res.status);
            if (!res.ok) {
                const text = await res.text().catch(() => '');
                console.error('[pythonRouter] Error body:', text);
                throw new Error('Python API /chat failed');
            }
            return chatResponseSchema.parse(await res.json());
        }),


    talkFile: publicProcedure
        .input(chatRequestSchema)
        .mutation(async ({ input }) => {
            const url = `${API_BASE}/talk/file`;
            console.log('[pythonRouter] POST', url, input);
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });
            console.log('[pythonRouter] Response status:', res.status);
            if (!res.ok) {
                const text = await res.text().catch(() => '');
                console.error('[pythonRouter] Error body:', text);
                throw new Error('Python API /talk/file failed');
            }
            const arrayBuffer = await res.arrayBuffer();
            const base64Audio = Buffer.from(arrayBuffer).toString('base64');
            // You may want to pass the content-type as well, but assuming audio/mpeg for now
            return { audioBase64: base64Audio, mimeType: res.headers.get('content-type') || 'audio/mpeg' };
        }),
});

export type PythonRouter = typeof pythonRouter;