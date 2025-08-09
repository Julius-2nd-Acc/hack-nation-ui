import React, { useEffect, useState } from "react";
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
    // Only fetch once on mount
    const { data, error } = trpc.python.traceToFlow.useQuery({}, { staleTime: Infinity, refetchOnMount: false, refetchOnWindowFocus: false });

    useEffect(() => {
        if (error) return; // Do nothing on error
        if (data && data.traces) {
            const { nodes: parsedNodes, edges: parsedEdges } = parseTracesToFlow(data.traces);
            setAllNodes(parsedNodes);
            setAllEdges(parsedEdges);
            setStep(parsedNodes.length);
            setNodes(parsedNodes.slice(0, 1));
            setEdges([]);
        }
    }, [data, error]);

    useEffect(() => {
        // Show up to current step
        // Mark only the last node as processing
        setNodes(
            allNodes.slice(0, step).map((node, idx, arr) => ({
                ...node,
                data: {
                    ...node.data,
                    processing: idx === arr.length - 1,
                },
            }))
        );
        setEdges(
            allEdges.slice(0, Math.max(0, step - 1)).map((edge, idx, arr) => ({
                ...edge,
                animated: idx === arr.length - 1,
                style: idx === arr.length - 1 ? { stroke: 'red', strokeWidth: 3 } : {},
            }))
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
            data: { label: 'Agent (Start)', trace: traces[0] },
            position: { x, y },
        });
        prevNodeId = `agent_start`;
        y += 300;
        while (i < traces.length) {
            const trace = traces[i];
            // 2. Tool node between tool_start and tool_end
            if (trace.event === 'tool_start') {
                const toolNodeId = `tool_${nodeId++}`;
                nodes.push({
                    id: toolNodeId,
                    type: 'tool',
                    data: { label: trace.tool || 'Tool', trace },
                    position: { x, y },
                });
                // Edge for tool_start event
                edges.push({
                    id: `e-${prevNodeId}-${toolNodeId}`,
                    source: prevNodeId!,
                    target: toolNodeId,
                    label: trace.input || '',
                    animated: true,
                    markerEnd: { type: MarkerType.ArrowClosed },
                });
                prevNodeId = toolNodeId;
                y += 300;
                // Find tool_end
                while (i < traces.length && traces[i].event !== 'tool_end') i++;
            }
            // 3. Agent node between llm_start and llm_end
            else if (trace.event === 'llm_start') {
                const agentNodeId = `agent_${nodeId++}`;
                nodes.push({
                    id: agentNodeId,
                    type: 'agent',
                    data: { label: 'Agent', trace },
                    position: { x, y },
                });
                // Edge for llm_start event
                edges.push({
                    id: `e-${prevNodeId}-${agentNodeId}`,
                    source: prevNodeId!,
                    target: agentNodeId,
                    label: trace.prompts && trace.prompts[0] ? trace.prompts[0] : '',
                    animated: true,
                    markerEnd: { type: MarkerType.ArrowClosed },
                });
                prevNodeId = agentNodeId;
                y += 300;
                // Find llm_end
                while (i < traces.length && traces[i].event !== 'llm_end') i++;
            }
            // 4. Edge for every event (label = input field)
            else {
                // Only create edge if not chain_start/chain_end
                if (trace.event !== 'chain_start' && trace.event !== 'chain_end') {
                    const edgeId = `e-${prevNodeId}-event${i}`;
                    const nextNodeId = `event${i}`;
                    nodes.push({
                        id: nextNodeId,
                        type: 'agent',
                        data: { label: trace.event, trace },
                        position: { x, y },
                    });
                    edges.push({
                        id: edgeId,
                        source: prevNodeId!,
                        target: nextNodeId,
                        label: trace.input || '',
                        animated: true,
                        markerEnd: { type: MarkerType.ArrowClosed },
                    });
                    prevNodeId = nextNodeId;
                    y += 150;
                }
            }
            i++;
        }
        // 5. Agent node after chain_end
        nodes.push({
            id: `agent_end`,
            type: 'agent',
            data: { label: 'Agent (End)', trace: traces[traces.length - 1] },
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
    const handleNodeClick = () => {
        emitter.emit('ShowNode');
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
            {/* Button group at the top left using Material UI IconButton */}
            <div
                style={{
                    position: "absolute",
                    top: 24,
                    left: 32,
                    display: "flex",
                    gap: 8,
                    zIndex: 100,
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
            </div>
        </div>
    );
}
