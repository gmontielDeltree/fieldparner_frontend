import React, { useState } from "react";
import LotDetailsModal from "./LotDetailsModal";
import { Avatar, ButtonBase, Paper } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

// Import icons for categories
import categoryIcon1 from "../../images/icons/sembradora_act.webp";
import categoryIcon2 from "../../images/icons/pulverizadora_act.webp";
import categoryIcon3 from "../../images/icons/cosechadora_act.webp";
import categoryIcon4 from "../../images/icons/iconodenotas_act.webp";
import categoryIcon5 from "../../images/icons/iconosatelite.webp";
import categoryIcon6 from "../../images/icons/suelo_act.webp";

const LotsMenu = ({ lot, isOpen, toggle }) => {
  const [selectedCategory, setSelectedCategory] = useState("Lot Details");

  const categories = [
    { id: "Lot Details", icon: categoryIcon1 },
    { id: "Category 2", icon: categoryIcon2 },
    { id: "Category 3", icon: categoryIcon3 },
    { id: "Category 4", icon: categoryIcon4 },
    { id: "Category 5", icon: categoryIcon5 },
    { id: "Category 6", icon: categoryIcon6 }
  ];

  const selectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const avatarStyle = (categoryId) => ({
    width: 50,
    height: 50,
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    transform: selectedCategory === categoryId ? "scale(1.2)" : "scale(1)",
    boxShadow:
      selectedCategory === categoryId ? "0 4px 20px rgba(0,0,0,0.2)" : "none",
    borderRadius: "50%",
    margin: "0 15px",
    cursor: "pointer",
    "&:hover": {
      transform: "scale(1.2)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
    }
  });

  // Function to render the selected form component
  const renderFormContent = () => {
    switch (selectedCategory) {
      case "Lot Details":
        return <LotDetailsModal lot={lot} />;
      // Add cases for other categories here
      default:
        return <div>Select a category to view its forms</div>;
    }
  };

  if (!isOpen) return null;

  return (
    <Paper
      elevation={5}
      style={{
        position: "fixed",
        top: "64px",
        height: "calc(100vh - 64px)",
        width: "60vw",
        overflowY: "auto",
        backgroundColor: "#fff",
        padding: "20px",
        zIndex: 1050,
        // borderRadius: "10px",
        boxShadow: "0 6px 15px rgba(0,0,0,0.2)"
      }}
    >
      <div
        style={{
          display: "flex",
          marginBottom: "20px",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div>
          {categories.map(({ id, icon }) => (
            <ButtonBase key={id} onClick={() => selectCategory(id)}>
              <Avatar alt={id} src={icon} sx={avatarStyle(id)} />
            </ButtonBase>
          ))}
        </div>
        <IconButton aria-label="close" onClick={toggle}>
          <CloseIcon />
        </IconButton>
      </div>
      <div>{renderFormContent()}</div>
    </Paper>
  );
};

export default LotsMenu;
