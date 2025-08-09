
import React from "react";
import ReactFlow, { Background } from "reactflow";
import "reactflow/dist/style.css";
import AgentNode from "./nodes/AgentNode";
import ToolNode from "./nodes/ToolNode";
import ResourceNode from "./nodes/ResourceNode";
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';


const nodeTypes = {
    agent: AgentNode,
    resource: ResourceNode,
    tool: ToolNode,
};

const initialNodes = [
    {
        id: "1",
        type: "agent",
        data: { label: "Agent Node" },
        position: { x: 250, y: 5 },
    },
    {
        id: "2",
        type: "resource",
        data: { label: "Resource Node" },
        position: { x: 100, y: 100 },
    },
    {
        id: "3",
        type: "tool",
        data: { label: "Tool Node" },
        position: { x: 400, y: 200 },
    },
];

const initialEdges = [
    { id: "e1-2", source: "1", target: "2", animated: true },
    { id: "e2-3", source: "2", target: "3" },
];

export default function FlowProvider() {
    return (
        <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
            <ReactFlow nodes={initialNodes} edges={initialEdges} nodeTypes={nodeTypes} fitView style={{ width: "100vw", height: "100vh" }}>
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
                <IconButton color="warning" sx={{ background: 'white', color: 'black', }}>
                    <SkipPreviousIcon />
                </IconButton>
                <IconButton color="primary" sx={{ background: 'white', color: 'black', }}>
                    <PlayArrowIcon />
                </IconButton>
                <IconButton color="error" sx={{ background: 'white', color: 'black', }}>
                    <StopIcon />
                </IconButton>

                <IconButton color="success" sx={{ background: 'white', color: 'black', }}>
                    <SkipNextIcon />
                </IconButton>
            </div>
        </div>
    );
}
