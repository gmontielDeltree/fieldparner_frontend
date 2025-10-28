import React, { useEffect, useMemo, useState } from 'react';
import { LocalShipping as LocalShippingIcon, Inventory2 as Inventory2Icon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { dbContext } from '../../services/pouchdbService';
import { useAppSelector } from '../../hooks/useRedux';
import { CropMovement } from '../../interfaces/crop-movement';
import { Crop, Deposit, Campaign } from '../../types';
import { GenericListPage } from '../../components';

export const CropStockAdjustmentsListPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAppSelector((s) => s.auth);
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const columns: GridColDef[] = useMemo(() => ([
        { field: 'date', headerName: t('_date'), width: 120 },
        { field: 'campaign', headerName: t('_campaign'), width: 140 },
        { field: 'zafra', headerName: 'Zafra', width: 140 },
        { field: 'crop', headerName: t('_crop'), width: 180 },
        { field: 'deposit', headerName: t('_warehouse'), width: 200 },
        { field: 'type', headerName: t('movement_type'), width: 120 },
        { field: 'movement', headerName: t('_movement'), width: 120 },
        { field: 'detail', headerName: t('detail'), width: 200 },
        { field: 'amountKg', headerName: t('_quantity'), width: 120, type: 'number' },
    ]), [t]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (!user) return;
            const [movs, cropsDocs, depositsDocs, campaignsDocs] = await Promise.all([
                dbContext.cropMovements.find({ selector: { accountId: user.accountId, licenceId: user.licenceId } }),
                dbContext.crops.allDocs({ include_docs: true }),
                dbContext.deposits.find({ selector: { accountId: user.accountId } }),
                dbContext.campaigns.find({ selector: { accountId: user.accountId } }),
            ]);
            const crops = cropsDocs.rows.map(r => r.doc as Crop);
            const deposits = depositsDocs.docs as Deposit[];
            const campaigns = campaignsDocs.docs as Campaign[];
            const data = (movs.docs as CropMovement[]).map((m: any, idx: number) => {
                const crop = crops.find(c => c._id === m.cropId);
                const dep = deposits.find(d => d._id === m.depositId);
                const camp = campaigns.find(ca => ca._id === m.campaignId || ca.campaignId === m.campaignId);
                return {
                    id: m._id || `row-${idx}`,
                    date: (m.date || m.creationDate || '').slice(0, 10),
                    campaign: camp?.campaignId || m.campaignId,
                    zafra: m.zafra || '',
                    crop: crop?.descriptionES || crop?.descriptionEN || m.cropId,
                    deposit: dep?.description || m.depositId,
                    type: m.inOut === 'E' ? t('_income') : t('_outcome'),
                    movement: m.movement || 'Ajuste',
                    detail: m.detail || '',
                    amountKg: m.amountKg,
                };
            });
            setRows(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    return (
        <GenericListPage
            moduleRoute="/init/overview/crop-stock-adjustments"
            data={rows}
            columns={columns}
            getData={loadData}
            deleteData={() => { /* no delete */ }}
            setActiveItem={() => { }}
            newItemPath="/init/overview/crop-stock-adjustments/new"
            editItemPath={(id) => `/init/overview/crop-stock-adjustments/${id}`}
            isLoading={loading}
        />
    );
};


