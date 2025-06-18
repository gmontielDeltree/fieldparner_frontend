import React, { useState } from 'react'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Chip,
    Box,
    Typography,
} from '@mui/material'
import { Lock, LockOpen } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'

interface PlanificationStatusButtonProps {
    isOpen: boolean
    onStatusChange: (newStatus: boolean) => void
    disabled?: boolean
}

const PlanificationStatusButton: React.FC<PlanificationStatusButtonProps> = ({
    isOpen,
    onStatusChange,
    disabled = false,
}) => {
    const { t } = useTranslation()
    const [confirmDialog, setConfirmDialog] = useState(false)

    const handleStatusToggle = () => {
        if (isOpen) {
            // Si está abierta, mostrar confirmación para cerrar
            setConfirmDialog(true)
        } else {
            // Si está cerrada, no se puede abrir de nuevo
            // Mostrar mensaje informativo
            alert(t('Una planificación cerrada no puede ser reabierta'))
        }
    }

    const handleConfirmClose = () => {
        onStatusChange(false) // Cerrar planificación
        setConfirmDialog(false)
    }

    const handleCancelClose = () => {
        setConfirmDialog(false)
    }

    return (
        <Box>
            <Chip
                icon={isOpen ? <LockOpen /> : <Lock />}
                label={isOpen ? t('Abierta') : t('Cerrada')}
                color={isOpen ? 'success' : 'error'}
                onClick={disabled ? undefined : handleStatusToggle}
                sx={{
                    cursor: disabled ? 'default' : 'pointer',
                    opacity: disabled ? 0.6 : 1
                }}
            />

            {/* Dialog de confirmación para cerrar */}
            <Dialog
                open={confirmDialog}
                onClose={handleCancelClose}
                aria-labelledby="confirm-close-dialog-title"
                aria-describedby="confirm-close-dialog-description"
            >
                <DialogTitle id="confirm-close-dialog-title">
                    {t('Cerrar Planificación')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-close-dialog-description">
                        {t('¿Está seguro que desea cerrar esta planificación? Una vez cerrada no podrá ser modificada.')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelClose} color="primary">
                        {t('Cancelar')}
                    </Button>
                    <Button onClick={handleConfirmClose} color="error" variant="contained">
                        {t('Cerrar Planificación')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default PlanificationStatusButton 