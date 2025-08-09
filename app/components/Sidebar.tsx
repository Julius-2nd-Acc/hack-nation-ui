import React, { useState } from 'react';
import { Drawer, IconButton, Button, Divider, Tabs, Tab, Box } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';


/**
 * This is the Sidebar to the right of the canvas.
 * It contains options for saving, loading, and deleting the flow.
 * Any new options should be added here.
 *
 */

const Sidebar: React.FC = () => {
    const [open, setOpen] = useState(true);
    const [tab, setTab] = useState(0);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

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
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0, gap: 2 }}>
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                                    <Box>
                                        <label style={{ fontWeight: 500, color: '#2563eb', fontSize: 13 }}>id</label>
                                        <input
                                            type="text"
                                            value="123456"
                                            readOnly
                                            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #e0e7ff', background: '#f7fafd', marginTop: 4 }}
                                        />
                                    </Box>
                                    <Box>
                                        <label style={{ fontWeight: 500, color: '#2563eb', fontSize: 13 }}>prompt</label>
                                        <input
                                            type="text"
                                            value="What is the weather today?"
                                            readOnly
                                            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #e0e7ff', background: '#f7fafd', marginTop: 4 }}
                                        />
                                    </Box>
                                    <Box>
                                        <label style={{ fontWeight: 500, color: '#2563eb', fontSize: 13 }}>token_consumption</label>
                                        <input
                                            type="text"
                                            value="42"
                                            readOnly
                                            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #e0e7ff', background: '#f7fafd', marginTop: 4 }}
                                        />
                                    </Box>
                                    <Box>
                                        <label style={{ fontWeight: 500, color: '#2563eb', fontSize: 13 }}>temperature</label>
                                        <input
                                            type="text"
                                            value="0.7"
                                            readOnly
                                            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #e0e7ff', background: '#f7fafd', marginTop: 4 }}
                                        />
                                    </Box>
                                </Box>
                                <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 2, mt: 'auto' }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        sx={{ width: '100%', fontWeight: 600 }}
                                    >
                                        Execute
                                    </Button>
                                </Box>
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

