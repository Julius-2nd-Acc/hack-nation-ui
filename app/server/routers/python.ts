import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

const TRACE_API_URL = process.env.TRACE_API_URL;

// SessionResponse types
const sessionSchema = z.object({
    completed_at: z.string(),
    created_at: z.string(),
    final_output: z.string(),
    initial_prompt: z.string(),
    session_id: z.string(),
    status: z.string(),
});

const traceSchema = z.object({
    event: z.string(),
    inputs: z.object({ input: z.string() }).optional(),
    name: z.array(z.string()).optional(),
    session_id: z.string(),
    ts: z.number(),
    params: z.object({
        _type: z.string(),
        model: z.string(),
        model_name: z.string(),
        n: z.number(),
        stop: z.array(z.string()),
        stream: z.boolean(),
        temperature: z.number(),
    }).optional(),
    prompts: z.array(z.string()).optional(),
    output: z.string().optional(),
    input: z.string().optional(),
    tool: z.string().optional(),
    outputs: z.object({ output: z.string() }).optional(),
});

const sessionResponseSchema = z.object({
    session: sessionSchema,
    traces: z.array(traceSchema),
});

export const pythonRouter = router({
    traceToFlow: publicProcedure
        .input(z.object())
        .query(async () => {
            if (!TRACE_API_URL) {
                throw new Error('TRACE_API_URL is not set in environment variables');
            }
            const url = `${TRACE_API_URL}`;
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error('Failed to fetch trace');
            }
            const trace = await res.json();
            // Validate and return as SessionResponse
            return sessionResponseSchema.parse(trace);
        }),
});

export type PythonRouter = typeof pythonRouter;