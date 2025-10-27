import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Container, Grid, Paper, Step, StepLabel, Stepper, Typography, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, FormControl } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Loading } from '../../components';
import { useAppSelector } from '../../hooks/useRedux';
import { useCampaign } from '../../hooks/useCampaign';
import { dbContext } from '../../services/pouchdbService';
import dayjs from 'dayjs';

export const NewCropStockAdjustmentPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAppSelector(s => s.auth);
    const [loading, setLoading] = useState(false);

    const [date, setDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
    const [detail, setDetail] = useState<string>('');
    const [campaignId, setCampaignId] = useState<string>('');
    const [zafra, setZafra] = useState<string>('');
    const [cropId, setCropId] = useState<string>('');
    const [depositId, setDepositId] = useState<string>('');
    const [amount, setAmount] = useState<number>(0);

    const { campaigns, getCampaigns } = useCampaign();
    const [zafras, setZafras] = useState<string[]>([]);
    const [crops, setCrops] = useState<any[]>([]);
    const [deposits, setDeposits] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            if (!user) return;
            setLoading(true);
            try {
                await getCampaigns();
                const [deps, cropsDocs] = await Promise.all([
                    dbContext.deposits.find({ selector: { accountId: user.accountId } }),
                    dbContext.crops.allDocs({ include_docs: true }),
                ]);
                setDeposits(deps.docs);
                setCrops(cropsDocs.rows.map(r => r.doc));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (!campaignId) { setZafras([]); setZafra(''); return; }
        const camp = campaigns.find(c => c._id === campaignId);
        const z = camp?.zafra ? (Array.isArray(camp.zafra) ? camp.zafra : [String(camp.zafra)]) : [];
        setZafras(z);
        if (!z.includes(zafra)) setZafra('');
    }, [campaignId, campaigns]);

    const onSubmit = async () => {
        if (!user) return;
        if (!date || !detail || !campaignId || !cropId || !depositId) return;
        setLoading(true);
        try {
            // CDC: upsert stock físico (puede ser positivo o negativo)
            const cdcFound = await dbContext.cropDeposits.find({
                selector: {
                    accountId: user.accountId,
                    licenceId: user.licenceId,
                    campaignId,
                    zafra,
                    depositId,
                    cropId,
                }
            } as any);
            const now = new Date().toISOString();
            if (cdcFound.docs && cdcFound.docs.length) {
                const doc = cdcFound.docs[0] as any;
                await dbContext.cropDeposits.put({ ...doc, currentStockKg: Number(doc.currentStockKg || 0) + Number(amount), lastUpdate: now });
            } else {
                await dbContext.cropDeposits.post({
                    accountId: user.accountId,
                    licenceId: user.licenceId,
                    campaignId,
                    zafra,
                    depositId,
                    cropId,
                    currentStockKg: Number(amount),
                    reservedStockKg: 0,
                    lastUpdate: now,
                } as any);
            }

            // CSC: upsert agregado currentStock (STKReal)
            const cscFound = await dbContext.cropStockControl.find({
                selector: {
                    accountId: user.accountId,
                    licenceId: user.licenceId,
                    campaignId,
                    cropId,
                    zafra
                }
            } as any);
            if (cscFound.docs && cscFound.docs.length) {
                const doc = cscFound.docs[0] as any;
                await dbContext.cropStockControl.put({ ...doc, currentStock: Number(doc.currentStock || 0) + Number(amount), lastUpdate: now });
            } else {
                await dbContext.cropStockControl.post({ accountId: user.accountId, licenceId: user.licenceId, campaignId, cropId, zafra, currentStock: Number(amount), committedStock: 0, deliveredStock: 0, lastUpdate: now } as any);
            }

            // CMC: registrar movimiento Ajuste E/S
            await dbContext.cropMovements.post({
                accountId: user.accountId,
                licenceId: user.licenceId,
                depositId,
                cropId,
                campaignId,
                zafra,
                fieldId: '',
                lotId: '',
                inOut: Number(amount) >= 0 ? 'E' : 'S',
                date,
                movement: 'Ajuste',
                detail,
                amountKg: Math.abs(Number(amount))
            } as any);

            window.history.back();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth='lg'>
            {loading && <Loading loading />}
            <Paper variant='outlined' sx={{ p: { xs: 2, md: 3 }, mt: 2 }}>
                <Typography component='h2' variant='h4' sx={{ mb: 3 }}>
                    {t('Nuevo Ajuste Stock Cultivos')}
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <TextField label={t('_date')} type='date' fullWidth value={date} onChange={e => setDate(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={8}>
                        <TextField label={t('_reason')} fullWidth value={detail} onChange={e => setDetail(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>{t('_campaign')}</InputLabel>
                            <Select label={t('_campaign')} value={campaignId} onChange={(e: SelectChangeEvent) => setCampaignId(e.target.value)}>
                                {campaigns.map(c => (<MenuItem key={c._id} value={c._id}>{c.campaignId}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Zafra</InputLabel>
                            <Select label='Zafra' value={zafra} onChange={(e: SelectChangeEvent) => setZafra(e.target.value)}>
                                {zafras.map(z => (<MenuItem key={z} value={z}>{z}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>{t('_crop')}</InputLabel>
                            <Select label={t('_crop')} value={cropId} onChange={(e: SelectChangeEvent) => setCropId(e.target.value)}>
                                {crops.map((c: any) => (<MenuItem key={c._id} value={c._id}>{c.descriptionES || c.descriptionEN}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>{t('_warehouse')}</InputLabel>
                            <Select label={t('_warehouse')} value={depositId} onChange={(e: SelectChangeEvent) => setDepositId(e.target.value)}>
                                {deposits.map((d: any) => (<MenuItem key={d._id} value={d._id}>{d.description}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label={t('_quantity')} type='number' fullWidth value={amount} onChange={e => setAmount(Number(e.target.value))} />
                    </Grid>
                    <Grid item xs={12}>
                        <Box display='flex' justifyContent='flex-end' gap={2}>
                            <Button variant='outlined' onClick={() => window.history.back()}>{t('cancel')}</Button>
                            <Button variant='contained' color='success' onClick={onSubmit}>{t('_add')}</Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};


