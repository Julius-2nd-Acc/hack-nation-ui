export type Session = {
    completed_at: string; // e.g., "2025-08-09 21:14:35"
    created_at: string;   // e.g., "2025-08-09 21:14:31"
    final_output: string; // e.g., "The current time in Germany is ..."
    initial_prompt: string;
    session_id: string;   // UUID
    status: string;       // e.g., "completed"
};

export type Trace = {
    event: string; // e.g., "chain_start", "llm_start", etc.
    inputs?: {
        input: string;
    };
    name?: string[]; // e.g., ["langchain", "agents", "agent", "AgentExecutor"]

    ts: number; // timestamp (seconds with fractions)
    params?: {
        _type: string;       // e.g., "openai-chat"
        model: string;       // e.g., "gpt-4"
        model_name: string;  // e.g., "gpt-4"
        n: number;
        stop: string[];
        stream: boolean;
        temperature: number;
    };
    prompts?: string[];
    output?: string;
    input?: string;
    tool?: string; // e.g., "get_current_time"
    outputs?: {
        output: string;
    };
};

export type SessionResponse = {
    session: Session;
    traces: Trace[];
};
