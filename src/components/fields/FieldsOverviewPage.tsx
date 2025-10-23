import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Paper, Typography, Chip, Divider, IconButton, Tooltip, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import MapIcon from '@mui/icons-material/Map';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import { activitiesService } from '../../services/activitiesService';
import { fieldsService, Field } from '../../services/fieldsService';

const KPI: React.FC<{ label: string; value: string | number; color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' }> = ({ label, value, color = 'default' }) => (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h5" sx={{ mt: 0.5 }}>
            {value}
        </Typography>
    </Paper>
);

export const FieldsOverviewPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [fields, setFields] = useState<Field[]>([]);
    const [selectedFieldId, setSelectedFieldId] = useState<string>('');
    const [zafras, setZafras] = useState<string[]>([]);
    const [selectedZafra, setSelectedZafra] = useState<string>('');
    const [kpis, setKpis] = useState({ disponibles: 0, comprometidos: 0, entregados: 0, rendimiento: 0 });

    const selectedField = useMemo(() => fields.find(f => f._id === selectedFieldId) || null, [fields, selectedFieldId]);

    const load = async () => {
        setLoading(true);
        try {
            const fs = await fieldsService.getAllFields();
            setFields(fs);
            if (!selectedFieldId && fs.length) setSelectedFieldId(fs[0]._id);
            // TODO: traer zafras reales por campaña; por ahora placeholder vacío
            setZafras([]);
            setSelectedZafra('');
            // KPIs placeholder (se pueden enriquecer con cropStockControl)
            setKpis({ disponibles: 0, comprometidos: 0, entregados: 0, rendimiento: 0 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h4">Campos</Typography>
                <Box>
                    <Tooltip title="Actualizar">
                        <IconButton onClick={load}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Campo/Lote</InputLabel>
                            <Select label="Campo/Lote" value={selectedFieldId} onChange={(e) => setSelectedFieldId(e.target.value)}>
                                {fields.map(f => (
                                    <MenuItem key={f._id} value={f._id}>{f.campo_nombre ? `${f.campo_nombre} - ${f.nombre}` : f.nombre}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Zafra</InputLabel>
                            <Select label="Zafra" value={selectedZafra} onChange={(e) => setSelectedZafra(e.target.value)}>
                                <MenuItem value="">Todas</MenuItem>
                                {zafras.map(z => (<MenuItem key={z} value={z}>{z}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={3}><KPI label="Disponible (kg)" value={kpis.disponibles} color="primary" /></Grid>
                <Grid item xs={12} sm={6} md={3}><KPI label="Comprometido (kg)" value={kpis.comprometidos} color="warning" /></Grid>
                <Grid item xs={12} sm={6} md={3}><KPI label="Entregado (kg)" value={kpis.entregados} color="success" /></Grid>
                <Grid item xs={12} sm={6} md={3}><KPI label="Rendimiento (kg/ha)" value={kpis.rendimiento} color="secondary" /></Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 360, borderRadius: 2 }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="h6"><MapIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Mapa</Typography>
                            <Chip size="small" label={selectedField?.nombre || '-'} />
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: 280, bgcolor: '#f7f7f7', borderRadius: 2, color: '#777' }}>
                            {/* Placeholder visual elegante para el mapa */}
                            <Typography variant="body2">Mapa no disponible</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 360, borderRadius: 2 }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="h6"><BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Rendimientos por zafra</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Box display="flex" alignItems="center" justifyContent="center" sx={{ height: 280, bgcolor: '#f7f7f7', borderRadius: 2, color: '#777' }}>
                            <Typography variant="body2">Gráfico no disponible</Typography>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="h6"><TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Timeline de actividades</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ color: '#777' }}>
                            {/* Se puede listar próximas y últimas actividades resumidas del activitiesService */}
                            <Typography variant="body2">Próximamente: actividades planificadas y recientes por campo/zafra.</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default FieldsOverviewPage;



