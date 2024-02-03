import React from "react";
import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { styled } from "@mui/material/styles";

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
  }
}));

function LaborOrderContent(props) {
  const { activity, handleDownloadPDF } = props;

  return (
    <>
      <GlossyButton
        variant="contained"
        startIcon={<DownloadIcon />}
        onClick={() => handleDownloadPDF(activity)}
      >
        Descargar Orden
      </GlossyButton>
    </>
  );
}

export default LaborOrderContent;
