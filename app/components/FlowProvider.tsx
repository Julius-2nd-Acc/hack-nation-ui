// Helper to calculate duration in ms between two traces (using ts field)
function calculateDurationMs(traceA?: Trace, traceB?: Trace): number | undefined {
    if (typeof traceA?.ts === 'number' && typeof traceB?.ts === 'number') {
        return Math.round((traceB.ts - traceA.ts) * 1000);
    }
    return undefined;
}
import React, { useEffect, useState } from "react";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import emitter from "../../lib/emitter";
import ReactFlow, { Background, Node, Edge, MarkerType } from "reactflow";
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


const nodeTypes = {
    agent: AgentNode,
    resource: ResourceNode,
    tool: ToolNode,
};

const initialNodes: Node[] = [
    { id: "agent1", type: "agent", data: { label: "Agent Node 1" }, position: { x: 0, y: 0 } },
    { id: "tool1", type: "tool", data: { label: "Tool Node 1" }, position: { x: 200, y: 150 } },
    { id: "resource1", type: "resource", data: { label: "Resource Node" }, position: { x: -200, y: 300 } },
];

const initialEdges: Edge[] = [
    { id: "e-agent1-tool1", source: "agent1", target: "tool1", animated: true, markerEnd: { type: MarkerType.ArrowClosed }, label: "Agent to Tool" },
    { id: "e-tool1-resource1", source: "tool1", target: "resource1", animated: true, markerEnd: { type: MarkerType.ArrowClosed }, label: "Tool to Resource" },
];

export default function FlowProvider() {
    const [allNodes, setAllNodes] = useState<Node[]>(initialNodes);
    const [allEdges, setAllEdges] = useState<Edge[]>(initialEdges);
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);
    const [step, setStep] = useState<number>(initialNodes.length);
    const [chains, setChains] = useState<{ start: number, end: number }[]>([]);
    const [selectedChainIdx, setSelectedChainIdx] = useState<number>(0);
    // Only fetch once on mount
    const { data, error } = trpc.python.traceToFlow.useQuery({}, { staleTime: Infinity, refetchOnMount: false, refetchOnWindowFocus: false });

    // Parse chains from traces
    useEffect(() => {
        if (error) return;
        if (data && data.traces) {
            // Find all chain_start and chain_end indices
            const starts: number[] = [];
            const ends: number[] = [];
            data.traces.forEach((t, idx) => {
                if (t.event === 'chain_start') starts.push(idx);
                if (t.event === 'chain_end') ends.push(idx);
            });
            // Pair up starts and ends (assume order is correct)
            const chainPairs: { start: number, end: number }[] = [];
            for (let i = 0; i < Math.min(starts.length, ends.length); i++) {
                if (starts[i] <= ends[i]) {
                    chainPairs.push({ start: starts[i], end: ends[i] });
                }
            }
            setChains(chainPairs);
            // Default to most recent (last) chain
            setSelectedChainIdx(chainPairs.length > 0 ? chainPairs.length - 1 : 0);
        }
    }, [data, error]);

    // Parse nodes/edges for selected chain
    useEffect(() => {
        if (error) return;
        if (data && data.traces && chains.length > 0) {
            const { start, end } = chains[selectedChainIdx] || chains[0];
            const tracesForChain = data.traces.slice(start, end + 1);
            const { nodes: parsedNodes, edges: parsedEdges } = parseTracesToFlow(tracesForChain);
            setAllNodes(parsedNodes);
            setAllEdges(parsedEdges);
            setStep(parsedNodes.length);
            setNodes(parsedNodes.slice(0, 1));
            setEdges([]);
        }
    }, [data, error, chains, selectedChainIdx]);

    useEffect(() => {
        // Show up to current step
        const visibleNodes = allNodes.slice(0, step);
        const lastNode = visibleNodes[visibleNodes.length - 1];
        const isEndStep = lastNode?.id === 'agent_end';
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
        // 1. Agent node before chain_start
        nodes.push({
            id: `agent_start`,
            type: 'agent',
            data: {
                label: 'Agent (Start)',
                trace: {
                    ...(traces[0] || {}),
                    ...(traces[1] || {}),
                    durationMs: calculateDurationMs(traces[0], traces[1]),
                },
            },
            position: { x, y },
        });
        prevNodeId = `agent_start`;
        y -= 150;
        while (i < traces.length - 1) {
            const traceA = traces[i];
            const traceB = traces[i + 1];
            // 2. Tool node between tool_start and tool_end
            if (traceA.event === 'tool_start' && traceB.event === 'tool_end') {
                const toolNodeId = `tool_${nodeId++}`;
                nodes.push({
                    id: toolNodeId,
                    type: 'tool',
                    data: {
                        label: traceA.tool || 'Tool',
                        trace: {
                            ...traceA,
                            ...traceB,
                            durationMs: calculateDurationMs(traceA, traceB),
                        },
                    },
                    position: { x: x + 300, y },
                });
                edges.push({
                    id: `e-${prevNodeId}-${toolNodeId}`,
                    source: prevNodeId!,
                    target: toolNodeId,
                    label: '',
                    animated: true,
                    markerEnd: { type: MarkerType.ArrowClosed },
                });
                prevNodeId = toolNodeId;
                y -= 150;
                i += 2;
                continue;
            }
            // 3. Agent node between llm_start and llm_end
            if (traceA.event === 'llm_start' && traceB.event === 'llm_end') {
                const agentNodeId = `agent_${nodeId++}`;
                nodes.push({
                    id: agentNodeId,
                    type: 'agent',
                    data: {
                        label: 'Agent',
                        trace: {
                            ...traceA,
                            ...traceB,
                            durationMs: calculateDurationMs(traceA, traceB),
                        },
                    },
                    position: { x, y },
                });
                edges.push({
                    id: `e-${prevNodeId}-${agentNodeId}`,
                    source: prevNodeId!,
                    target: agentNodeId,
                    label: '',
                    animated: true,
                    markerEnd: { type: MarkerType.ArrowClosed },
                });
                prevNodeId = agentNodeId;
                y -= 150;
                i += 2;
                continue;
            }
            // 4. Edge for every event (label = input field)
            const edgeId = `e-${prevNodeId}-event${i}`;
            const nextNodeId = `event${i}`;
            nodes.push({
                id: nextNodeId,
                type: 'agent',
                data: {
                    label: traceA.event,
                    trace: {
                        ...traceA,
                        ...traceB,
                        durationMs: calculateDurationMs(traceA, traceB),
                    },
                },
                position: { x, y },
            });
            edges.push({
                id: edgeId,
                source: prevNodeId!,
                target: nextNodeId,
                label: "",
                animated: true,
                markerEnd: { type: MarkerType.ArrowClosed },
            });
            prevNodeId = nextNodeId;
            y -= 150;
            i += 1;
        }
        // 5. Agent node after chain_end
        nodes.push({
            id: `agent_end`,
            type: 'agent',
            data: {
                label: 'Agent (End)',
                trace: {
                    ...(traces[traces.length - 2] || {}),
                    ...(traces[traces.length - 1] || {}),
                    durationMs: calculateDurationMs(traces[traces.length - 2], traces[traces.length - 1]),
                },
            },
            position: { x, y },
        });
        edges.push({
            id: `e-${prevNodeId}-agent_end`,
            source: prevNodeId!,
            target: 'agent_end',
            label: '',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
        });
        return { nodes, edges };
    }

    // Handler for node click
    const handleNodeClick = (_event: any, node: Node) => {
        emitter.emit('ShowNode', node.data?.trace);
    };
    return (
        <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                style={{ width: "100vw", height: "100vh" }}
                onNodeClick={handleNodeClick}
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
                {/* Dropdown for chain selection */}
                {chains.length > 1 && (
                    <Select
                        value={selectedChainIdx}
                        onChange={e => setSelectedChainIdx(Number(e.target.value))}
                        size="small"
                        sx={{ minWidth: 120, background: 'white', ml: 2 }}
                    >
                        {chains.map((chain, idx) => (
                            <MenuItem key={idx} value={idx}>
                                {`Chain ${idx + 1} (${chain.start} - ${chain.end})`}
                            </MenuItem>
                        ))}
                    </Select>
                )}
            </div>
        </div>
    );
}
