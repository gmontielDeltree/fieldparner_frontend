import React from "react";
import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

function LaborOrderContent() {
  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<DownloadIcon />}
        sx={{
          borderRadius: "20px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          "&:hover": {
            backgroundColor: "secondary.main"
          },
          padding: "10px 20px"
        }}
      >
        Descargar Orden
      </Button>
    </>
  );
}

export default LaborOrderContent;
