// Zod schema for a chat message (matches backend structure)
const ChatMessageSchema = z.object({
    message_id: z.string(),
    role: z.string(),
    content: z.string(),
    status: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    completed_at: z.string().nullable().optional(),
});

// Zod schema for chat history response
const ChatHistoryResponseSchema = z.object({
    session: z.object({
        session_id: z.string(),
        created_at: z.string(),
        updated_at: z.string(),
    }),
    messages: z.array(ChatMessageSchema),
});
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

const TRACE_API_URL = process.env.TRACE_API_URL;

// SessionResponse types
// New session schema for /sessions/<session_id>
const sessionInfoSchema = z.object({
    session_id: z.string().optional().nullable(),
    created_at: z.string().optional().nullable(),
    updated_at: z.string().optional().nullable(),
});

const messageInfoSchema = z.object({
    message_id: z.string(),
    role: z.string(),
    content: z.string(),
    status: z.string(),
    created_at: z.string(),
    completed_at: z.string(),
    // Allow these fields to be optional for compatibility with backend
    event: z.string().optional(),
    session_id: z.string().optional(),
    ts: z.number().optional(),
});


const traceSchema = z.object({
    event: z.string().optional().nullable(),
    inputs: z.unknown().optional().nullable(),
    name: z.array(z.string()).optional().nullable(),
    session_id: z.string().optional().nullable(),
    ts: z.number().optional().nullable(),
    params: z.unknown().optional().nullable(),
    prompts: z.unknown().optional().nullable(),
    output: z.unknown().optional().nullable(),
    input: z.unknown().optional().nullable(),
    tool: z.string().optional().nullable(),
    outputs: z.unknown().optional().nullable(),
});



// Chat endpoint response type
const chatResponseSchema = z.object({
    message_id: z.string(),
    session_id: z.string(),
});
// Message and traces schema for chainToFlow
const messageSchema = z.object({
    completed_at: z.string().nullable(),
    content: z.string(),
    created_at: z.string(),
    message_id: z.string(),
    role: z.string(),
    session_id: z.string(),
    status: z.string(),
});

const chainToFlowResponseSchema = z.object({
    message: messageSchema,
    traces: z.array(traceSchema),
});

const SessionToFlowResponseSchema = z.object({
    session: z.unknown(),
    traces: z.array(traceSchema),
});


export const pythonRouter = router({
    traceToFlow: publicProcedure
        .input(z.object({ session_id: z.string() }))
        .query(async ({ input }) => {
            if (!TRACE_API_URL) {
                console.error('TRACE_API_URL is not set in environment variables');
                throw new Error('TRACE_API_URL is not set in environment variables');
            }
            const url = `${TRACE_API_URL}/sessions/${input.session_id}/traces`;
            console.log('[traceToFlow] Fetching:', url);
            const res = await fetch(url);
            if (!res.ok) {
                console.error('[traceToFlow] Failed to fetch session:', res.status, res.statusText);
                throw new Error('Failed to fetch session');
            }
            const data = await res.json();
            console.log('[traceToFlow] Response:', data);
            // Validate and return as session/messages response
            return SessionToFlowResponseSchema.parse(data);
        }),

    chatReplay: publicProcedure
        .input(
            z.object({
                history: z.array(z.unknown()),
                traces: z.array(z.unknown()),
                user_prompt: z.string().optional().nullable(),
            })
        )
        .mutation(async ({ input }) => {
            if (!TRACE_API_URL) {
                throw new Error('TRACE_API_URL is not set in environment variables');
            }
            const url = `${TRACE_API_URL}/chat/replay`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });
            if (!res.ok) {
                const err = await res.text();
                throw new Error(`Failed to replay chat: ${res.status} ${res.statusText} - ${err}`);
            }
            const data = await res.json();
            return data;
        }),
    
    chatHistory: publicProcedure
        .input(z.object({ session_id: z.string() }))
        .query(async ({ input }) => {
            const url = `${process.env.TRACE_API_URL || ''}/sessions/${input.session_id}`;
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(`Failed to fetch chat history: ${res.status} ${res.statusText}`);
            }
            const data = await res.json();
            return ChatHistoryResponseSchema.parse(data);
        }),

    chainToFlow: publicProcedure
        .input(z.object({ message_id: z.string() }))
        .query(async ({ input }) => {
            console.log('[chainToFlow] Endpoint HIT with message_id:', input.message_id);
            if (!TRACE_API_URL) {
                console.error('TRACE_API_URL is not set in environment variables');
                throw new Error('TRACE_API_URL is not set in environment variables');
            }
            const url = `${TRACE_API_URL}/messages/${input.message_id}/traces`;
            console.log('[chainToFlow] Fetching:', url);
            const res = await fetch(url, { method: 'GET' });
            if (!res.ok) {
                console.error('[chainToFlow] Failed to fetch message traces:', res.status, res.statusText);
                throw new Error('Failed to fetch message traces');
            }
            const data = await res.json();
            console.log('[chainToFlow] Response:', data);
            // Validate and return as chainToFlow response
            return chainToFlowResponseSchema.parse(data);
        }),

    chatNew: publicProcedure
        .input(z.object({
            prompt: z.string(),
            messages: z.string(),
            session_id: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
            if (!TRACE_API_URL) {
                console.error('TRACE_API_URL is not set in environment variables');
                throw new Error('TRACE_API_URL is not set in environment variables');
            }
            const url = `${TRACE_API_URL}/chat/new`;
            const body: Record<string, any> = {
                prompt: input.prompt,
            };
            if (input.session_id) {
                body.session_id = input.session_id;
            }
            console.log('[chatNew] POST:', url, 'Body:', body);
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                console.error('[chatNew] Failed to create chat session:', res.status, res.statusText);
                throw new Error('Failed to create chat session');
            }
            const data = await res.json();
            console.log('[chatNew] Response:', data);
            // Validate and return only message_id and session_id
            const { message_id, session_id } = chatResponseSchema.parse(data);
            return { message_id, session_id };
        }),
});

export type PythonRouter = typeof pythonRouter;