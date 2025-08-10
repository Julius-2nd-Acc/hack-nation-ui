// --- ReplayAgentNode handler ---

// Helper to calculate duration in ms between two traces (using ts field)
function calculateDurationMs(traceA?: Trace, traceB?: Trace): number | undefined {
    if (typeof traceA?.ts === 'number' && typeof traceB?.ts === 'number') {
        return Math.round((traceB.ts - traceA.ts) * 1000);
    }
    return undefined;
}
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from 'next/navigation';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import emitter from "../../lib/emitter";
import ReactFlow, { Background, Node, Edge, MarkerType, ReactFlowInstance, useReactFlow } from "reactflow";
import "reactflow/dist/style.css";
import AgentNode from "./nodes/AgentNode";
import ToolNode from "./nodes/ToolNode";
import ResourceNode from "./nodes/ResourceNode";
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import { trpc } from "../_trpc/client";
import type { SessionResponse, Trace } from "./SessionResponse";
import { parse } from "path";
import CapstoneNode from "./nodes/CapstoneNode";


const nodeTypes = {
    agent: AgentNode,
    resource: ResourceNode,
    tool: ToolNode,
    capstone: CapstoneNode
};

const initialNodes: Node[] = [

];

const initialEdges: Edge[] = [

];

export default function FlowProvider() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id') || undefined;
    const [allNodes, setAllNodes] = useState<Node[]>(initialNodes);
    const [allEdges, setAllEdges] = useState<Edge[]>(initialEdges);
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [step, setStep] = useState<number>(initialNodes.length);
    const [chains, setChains] = useState<{ start: number, end: number }[]>([]);
    const [selectedChainIdx, setSelectedChainIdx] = useState<number>(0);
    // For external traces (new request)
    const [externalTraces, setExternalTraces] = useState<Trace[] | null>(null);
    const [externalNodes, setExternalNodes] = useState<Node[]>([]);
    const [externalEdges, setExternalEdges] = useState<Edge[]>([]);


    // Only fetch if sessionId is present
    const {
        data,
        error,
        refetch: refetchTraceToFlow
    } = trpc.python.traceToFlow.useQuery(
        sessionId ? { session_id: sessionId } : { session_id: '' },
        { enabled: !!sessionId, staleTime: Infinity, refetchOnMount: false, refetchOnWindowFocus: false }
    );
    // Listen for external traces (from chat polling) and for tab switch event
    useEffect(() => {
        const handler = (event: unknown) => {
            const traces = event as Trace[];
            setExternalTraces(traces);
            const { nodes: parsedNodes, edges: parsedEdges } = parseTracesToFlow(traces);
            setExternalNodes(parsedNodes);
            setExternalEdges(parsedEdges);
        };
        const switchHandler = () => {
            setSelectedChainIdx(-1);
        };
        const refetchHandler = () => {
            refetchTraceToFlow();
        };
        emitter.on('UpdateFlowFromTraces', handler);
        emitter.on('SwitchToExternalFlow', switchHandler);
        emitter.on('Refetch', refetchHandler);
        return () => {
            emitter.off('UpdateFlowFromTraces', handler);
            emitter.off('SwitchToExternalFlow', switchHandler);
            emitter.off('Refetch', refetchHandler);
        };
    }, [refetchTraceToFlow]);


    const chatReplayMutation = trpc.python.chatReplay.useMutation();
    useEffect(() => {
        const handler = async (traceInfo: any) => {
            // Find all traces up to and including the selected node
            let traces: Trace[] = [];
            if (selectedChainIdx === -1 && externalTraces) {
                traces = externalTraces;
            } else if (data && data.traces) {
                // Use traces for the selected chain if available
                function isTrace(m: any): m is Trace {
                    return m && typeof m.event === 'string' && typeof m.ts === 'number';
                }
                const allTraces = (data.traces as any[]).filter(isTrace);
                if (chains.length > 0 && selectedChainIdx >= 0) {
                    const { start, end } = chains[selectedChainIdx];
                    traces = allTraces.slice(start, end + 1);
                } else {
                    traces = allTraces;
                }
            }
            // Find the index of the selected trace in traces
            let idx = traces.findIndex(t => t.ts === traceInfo.ts && t.event === traceInfo.event);
            if (idx === -1) idx = traces.length - 1;
            const replayTraces = traces.slice(0, idx + 1);
            console.log("traceInfo", traceInfo);
            // Use newPrompt if present and non-empty, else use default prompt
            const prompt = (typeof traceInfo.newPrompt === 'string' && traceInfo.newPrompt.trim() !== '')
                ? traceInfo.newPrompt
                : (traceInfo.input || (traceInfo.inputs && traceInfo.inputs.input) || '');
            console.log("prompt", prompt)
            console.log('Replay traces:', replayTraces);
            emitter.emit('UpdateFlowFromTraces', replayTraces);
            try {
                if (replayTraces.length > 0 && replayTraces[replayTraces.length - 1].event === 'llm_end') {
                    replayTraces.pop();
                }
                const res = await chatReplayMutation.mutateAsync({
                    history: [], // Optionally pass chat history if available
                    traces: replayTraces,
                    user_prompt: prompt,
                });
                // Optionally, you can emit new traces or update the flow
                if (res && res.traces) {
                    emitter.emit('UpdateFlowFromTraces', res.traces);
                }
            } catch (e) {
                // Optionally handle error (emit event, show toast, etc)
                console.error('ReplayAgentNode error:', e);
            }
        };
        emitter.on('ReplayAgentNode', handler);
        return () => emitter.off('ReplayAgentNode', handler);
    }, [data, chains, selectedChainIdx, externalTraces, chatReplayMutation]);

    // Parse chains from traces and emit statistics
    useEffect(() => {
        if (error) return;
        if (data && data.traces) {
            function isTrace(m: any): m is Trace {
                return m && typeof m.event === 'string' && typeof m.session_id === 'string' && typeof m.ts === 'number';
            }
            const traces = data.traces as Trace[];
            const starts: number[] = [];
            const ends: number[] = [];
            traces.forEach((t, idx) => {
                if (t.event === 'chain_start') starts.push(idx);
                if (t.event === 'chain_end') ends.push(idx);
            });
            const chainPairs: { start: number; end: number }[] = [];
            for (let i = 0; i < Math.min(starts.length, ends.length); i++) {
                if (starts[i] <= ends[i]) {
                    chainPairs.push({ start: starts[i], end: ends[i] });
                }
            }
            setChains(chainPairs);
            setSelectedChainIdx(prev =>
                typeof prev === 'number' ? prev : chainPairs.length > 0 ? chainPairs.length - 1 : 0
            );

            // --- STATISTICS AGGREGATION ---
            const responseTimes = chainPairs.map(({ start, end }, idx) => {
                const startTrace = traces[start];
                const endTrace = traces[end];
                return {
                    chain: idx + 1,
                    responseTime: (endTrace && startTrace) ? Math.round((endTrace.ts - startTrace.ts) * 1000) : 0,
                };
            });
            const criticalNodes: { idx: number, event: string, durationMs: number, trace: Trace }[] = [];
            for (let i = 0; i < traces.length - 1; i++) {
                const t1 = traces[i];
                const t2 = traces[i + 1];
                if ((t1.event && t1.event.endsWith('_start') && t2.event && t2.event.replace('_end', '_start') === t1.event)) {
                    const durationMs = Math.round((t2.ts - t1.ts) * 1000);
                    if (durationMs > 5000) {
                        criticalNodes.push({ idx: i, event: t1.event, durationMs, trace: t1 });
                    }
                }
            }
            const avgResponseTime = responseTimes.length > 0 ? Math.round(responseTimes.reduce((a, b) => a + b.responseTime, 0) / responseTimes.length) : 0;
            const totalFlows = chainPairs.length;
            const totalNodes = traces.length;
            emitter.emit('StatisticsData', {
                responseTimes,
                criticalNodes,
                avgResponseTime,
                totalFlows,
                totalNodes,
            });
        }
    }, [data, error]);

    // Parse nodes/edges for selected chain or external traces
    useEffect(() => {

        // If "New Request" is selected and we have external traces, show those
        if (selectedChainIdx === -1 && (externalNodes.length > 0 || externalEdges.length > 0)) {
            setAllNodes(externalNodes);
            setAllEdges(externalEdges);
            setStep(externalNodes.length);
            setNodes(externalNodes);
            setEdges(externalEdges);
            return;
        }
        // If we have traces but no chains, show all traces as a single flow
        if (data && data.traces && chains.length === 0) {
            function isTrace(m: any): m is Trace {
                return m && typeof m.event === 'string' && typeof m.session_id === 'string' && typeof m.ts === 'number';
            }
            const traces = data.traces.filter(isTrace) as unknown as Trace[];
            if (traces.length > 0) {
                const { nodes: parsedNodes, edges: parsedEdges } = parseTracesToFlow(traces);
                setAllNodes(parsedNodes);
                setAllEdges(parsedEdges);
                setStep(parsedNodes.length);
                setNodes(parsedNodes);
                setEdges(parsedEdges);
            }
            return;
        }
        // Otherwise, show the selected chain from session
        if (data && data.traces && chains.length > 0) {
            function isTrace(m: any): m is Trace {
                console.log(m);
                return m && typeof m.event === 'string' && typeof m.ts === 'number';
            }
            const traces = data.traces.filter(isTrace) as Trace[];
            const { start, end } = chains[selectedChainIdx] || chains[0];
            const tracesForChain = traces.slice(start, end + 1);
            const { nodes: parsedNodes, edges: parsedEdges } = parseTracesToFlow(tracesForChain);
            setAllNodes(parsedNodes);
            setAllEdges(parsedEdges);
            setStep(parsedNodes.length);
            setNodes(parsedNodes.slice(0, 1));
            setEdges([]);
        }
    }, [data, error, chains, selectedChainIdx, externalTraces, externalNodes, externalEdges]);

    useEffect(() => {
        // Show up to current step
        const visibleNodes = allNodes.slice(0, step);
        const lastNode = visibleNodes[visibleNodes.length - 1];
        // Highlight last node unless it's a chain_end or agent_end node
        const isEndStep = lastNode?.data?.trace?.event === 'chain_end' || lastNode?.id === 'agent_end';
        setNodes(
            visibleNodes.map((node, idx, arr) => ({
                ...node,
                data: {
                    ...node.data,
                    processing: idx === arr.length - 1 && !isEndStep,
                },
            }))
        );
        setEdges(
            allEdges.slice(0, Math.max(0, step - 1)).map((edge, idx, arr) => {
                const isLast = idx === arr.length - 1;
                return {
                    ...edge,
                    animated: isLast,
                    style: isLast && !isEndStep ? { stroke: 'red', strokeWidth: 3 } : {},
                };
            })
        );
    }, [step, allNodes, allEdges]);

    const handleStepForward = () => {
        if (step < allNodes.length) {
            setStep(step + 1);
        }
    };
    const handleStepBackward = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    function parseTracesToFlow(traces: Trace[]) {
        const nodes: Node[] = [];
        const edges: Edge[] = [];
        let y = 0;
        let x = 0;
        let nodeId = 0;
        let prevNodeId: string | null = null;
        let i = 0;
        while (i < traces.length) {
            const curr = traces[i];
            const next = traces[i + 1];
            // chain_start
            if (curr.event === 'chain_start') {
                const chainStartId = `chain_start_${nodeId++}`;
                console.log('Chain Start:', curr);
                nodes.push({
                    id: chainStartId,
                    type: 'capstone',
                    data: {
                        label: 'Chain Start',
                        inputs: curr.inputs?.input,
                        outputs: curr.outputs?.output,
                        trace: curr,
                    },
                    position: { x, y },
                });
                if (prevNodeId) {
                    edges.push({
                        id: `e-${prevNodeId}-${chainStartId}`,
                        source: prevNodeId,
                        target: chainStartId,
                        label: '',
                        animated: true,
                        markerEnd: { type: MarkerType.ArrowClosed },
                    });
                }
                prevNodeId = chainStartId;
                y -= 150;
                i++;
                continue;
            }
            // chain_end
            if (curr.event === 'chain_end') {
                const chainEndId = `chain_end_${nodeId++}`;
                nodes.push({
                    id: chainEndId,
                    type: 'capstone',
                    data: {
                        label: 'Chain End',
                        trace: curr,
                    },
                    position: { x, y },
                });
                if (prevNodeId) {
                    edges.push({
                        id: `e-${prevNodeId}-${chainEndId}`,
                        source: prevNodeId,
                        target: chainEndId,
                        label: '',
                        animated: true,
                        markerEnd: { type: MarkerType.ArrowClosed },
                    });
                }
                prevNodeId = chainEndId;
                y -= 150;
                i++;
                continue;
            }
            // tool_start/tool_end pair
            if (curr.event === 'tool_start' && next && next.event === 'tool_end') {
                const toolNodeId = `tool_${nodeId++}`;
                nodes.push({
                    id: toolNodeId,
                    type: 'tool',
                    data: {
                        label: curr.tool || 'Tool',
                        trace: { ...curr, ...next, durationMs: calculateDurationMs(curr, next) },
                    },
                    position: { x: x + 300, y },
                });
                if (prevNodeId) {
                    edges.push({
                        id: `e-${prevNodeId}-${toolNodeId}`,
                        source: prevNodeId,
                        target: toolNodeId,
                        label: '',
                        animated: true,
                        markerEnd: { type: MarkerType.ArrowClosed },
                    });
                }
                prevNodeId = toolNodeId;
                y -= 150;
                i += 2;
                continue;
            }
            // llm_start/llm_end pair
            if (curr.event === 'llm_start' && next && next.event === 'llm_end') {
                const agentNodeId = `agent_${nodeId++}`;
                nodes.push({
                    id: agentNodeId,
                    type: 'agent',
                    data: {
                        label: 'Agent',
                        trace: { ...curr, ...next, durationMs: calculateDurationMs(curr, next) },
                    },
                    position: { x, y },
                });
                if (prevNodeId) {
                    edges.push({
                        id: `e-${prevNodeId}-${agentNodeId}`,
                        source: prevNodeId,
                        target: agentNodeId,
                        label: '',
                        animated: true,
                        markerEnd: { type: MarkerType.ArrowClosed },
                    });
                }
                prevNodeId = agentNodeId;
                y -= 150;
                i += 2;
                continue;
            }
            // Single event node
            const nodeType = curr.event && curr.event.includes('tool') ? 'tool' : 'agent';
            const nodeIdStr = `node_${nodeId++}`;
            nodes.push({
                id: nodeIdStr,
                type: nodeType,
                data: {
                    label: curr.event,
                    trace: curr,
                },
                position: { x, y },
            });
            if (prevNodeId) {
                edges.push({
                    id: `e-${prevNodeId}-${nodeIdStr}`,
                    source: prevNodeId,
                    target: nodeIdStr,
                    label: '',
                    animated: true,
                    markerEnd: { type: MarkerType.ArrowClosed },
                });
            }
            prevNodeId = nodeIdStr;
            y -= 150;
            i++;
        }
        return { nodes, edges };
    }

    // Handler for node click
    const handleNodeClick = (_event: any, node: Node) => {
        emitter.emit('ShowNode', node.data?.trace);
        focusNode(node.id);
    };

    // Focus camera on a node by id
    const focusNode = (nodeId: string) => {
        if (!reactFlowInstance) return;
        const node = reactFlowInstance.getNode(nodeId);
        if (node) {
            // Offset x by +300px to account for sidebar
            const x = node.position.x + (node.width || 0) / 2 + 300;
            const y = node.position.y + (node.height || 0) / 2;
            reactFlowInstance.setCenter(x, y, { zoom: 1.2, duration: 500 });
        }
    };


    // Focus the most center node in the current flow
    const focusCenterNode = () => {
        if (!reactFlowInstance) return;
        const nodes = reactFlowInstance.getNodes();
        if (!nodes.length) return;
        // Compute average x/y
        const avgX = nodes.reduce((sum, n) => sum + n.position.x, 0) / nodes.length;
        const avgY = nodes.reduce((sum, n) => sum + n.position.y, 0) / nodes.length;
        // Find node closest to center
        let minDist = Infinity;
        let centerNode = nodes[0];
        for (const n of nodes) {
            const dx = n.position.x - avgX;
            const dy = n.position.y - avgY;
            const dist = dx * dx + dy * dy;
            if (dist < minDist) {
                minDist = dist;
                centerNode = n;
            }
        }
        focusNode(centerNode.id);
    };

    // Listen for ShowNode event to autofocus
    useEffect(() => {
        const handler = (trace: any) => {
            if (!trace) return;
            if (!reactFlowInstance) return;
            const nodes = reactFlowInstance.getNodes();
            let found = nodes.find(n => n.data?.trace?.message_id && trace.message_id && n.data.trace.message_id === trace.message_id);
            if (!found && trace.event && trace.ts) {
                found = nodes.find(n => n.data?.trace?.event === trace.event && n.data?.trace?.ts === trace.ts);
            }
            if (found) {
                focusNode(found.id);
            }
        };
        emitter.on('ShowNode', handler);
        return () => emitter.off('ShowNode', handler);
    }, [reactFlowInstance]);

    // Focus center node when new external flow is received
    useEffect(() => {
        if (selectedChainIdx === -1 && externalNodes.length > 0 && reactFlowInstance) {
            setTimeout(() => focusCenterNode(), 300);
        }
    }, [externalNodes, selectedChainIdx, reactFlowInstance]);

    // Focus center node when dropdown entry is changed
    useEffect(() => {
        if (allNodes.length > 0 && reactFlowInstance) {
            setTimeout(() => focusCenterNode(), 300);
        }
    }, [selectedChainIdx, allNodes, reactFlowInstance]);
    // Use a key to force ReactFlow to re-mount when switching between chains and new request
    const flowKey = selectedChainIdx === -1 ? 'external' : `chain-${selectedChainIdx}`;
    // Compute dropdown options and value
    const hasExternal = externalTraces && externalTraces.length > 0;
    const dropdownOptions = [
        ...(hasExternal ? [{ label: 'New Request', value: -1 }] : []),
        ...chains.map((chain, idx) => ({ label: `Chain ${idx + 1} (${chain.start} - ${chain.end})`, value: idx })),
    ];
    // Ensure value is always valid
    const dropdownValue = dropdownOptions.some(opt => opt.value === selectedChainIdx)
        ? selectedChainIdx
        : (hasExternal ? -1 : (chains.length > 0 ? 0 : ''));

    return (
        <div ref={reactFlowWrapper} style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
            <ReactFlow
                key={flowKey}
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                style={{ width: "100vw", height: "100vh" }}
                onNodeClick={handleNodeClick}
                onInit={setReactFlowInstance}
            >
                <Background />
            </ReactFlow>
            {/* Button group and chain dropdown at the top left using Material UI */}
            <div
                style={{
                    position: "absolute",
                    top: 24,
                    left: 32,
                    display: "flex",
                    gap: 8,
                    zIndex: 100,
                    alignItems: 'center',
                }}
            >
                <IconButton color="warning" sx={{ background: 'white', color: 'black', }} onClick={handleStepBackward}>
                    <SkipPreviousIcon />
                </IconButton>
                <IconButton color="primary" sx={{ background: 'white', color: 'black', }}>
                    <PlayArrowIcon />
                </IconButton>
                <IconButton color="error" sx={{ background: 'white', color: 'black', }}>
                    <StopIcon />
                </IconButton>
                <IconButton color="success" sx={{ background: 'white', color: 'black', }} onClick={handleStepForward}>
                    <SkipNextIcon />
                </IconButton>
                {dropdownOptions.length > 1 && (
                    <Select
                        value={dropdownValue}
                        onChange={e => setSelectedChainIdx(Number(e.target.value))}
                        size="small"
                        sx={{ minWidth: 120, background: 'white', ml: 2 }}
                    >
                        {dropdownOptions.map(opt => (
                            <MenuItem key={opt.value} value={opt.value} sx={opt.value === -1 ? { fontWeight: 700, color: '#2563eb' } : {}}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </Select>
                )}
            </div>
        </div>
    );
}
