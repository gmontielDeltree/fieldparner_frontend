import React from "react";
import NewField from "../components/NewField";
import { Box } from "@mui/material";
import NewField2 from "../components/NewField/NewFields2";
import { useNavigate } from "react-router-dom";




const NewFieldPage = () => {
  const navigate = useNavigate();
  const handleSaveGeometry = (data) => {
   console.log("Save data",data)
  };

  const handleCloseNewField = () => {
    navigate(-1);
  };
  return (
    <Box>
      <NewField2
        saveGeometry={handleSaveGeometry}
        onClose={handleCloseNewField}
      />
    </Box>
  );
};

export default NewFieldPage;
