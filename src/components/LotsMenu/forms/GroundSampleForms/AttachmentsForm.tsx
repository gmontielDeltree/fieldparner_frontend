import React, { useState, useCallback } from "react";
import { Paper, Typography, Grid, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useDropzone } from "react-dropzone";

const CustomPaper = styled(Paper)({
  padding: "20px",
  margin: "20px 0",
  backgroundColor: "#f7f7f7"
});

const Title = styled(Typography)({
  fontSize: "1.5em",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "20px"
});

const StyledDropzone = styled("div")(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: "10px",
  padding: "20px",
  textAlign: "center",
  cursor: "pointer",
  color: theme.palette.primary.main,
  transition: "border .3s ease-in-out",
  "&:hover": {
    borderColor: theme.palette.primary.dark
  }
}));

function AttachmentsForm({ formData, setFormData }) {
  const [file, setFile] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const uploadedFile = acceptedFiles[0];
      setFile(uploadedFile);
      // TODO: set the file id in formData here
    },
    [setFormData, formData]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: "image/*", // TODO: change to accept all files
    multiple: false
  });

  return (
    <CustomPaper elevation={3}>
      <Title>Adjuntos</Title>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <StyledDropzone {...getRootProps()}>
            <input {...getInputProps()} />
            <p>
              Arrastra y suelta tus archivos aquí o haz clic para seleccionarlos
            </p>
            {file && (
              <Box mt={2}>
                <Typography variant="body1">
                  Archivo seleccionado: {file.name}
                </Typography>
              </Box>
            )}
          </StyledDropzone>
        </Grid>
      </Grid>
    </CustomPaper>
  );
}

export default AttachmentsForm;
