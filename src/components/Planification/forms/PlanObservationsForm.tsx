import React from 'react'
import {
    TextField,
    Typography,
    Paper,
    Grid,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

const Title = styled(Typography)({
    fontSize: '1.5em',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
})

const CustomPaper = styled(Paper)({
    padding: '20px',
    margin: '20px 0',
    backgroundColor: '#f7f7f7',
})

interface PlanObservationsFormProps {
    formData: any
    setFormData: (data: any) => void
}

function PlanObservationsForm({ formData, setFormData }: PlanObservationsFormProps) {
    const { t } = useTranslation()

    const handleObservationsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            observaciones: event.target.value,
        })
    }

    return (
        <CustomPaper elevation={3}>
            <Title>{t('observationsTitle')}</Title>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        {t('observationsDescription')}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={6}
                        label={t('observations')}
                        value={formData?.observaciones || ''}
                        onChange={handleObservationsChange}
                        placeholder={t('observationsDescription')}
                        variant="outlined"
                    />
                </Grid>
            </Grid>
        </CustomPaper>
    )
}

export default PlanObservationsForm 