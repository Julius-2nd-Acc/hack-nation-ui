import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import emitter from '../../lib/emitter';


type StatisticsData = {
    responseTimes: { chain: number; responseTime: number }[];
    criticalNodes: { idx: number; event: string; durationMs: number; trace: any }[];
    avgResponseTime: number;
    totalFlows: number;
    totalNodes: number;
};


const StatisticsTab: React.FC = () => {
    const [stats, setStats] = useState<StatisticsData | null>(null);

    useEffect(() => {
        const handler = (data: any) => {
            setStats(data);
        };
        emitter.on('StatisticsData', handler);
        // Request statistics from FlowProvider on mount
        emitter.emit('RequestStatistics');
        return () => emitter.off('StatisticsData', handler);
    }, []);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Statistics Overview</Typography>
            {stats ? (
                <>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1">Summary</Typography>
                        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 2 }}>
                            <Box>Avg. Response Time: <b>{stats.avgResponseTime} ms</b></Box>
                            <Box>Total Flows: <b>{stats.totalFlows}</b></Box>
                            <Box>Total Nodes: <b>{stats.totalNodes}</b></Box>
                        </Box>
                    </Box>
                    <Box sx={{ height: 240, mb: 4 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>Response Time per Flow</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.responseTimes} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="chain" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="responseTime" stroke="#2563eb" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                    <Box sx={{ height: 240, mb: 4 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>Critical Nodes (&gt;5s)</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.criticalNodes} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="event" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="durationMs" fill="#e57373" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                    {stats.criticalNodes.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2">Critical Node Details</Typography>
                            <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Event</TableCell>
                                            <TableCell>Duration (ms)</TableCell>
                                            <TableCell>Index</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stats.criticalNodes.map((node, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{node.event}</TableCell>
                                                <TableCell>{node.durationMs}</TableCell>
                                                <TableCell>{node.idx}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                </>
            ) : (
                <Box>
                    <Typography variant="body2">No statistics available yet. Showing sample data:</Typography>
                    <Box sx={{ mt: 2, height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Max Response Time', value: 3200 },
                                { name: 'Min Response Time', value: 900 },
                                { name: 'Avg Response Time', value: 1800 },
                                { name: 'Total Requests', value: 12 },
                                // Error Rate as a number for bar chart, or skip if not numeric
                            ]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" fill="#2563eb" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default StatisticsTab;
