import { useState } from "react";

import { Handle, NodeProps, Position } from "reactflow";
import SettingsIcon from '@mui/icons-material/Settings';

export type AgentNodeData = {
    processing?: boolean;
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

function AgentNode(props: NodeProps<AgentNodeData>) {
    const processing = props.data.processing ?? false;
    return (
        <div style={{ ...nodeStyle, backgroundColor: 'lightskyblue', border: processing ? '2px solid red' : '2px solid steelblue', color: 'black', boxShadow: '0px 6px 0px 1px steelblue', position: 'relative', textAlign: 'center' }}>
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
                <div style={{ position: 'absolute', right: '0' }}>
                    <SettingsIcon
                        style={{
                            fontSize: 30,
                            animation: processing ? 'spin 1s linear infinite' : 'none',
                            color: processing ? 'red' : 'rgba(0, 0, 0, 0.3)',
                        }}
                    />
                    <style>{`
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
            <h4
                style={{
                    color: 'rgba(0,0,0,0.3)',
                    margin: '5px 0 0 0',
                    position: 'relative',
                    textAlign: 'center',
                    fontWeight: 'bold',
                }}
            >
            </h4>
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

export default AgentNode;