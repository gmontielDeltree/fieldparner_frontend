import React, { useState } from "react";
import { Button, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { styled } from "@mui/material/styles";
import { useAppDispatch } from "../../../../../hooks";
import { uiOpenModal } from "../../../../../redux/ui";
import { DisplayModals } from "../../../../../types";
import { LaborOrderModal } from "../../../../";
import { useTranslation } from "react-i18next";

const GlossyButton = styled(Button)(({ theme }) => ({
  borderRadius: "20px",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  padding: "10px 20px",
  color: theme.palette.getContrastText(theme.palette.background.paper),
  background:
    "linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.2))",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(12px)",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)"
  },
  "&.Mui-disabled": {
    color: theme.palette.action.disabled,
    background:
      "linear-gradient(135deg, rgba(200, 200, 200, 0.5), rgba(200, 200, 200, 0.2))",
    boxShadow: "none"
  }
}));

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
    <>
      <LaborOrderModal key="order-modal" activity={activity} fieldName={fieldName} />
      <GlossyButton
        key="withdrawal-order"
        variant="contained"
        sx={{ mr: 2 }}
        startIcon={<ExitToAppIcon />}
        onClick={() => dispatch(uiOpenModal(DisplayModals.LaborOrder))}
      >
        {t('withdrawalOrder')}
      </GlossyButton>

      <GlossyButton
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={() => handleDownloadPDF(activity)}
        sx={{ mr: 2 }}
      >
        {t('downloadWorkOrder')}
      </GlossyButton>

      <Tooltip
        title={tooltipTitle}
        placement="top"
        disableHoverListener={!executionConfirmed}
      >
        <span>
          <GlossyButton
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleExecutionClick(activity)}
            disabled={executionConfirmed}
          >
            {t('confirmExecution')}
          </GlossyButton>
        </span>
      </Tooltip>
    </>
  );
}

export default LaborOrderContent;