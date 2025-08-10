
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { trpc } from '../_trpc/client';
import emitter from '../../lib/emitter';
import { Drawer, IconButton, Button, Divider, Tabs, Tab, Box, Collapse, Grid } from '@mui/material';
import StatisticsTab from './StatisticsTab';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';


/**
 * This is the Sidebar to the right of the canvas.
 * It contains options for saving, loading, and deleting the flow.
 * Any new options should be added here.
 *
 */


const Sidebar: React.FC = () => {
    const [open, setOpen] = useState(true);
    const [tab, setTab] = useState(0);
    const [traceInfo, setTraceInfo] = useState<any>(null);
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    // Read session_id from URL params on mount
    const [chatSessionId, setChatSessionId] = useState<string | undefined>(() => {
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            return url.searchParams.get('session_id') || undefined;
        }
        return undefined;
    });
    const router = useRouter();
    const params = useParams();
    const [chatLoading, setChatLoading] = useState(false);
    const flowProviderRef = useRef<any>(null);
    const [paramsOpen, setParamsOpen] = useState(false);

    const {
        data,
        error,
        refetch: refetchChatHistory
    } = trpc.python.chatHistory.useQuery(
        chatSessionId ? { session_id: chatSessionId } : { session_id: '' },
        { enabled: !!chatSessionId, staleTime: Infinity, refetchOnMount: false, refetchOnWindowFocus: false }
    );

    useEffect(() => {
        if (data) {
            console.log('Chat history fetched:', data);
            setChatMessages(data.messages);
        }
        if (error) {
            console.error('Error fetching chat history:', error);
        }
    }, [error, data]);

    // Listen for UpdateFlowFromTraces and add chain_end output to chat
    useEffect(() => {
        const handler = (event: unknown) => {
            const traces = event as any[];
            const chainEnd = traces.find(t => t.event === 'chain_end');
            if (chainEnd && chainEnd.output) {
                setChatMessages((prev: any[]) => [...prev, { sender: 'agent', text: chainEnd.output }]);
            }
        };
        emitter.on('UpdateFlowFromTraces', handler);
        return () => emitter.off('UpdateFlowFromTraces', handler);
    }, []);

    useEffect(() => {
        const handler = (traceInfo: any) => {
            setOpen(true);
            setTab(1); // Trace tab
            setTraceInfo(traceInfo);
            console.log('Sidebar received trace info:', traceInfo);
        };
        emitter.on('ShowNode', handler);
        return () => {
            emitter.off('ShowNode', handler);
        };
    }, []);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    // Helper to render a field if present
    const renderField = (label: string, value: any) => (
        value !== undefined && value !== null && value !== '' ? (
            <Box sx={{ mb: 1 }}>
                <label style={{ fontWeight: 500, color: '#2563eb', fontSize: 13 }}>{label}</label>
                <Box sx={{ width: '100%', p: 1, borderRadius: 1, bgcolor: '#f7fafd', border: '1px solid #e0e7ff', mt: 0.5, fontSize: 15, whiteSpace: 'pre-wrap' }}>{String(value)}</Box>
            </Box>
        ) : null
    );

    // Helper to render a scrollable field (for prompts, input, output)
    const renderScrollableField = (label: string, value: any) => (
        value !== undefined && value !== null && value !== '' ? (
            <Box sx={{ mb: 1 }}>
                <label style={{ fontWeight: 500, color: '#2563eb', fontSize: 13 }}>{label}</label>
                <Box
                    sx={{
                        width: '100%',
                        p: 1,
                        borderRadius: 1,
                        bgcolor: '#f7fafd',
                        border: '1px solid #e0e7ff',
                        mt: 0.5,
                        fontSize: 15,
                        whiteSpace: 'pre-wrap',
                        maxHeight: 120,
                        overflowY: 'auto',
                        fontFamily: 'monospace',
                    }}
                >
                    {String(value)}
                </Box>
            </Box>
        ) : null
    );

    // Helper to render params as a collapsible grid
    const renderParams = (params: any) => (
        params ? (
            <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setParamsOpen(!paramsOpen)}>
                    <label style={{ fontWeight: 500, color: '#2563eb', fontSize: 13 }}>Parameters</label>
                    {paramsOpen ? <ExpandLessIcon sx={{ ml: 1 }} /> : <ExpandMoreIcon sx={{ ml: 1 }} />}
                </Box>
                <Collapse in={paramsOpen}>
                    <Box sx={{ mt: 1 }}>
                        <table style={{ width: '100%', fontSize: 14 }}>
                            <tbody>
                                {Object.entries(params).map(([key, value]) => (
                                    <tr key={key}>
                                        <td style={{ fontWeight: 500, color: '#555', padding: '2px 8px 2px 0', width: '40%' }}>{key}</td>
                                        <td style={{ color: '#222', padding: '2px 0' }}>{String(value)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>
                </Collapse>
            </Box>
        ) : null
    );


    // trpc hooks as properties
    const chatNewMutation = trpc.python.chatNew.useMutation();
    // For polling chainToFlow on demand
    const [chainToFlowMessageId, setChainToFlowMessageId] = useState<string | null>(null);
    const {
        data: chainToFlowData,
        refetch: refetchChainToFlow,
        isFetching: isChainToFlowFetching,
    } = trpc.python.chainToFlow.useQuery(
        chainToFlowMessageId ? { message_id: chainToFlowMessageId } : { message_id: '' },
        { enabled: false }
    );

    // Helper: poll chainToFlow until chain_end using refetch
    const pollChainToFlow = async (message_id: string) => {
        let done = false;
        let lastTraces: any[] = [];
        let pollCount = 0;
        emitter.emit('SwitchToExternalFlow');
        while (!done) {
            setChainToFlowMessageId(message_id); // ensure query is for the right message_id
            try {
                console.log('[Sidebar] Polling chainToFlow, pollCount:', pollCount, 'message_id:', message_id);
                const res = await refetchChainToFlow();
                // Debug: log the full response
                console.log('[Sidebar] Full chainToFlow response:', res);
                // The correct traces array is in res.data?.traces (not chainToFlowData!)
                const traces = res.data?.traces ?? [];
                lastTraces = traces;
                console.log('[Sidebar] Polled chainToFlow:', traces);
                emitter.emit('UpdateFlowFromTraces', traces);
                if (traces.some(t => t.event === 'chain_end')) {
                    done = true;
                } else {
                    await new Promise(r => setTimeout(r, 1200));
                }
                pollCount++;
            } catch (e) {
                console.error('[Sidebar] Polling error:', e);
                done = true;
            }
        }
        emitter.emit("Refetch");
        // Refetch chat history after polling is done
        refetchChatHistory();
    };

    // Handler: send chat
    const handleSendChat = async () => {
        if (!chatInput.trim()) return;
        setChatLoading(true);
        setChatMessages((prev) => [...prev, { role: 'user', content: chatInput }]);
        try {
            const res = await chatNewMutation.mutateAsync({
                prompt: chatInput,
                messages: chatInput,
                session_id: chatSessionId,
            });
            setChatSessionId(res.session_id);
            // If the session_id is new or different, update the route as a query param
            if (!params.sessionId || params.sessionId !== res.session_id) {
                const url = new URL(window.location.href);
                url.searchParams.set('session_id', res.session_id);
                router.push(url.pathname + url.search);
            }
            await pollChainToFlow(res.message_id);
            // Tell FlowProvider to switch to the new request tab

        } catch (e) {
            // Optionally show error
        }
        setChatInput("");
        setChatLoading(false);
    };

    return (
        <div className="flex">
            <div>
                {!open && (
                    <IconButton onClick={() => setOpen(true)} sx={{ position: 'fixed', top: '50%', right: 0, zIndex: 1300 }}>
                        <ChevronLeftIcon />
                    </IconButton>
                )}

                <Drawer
                    variant="persistent"
                    anchor="right"
                    open={open}
                    PaperProps={{
                        id: 'options-sidebar-actual',
                        sx: {
                            top: '64px',
                            width: '35vw',
                            minWidth: 320,
                            maxWidth: '100vw',
                            height: 'calc(100vh - 64px)',
                            maxHeight: 'calc(100vh - 64px)',
                            borderRadius: '0',
                            boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.13)',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        },
                    }}
                >
                    {/* Button to close sidebar */}
                    <IconButton onClick={() => setOpen(false)} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                        <ChevronRightIcon />
                    </IconButton>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', pt: 2 }}>
                        <Tabs value={tab} onChange={handleTabChange} centered>
                            <Tab label="Chat" />
                            <Tab label="Trace" />
                            <Tab label="Statistics" />
                        </Tabs>
                    </Box>

                    <div
                        className="px-4 pb-4"
                        style={{
                            flex: '1 1 auto',
                            overflowY: 'auto',
                            height: '0px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                        }}
                    >
                        {tab === 0 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0 }}>
                                {/* Chat messages area */}
                                <Box sx={{ flex: 1, overflowY: 'auto', mb: 1, p: 1, bgcolor: '#f7fafd', borderRadius: 2, minHeight: 0 }}>
                                    {chatMessages.map((msg, idx) => (
                                        <Box key={idx} sx={{ mb: 1, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                            <Box sx={{ display: 'inline-block', bgcolor: msg.role === 'user' ? '#e0e7ff' : '#2563eb', color: msg.role === 'user' ? '#222' : '#fff', px: 2, py: 1, borderRadius: 2, fontSize: 14 }}>
                                                {msg.content}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                                {/* Input and send button */}
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', p: 1, bgcolor: '#fff', borderRadius: 2 }}>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #e0e7ff', fontSize: 15 }}
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
                                        disabled={chatLoading}
                                    />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        sx={{ minWidth: 0, px: 2, py: 1, borderRadius: 2, fontWeight: 600 }}
                                        onClick={handleSendChat}
                                        disabled={chatLoading}
                                    >
                                        {chatLoading ? '...' : 'Send'}
                                    </Button>
                                </Box>
                            </Box>
                        )}
                        {tab === 1 && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0, gap: 2, pt: 2 }}>
                                {traceInfo && (
                                    <>
                                        {/* Input Data */}
                                        <Box sx={{ mb: 2 }}>
                                            {traceInfo.params && (
                                                <>
                                                    <label style={{ fontWeight: 600, color: '#222', fontSize: 15 }}>Parameters</label>
                                                    {renderParams(traceInfo.params)}
                                                </>
                                            )}

                                            {(traceInfo.input || (traceInfo.inputs && traceInfo.inputs.input)) && (
                                                <>
                                                    <label style={{ fontWeight: 600, color: '#222', fontSize: 15 }}>Input Data</label>
                                                    {renderScrollableField('Input', traceInfo.input || (traceInfo.inputs && traceInfo.inputs.input))}
                                                </>
                                            )}

                                            {renderField('Tool', traceInfo.tool)}
                                            {renderScrollableField('Prompts', traceInfo.prompts && traceInfo.prompts.join('\n'))}
                                            {renderField('Duration (ms)', traceInfo.durationMs)}
                                        </Box>
                                        {traceInfo.output && <Divider />}

                                        {(traceInfo.output || (traceInfo.outputs && traceInfo.outputs.output)) && (
                                            <Box sx={{ mt: 2 }}>
                                                <label style={{ fontWeight: 600, color: '#222', fontSize: 15 }}>Output Data</label>
                                                {renderScrollableField('Output', traceInfo.output)}
                                                {renderScrollableField('Final Answer:', traceInfo.outputs && traceInfo.outputs.output)}
                                            </Box>
                                        )}
                                    </>
                                )}
                            </Box>
                        )}
                        {tab === 2 && (
                            <StatisticsTab />
                        )}
                        <Divider sx={{ margin: '8px 0' }} />
                    </div>
                </Drawer>
            </div>
        </div>
    );
};

export default Sidebar;

