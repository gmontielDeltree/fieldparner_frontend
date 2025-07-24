import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { TemplateLayout } from '../../components';
import { ValorizationCharts } from '../../components/AnnualPlanValorization/ValorizationCharts';
import { useAnnualPlanValorization } from '../../hooks';

export const ValorizationAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { annualPlanValorizations, getAnnualPlanValorizations, isLoading } = useAnnualPlanValorization();

  useEffect(() => {
    getAnnualPlanValorizations();
  }, []);

  const handleBack = () => {
    navigate('/init/overview/annual-plan-valorization');
  };

  if (isLoading) {
    return (
      <TemplateLayout viewMap={false}>
        <Container>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Container>
      </TemplateLayout>
    );
  }

  return (
    <TemplateLayout viewMap={false}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Box mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mb: 2 }}
          >
            {t("back")}
          </Button>
          
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <AssessmentIcon sx={{ fontSize: 40 }} />
            <Typography variant="h4" fontWeight="bold">
              {t("valorization_analysis")}
            </Typography>
          </Box>
        </Box>

        {annualPlanValorizations.length > 0 ? (
          <ValorizationCharts valorizations={annualPlanValorizations} />
        ) : (
          <Alert severity="info">
            {t("no_valorizations_available_for_analysis")}
          </Alert>
        )}
      </Container>
    </TemplateLayout>
  );
}; 