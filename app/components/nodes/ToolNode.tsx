// Helper to calculate gradient color for duration (in seconds) and base color (as [r,g,b,a])
function getDurationColor(seconds: number, base: [number, number, number, number]): string {
    // 0s = base, 5s = yellow, 10s = red
    const t = Math.max(0, Math.min(1, seconds / 10));
    let r, g, b, a;
    if (t <= 0.5) {
        // base to yellow (255,255,0)
        const t2 = t / 0.5;
        r = base[0] + (255 - base[0]) * t2;
        g = base[1] + (255 - base[1]) * t2;
        b = base[2] + (0 - base[2]) * t2;
        a = base[3];
    } else {
        // yellow to red (255,255,0) to (255,0,0)
        const t2 = (t - 0.5) / 0.5;
        r = 255;
        g = 255 + (0 - 255) * t2;
        b = 0;
        a = base[3];
    }
    return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
}
import { useState } from "react";

import { Handle, NodeProps, Position } from "reactflow";
import SettingsIcon from '@mui/icons-material/Settings';
import BuildIcon from '@mui/icons-material/Build';

export type ToolNodeData = {
    processing?: boolean; // Optional processing state
    label?: string;
    token?: string;

};

export const nodeStyle = {
    background: '#fff',
    padding: '10px',
    borderRadius: '10px',
    width: '200px',
    minHeight: '100px',
};

function ToolNode(props: NodeProps<ToolNodeData>) {
    const processing = props.data.processing ?? false;
    // Visual aid: color by durationMs (0ms=lightsalmon, 5s=yellow, 10s=red)
    let bg = 'lightsalmon';
    let borderColor = 'rgba(189,124,103)';
    let shadowColor = 'rgba(189,124,103)';
    const duration = (props.data as any)?.trace?.durationMs;
    if (typeof duration === 'number') {
        const seconds = duration / 1000;
        bg = getDurationColor(seconds, [255, 160, 122, 1]);
        borderColor = getDurationColor(seconds, [255, 160, 122, 1]);
        shadowColor = getDurationColor(seconds, [255, 160, 122, 1]);
    }
    return (
        <div style={{
            ...nodeStyle,
            backgroundColor: bg,
            border: processing ? '2px solid red' : `2px solid ${borderColor}`,
            color: 'black',
            boxShadow: `0px 6px 0px 1px ${shadowColor}`,
            position: 'relative',
            textAlign: 'center',
        }}>
            <Handle
                type="source"
                id="source"
                position={Position.Top}
                style={{
                    width: 15,
                    height: 15,
                    backgroundColor: 'transparent', // hide
                    borderColor: 'transparent', // hide
                    position: 'absolute',
                    left: '50%',

                    transform: 'translateX(-50%)',
                }}
            />
            <div style={{ position: 'relative', width: '100%', height: 40, marginBottom: '10px' }}>
                <h3
                    style={{
                        margin: 0,
                        position: 'relative',
                        textAlign: 'center',
                        color: '#333',
                        fontSize: '1.3rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        width: '100%',
                        lineHeight: '40px',
                    }}
                >
                    {props.data.label ?? 'Resource'}
                </h3>

            </div>
            <BuildIcon
                style={{
                    color: 'rgba(0,0,0,0.3)',
                    margin: '5px 0 0 0',
                    position: 'relative',
                    textAlign: 'center',
                    fontSize: '2rem',
                }}
            />
            <Handle
                type="target"
                id="target"
                position={Position.Bottom}
                style={{
                    width: 15,
                    height: 15,
                    backgroundColor: 'transparent', // hide
                    borderColor: 'transparent', // hide
                    position: 'absolute',
                    left: '50%',

                    transform: 'translateX(-50%)',
                }}
            />
        </div>
    );
}

export default ToolNode;