import React from "react";
import { Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

function AttachedContent() {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    console.log(file);
  };

  return (
    <>
      <input
        accept="*/*"
        style={{ display: "none" }}
        id="contained-button-file"
        type="file"
        onChange={handleFileUpload}
      />
      <label htmlFor="contained-button-file">
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUploadIcon />}
          sx={{
            borderRadius: "20px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            "&:hover": {
              backgroundColor: "secondary.main"
            }
          }}
        >
          Subir Archivo
        </Button>
      </label>
    </>
  );
}

export default AttachedContent;
