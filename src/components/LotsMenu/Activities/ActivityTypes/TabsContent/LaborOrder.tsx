import React, { useState } from "react";
import { Button, Tooltip } from "@mui/material"; // Import Tooltip here
import DownloadIcon from "@mui/icons-material/Download";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { styled } from "@mui/material/styles";
import { useAppDispatch } from "../../../../../hooks";
import { uiOpenModal } from "../../../../../redux/ui";
import { DisplayModals } from "../../../../../types";
import { LaborOrderModal } from "../../../../";

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
  const { activity, handleDownloadPDF, handleConfirmExecution } = props;
  const [executionConfirmed, setExecutionConfirmed] = useState(
    activity.estado === "completada" || activity.estado === "ejecutada"
  );

  const dispatch = useAppDispatch();

  const handleExecutionClick = (activity) => {
    handleConfirmExecution(activity);
    activity.estado = "ejecutada";
    setExecutionConfirmed(true);
  };

  // Determine the tooltip message based on the activity status
  const tooltipTitle = executionConfirmed
    ? `La ejecución ya esta en estado ${activity.estado}`
    : "";

  return (
    <>
      <LaborOrderModal key="order-modal" activity={activity} />
      <GlossyButton
        key="withdrawal-order"
        variant="contained"
        sx={{ mr: 2 }}
        startIcon={<ExitToAppIcon />}
        onClick={() => dispatch(uiOpenModal(DisplayModals.LaborOrder))}
      >
        Orden de Retiro
      </GlossyButton>

      <GlossyButton
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={() => handleDownloadPDF(activity)}
        sx={{ mr: 2 }}
      >
        Descargar Orden De Trabajo
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
            Confirmar Ejecucion
          </GlossyButton>
        </span>
      </Tooltip>
    </>
  );
}

export default LaborOrderContent;
