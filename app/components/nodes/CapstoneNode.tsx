
import { useState } from "react";

import { Handle, NodeProps, Position } from "reactflow";
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CloseIcon from '@mui/icons-material/Close';

export type CapstoneNodeData = {
    processing?: boolean;
    label?: string;
    token?: string;
    inputs?: string;
    outputs?: string;
};

export const nodeStyle = {
    background: '#fff',
    padding: '10px',
    borderRadius: '10px',
    width: '200px',
    minHeight: '100px',
};

function CapstoneNode(props: NodeProps<CapstoneNodeData>) {
    const processing = props.data.processing ?? false;
    let bg = 'lightskyblue';
    let borderColor = 'rgba(135, 206, 250, 0.5)'; // lightskyblue with alpha
    let shadowColor = 'rgba(135, 206, 250, 0.5)'; // lightskyblue with alpha
    const duration = (props.data as any)?.trace?.durationMs;

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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', position: 'relative', width: '100%' }}>
                <h3
                    style={{
                        margin: 0,
                        position: 'relative',
                        textAlign: 'center',
                        color: '#333',
                        fontSize: '1.3rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                    }}

                >
                    {props.data.label ?? 'Agent'}
                </h3>

            </div>
            {props.data.label === 'Chain Start' ? (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '5px 0 0 0' }}>
                    <ArrowUpwardIcon style={{ color: 'rgba(0,0,0,0.3)' }} />
                </div>
            ) : (
                <CloseIcon style={{ color: 'rgba(0,0,0,0.3)', margin: '5px 0 0 0' }} />
            )}
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

export default CapstoneNode;