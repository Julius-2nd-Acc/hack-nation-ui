import React, { useState, useEffect } from 'react';
import emitter from '../../lib/emitter';
import { Drawer, IconButton, Button, Divider, Tabs, Tab, Box, Collapse, Grid } from '@mui/material';
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
    const [paramsOpen, setParamsOpen] = useState(false);

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
                            width: '420px',
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
                                    {/* Example messages, replace with dynamic content as needed */}
                                    <Box sx={{ mb: 1, textAlign: 'left' }}>
                                        <Box sx={{ display: 'inline-block', bgcolor: '#2563eb', color: '#fff', px: 2, py: 1, borderRadius: 2, fontSize: 14 }}>
                                            Hello! How can I help you?
                                        </Box>
                                    </Box>
                                    <Box sx={{ mb: 1, textAlign: 'right' }}>
                                        <Box sx={{ display: 'inline-block', bgcolor: '#e0e7ff', color: '#222', px: 2, py: 1, borderRadius: 2, fontSize: 14 }}>
                                            Can you show me the trace?
                                        </Box>
                                    </Box>
                                </Box>
                                {/* Input and send button */}
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', p: 1, bgcolor: '#fff', borderRadius: 2 }}>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #e0e7ff', fontSize: 15 }}
                                    />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        sx={{ minWidth: 0, px: 2, py: 1, borderRadius: 2, fontWeight: 600 }}
                                    >
                                        Send
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
                                            <label style={{ fontWeight: 600, color: '#222', fontSize: 15 }}>Parameters</label>
                                            {renderParams(traceInfo.params)}
                                            <label style={{ fontWeight: 600, color: '#222', fontSize: 15 }}>Input Data</label>

                                            {renderScrollableField('Input', traceInfo.input || (traceInfo.inputs && traceInfo.inputs.input))}
                                            {renderField('Tool', traceInfo.tool)}
                                            {renderScrollableField('Prompts', traceInfo.prompts && traceInfo.prompts.join('\n'))}

                                            {renderField('Duration (ms)', traceInfo.durationMs)}
                                        </Box>
                                        <Divider />

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
                        <Divider sx={{ margin: '8px 0' }} />
                    </div>
                </Drawer>
            </div>
        </div>
    );
};

export default Sidebar;

