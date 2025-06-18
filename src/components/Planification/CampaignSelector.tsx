import React, { useState } from 'react'
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    Alert,
    Box,
} from '@mui/material'
import { Warning } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

interface CampaignSelectorProps {
    campaigns: any[]
    selectedCampaignId: string
    currentCampaignId?: string
    onCampaignChange: (campaignId: string) => void
    disabled?: boolean
}

const CampaignSelector: React.FC<CampaignSelectorProps> = ({
    campaigns,
    selectedCampaignId,
    currentCampaignId,
    onCampaignChange,
    disabled = false,
}) => {
    const { t } = useTranslation()
    const [confirmDialog, setConfirmDialog] = useState(false)
    const [pendingCampaignId, setPendingCampaignId] = useState('')

    const handleCampaignSelect = (campaignId: string) => {
        if (campaignId === currentCampaignId) {
            // Es la campaña actual, mostrar advertencia
            setPendingCampaignId(campaignId)
            setConfirmDialog(true)
        } else {
            // No es la campaña actual, cambiar directamente
            onCampaignChange(campaignId)
        }
    }

    const handleConfirmCurrentCampaign = () => {
        onCampaignChange(pendingCampaignId)
        setConfirmDialog(false)
        setPendingCampaignId('')
    }

    const handleCancelSelection = () => {
        setConfirmDialog(false)
        setPendingCampaignId('')
    }

    const getCampaignName = (campaign: any) => {
        return campaign?.nombreComercial || campaign?.name || campaign?.campaignId || 'Campaña sin nombre'
    }

    return (
        <Box>
            <FormControl fullWidth disabled={disabled}>
                <InputLabel id="campaign-select-label">{t('campaign')}</InputLabel>
                <Select
                    labelId="campaign-select-label"
                    value={selectedCampaignId}
                    label={t('campaign')}
                    onChange={(e) => handleCampaignSelect(e.target.value as string)}
                >
                    {campaigns.map((campaign) => (
                        <MenuItem
                            key={campaign._id || campaign.campaignId}
                            value={campaign._id || campaign.campaignId}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getCampaignName(campaign)}
                                {(campaign._id || campaign.campaignId) === currentCampaignId && (
                                    <Alert
                                        severity="info"
                                        icon={<Warning />}
                                        sx={{
                                            padding: '0 8px',
                                            fontSize: '0.75rem',
                                            minHeight: 'auto'
                                        }}
                                    >
                                        {t('Actual')}
                                    </Alert>
                                )}
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Dialog de confirmación para campaña actual */}
            <Dialog
                open={confirmDialog}
                onClose={handleCancelSelection}
                aria-labelledby="confirm-current-campaign-dialog-title"
                aria-describedby="confirm-current-campaign-dialog-description"
            >
                <DialogTitle id="confirm-current-campaign-dialog-title">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Warning color="warning" />
                        {t('Trabajar con Campaña Actual')}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-current-campaign-dialog-description">
                        {t('¿Está seguro que desea trabajar con la campaña en curso? Esto significa que está planificando actividades para la temporada actual.')}
                    </DialogContentText>
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        {t('Trabajar con la campaña actual puede afectar las operaciones en curso. Asegúrese de que esta es la campaña correcta para su planificación.')}
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelSelection} color="primary">
                        {t('Cancelar')}
                    </Button>
                    <Button onClick={handleConfirmCurrentCampaign} color="warning" variant="contained">
                        {t('Continuar con Campaña Actual')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default CampaignSelector 