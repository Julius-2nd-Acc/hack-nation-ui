import { useState } from "react";

import { Handle, NodeProps, Position } from "reactflow";
import SettingsIcon from '@mui/icons-material/Settings';

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
    return (
        <div style={{ ...nodeStyle, backgroundColor: 'lightsalmon', border: processing ? '2px solid red' : '2px solid rgb(189, 124, 103)', color: 'black', boxShadow: '0px 6px 0px 1px rgb(189, 124, 103)', position: 'relative', textAlign: 'center' }}>
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
                    bottom: -18, // move further out
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
                <div style={{ position: 'absolute', right: 0, top: 0 }}>
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
            >test
            </h4>
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
                    top: -18, // move further out
                    transform: 'translateX(-50%)',
                }}
            />
        </div>
    );
}

export default ToolNode;