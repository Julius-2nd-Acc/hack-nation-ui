import { useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import SettingsIcon from '@mui/icons-material/Settings';

/*
 * AgentNodeData defines the properties for the AgentNode.
 * If you add new properties, also add them to NodeProps with the optional '?' suffix for DraggableSidebar compatibility.
 */
export type CustomNodeData = {

    data: {
        label?: string;
        token?: string;
    };
};

export const nodeStyle = {
    background: '#fff',
    padding: '10px',
    borderRadius: '10px',
    width: '200px',
    minHeight: '100px',
};




function CustomNode(props: NodeProps<CustomNodeData>) {
    const [processing, setProcessing] = useState<boolean>(false);



    return (
        <>
            <Handle type="target" id="target" position={Position.Bottom} style={{ width: 15, height: 15, backgroundColor: 'lightgrey', borderColor: 'black' }} />
            <Handle type="source" id="source" position={Position.Top} style={{ width: 15, height: 15, backgroundColor: 'lightgrey', borderColor: 'black' }} />


            <center>
                <div
                    style={{
                        ...nodeStyle,
                        backgroundColor: 'lightgreen',
                        border: processing ? '2px solid red' : '2px solid darkolivegreen',
                        color: 'black',
                        boxShadow: '0px 6px 0px 1px darkolivegreen',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '10px',
                            position: 'relative',
                            width: '100%',
                        }}
                    >

                        <h3
                            style={{
                                margin: 0,
                                position: 'relative',
                                textAlign: 'center',
                                color: '#333',
                                fontSize: '1.3rem',
                                fontWeight: 'bold',
                            }}
                        >
                            {'Agent'}
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

                    <br />
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
                </div>
            </center>
        </>
    );
}

export default CustomNode;
