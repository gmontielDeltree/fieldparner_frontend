import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Tooltip,
  Avatar,
  Paper,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import VerifiedIcon from "@mui/icons-material/Verified";
import { styled, alpha } from "@mui/material/styles";
import { useAppDispatch } from "../../../../../hooks";
import { uiOpenModal } from "../../../../../redux/ui";
import { DisplayModals } from "../../../../../types";
import { LaborOrderModal } from "../../../../";
import { useTranslation } from "react-i18next";

// ─── Styled Components (matching Planification design) ──────────────

const ActionCard = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  boxShadow: 'rgba(145, 158, 171, 0.16) 0px 1px 2px 0px, rgba(145, 158, 171, 0.12) 0px 8px 16px -4px',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
}));

const ActionCardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(2, 2.5),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
}));

const SectionIcon = styled(Avatar)(({ theme }) => ({
  width: 34,
  height: 34,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  "& .MuiSvgIcon-root": {
    fontSize: "1.15rem",
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.9rem',
  color: theme.palette.text.primary,
  letterSpacing: '-0.01em',
}));

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
  padding: theme.spacing(2.5),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '10px 20px',
  fontWeight: 600,
  fontSize: '0.82rem',
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  "&:hover": {
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
    transform: 'translateY(-1px)',
  },
}));

const OutlinedActionButton = styled(StyledButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    borderColor: theme.palette.primary.main,
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
}));

const SuccessActionButton = styled(StyledButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.success.main, 0.08),
  color: theme.palette.success.dark,
  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
  "&:hover": {
    backgroundColor: alpha(theme.palette.success.main, 0.14),
    borderColor: theme.palette.success.main,
    boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.15)}`,
  },
  "&.Mui-disabled": {
    backgroundColor: alpha(theme.palette.grey[400], 0.08),
    color: theme.palette.text.disabled,
    borderColor: alpha(theme.palette.grey[400], 0.2),
  },
}));

const CompletedBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  padding: theme.spacing(0.5, 1.5),
  borderRadius: '8px',
  backgroundColor: alpha(theme.palette.success.main, 0.08),
  color: theme.palette.success.dark,
  fontSize: '0.78rem',
  fontWeight: 600,
  marginLeft: 'auto',
}));

// ─── Component ──────────────────────────────────────────────────────

function LaborOrderContent(props) {
  const { activity, fieldName, handleDownloadPDF, handleConfirmExecution } = props;
  const [executionConfirmed, setExecutionConfirmed] = useState(
    activity.estado === "completada" || activity.estado === "ejecutada"
  );
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleExecutionClick = (activity) => {
    handleConfirmExecution(activity);
    activity.estado = "ejecutada";
    setExecutionConfirmed(true);
  };

  const tooltipTitle = executionConfirmed
    ? `${t('executionAlreadyInState')} ${activity.estado}`
    : "";

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <LaborOrderModal key="order-modal" activity={activity} fieldName={fieldName} />

      <ActionCard elevation={0}>
        <ActionCardHeader>
          <SectionIcon><DescriptionIcon /></SectionIcon>
          <SectionTitle>{t('workOrder')}</SectionTitle>
          {executionConfirmed && (
            <CompletedBadge>
              <VerifiedIcon sx={{ fontSize: '0.9rem' }} />
              {activity.estado}
            </CompletedBadge>
          )}
        </ActionCardHeader>

        <ActionsContainer>
          <OutlinedActionButton
            startIcon={<ExitToAppIcon sx={{ fontSize: '1.1rem !important' }} />}
            onClick={() => dispatch(uiOpenModal(DisplayModals.LaborOrder))}
          >
            {t('withdrawalOrder')}
          </OutlinedActionButton>

          <OutlinedActionButton
            startIcon={<DownloadIcon sx={{ fontSize: '1.1rem !important' }} />}
            onClick={() => handleDownloadPDF(activity)}
          >
            {t('downloadWorkOrder')}
          </OutlinedActionButton>

          <Tooltip
            title={tooltipTitle}
            placement="top"
            disableHoverListener={!executionConfirmed}
          >
            <span>
              <SuccessActionButton
                startIcon={<CheckCircleIcon sx={{ fontSize: '1.1rem !important' }} />}
                onClick={() => handleExecutionClick(activity)}
                disabled={executionConfirmed}
              >
                {t('confirmExecution')}
              </SuccessActionButton>
            </span>
          </Tooltip>
        </ActionsContainer>
      </ActionCard>
    </Box>
  );
}

export default LaborOrderContent;
