import React, { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Typography, Divider, Chip, MenuItem, Menu } from "@mui/material";
import { useDispatch } from "react-redux";
import { hideFieldList } from "../../redux/fieldsList";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

import MoreVertIcon from "@mui/icons-material/MoreVert";

const FieldsSideMenu = ({ open, fields, onSelectField, onSelectLot }) => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [currentField, setCurrentField] = React.useState(null);
  const [pdfContent, setPdfContent] = React.useState("");

  const handleClose = () => {
    dispatch(hideFieldList());
    setAnchorEl(null);
  };

  const handleFieldSelect = (field) => {
    onSelectField(field);
    handleClose();
  };

  const handleClick = (event, field) => {
    setAnchorEl(event.currentTarget);
    setCurrentField(field);
  };

  const handleExport = (format) => {
    if (format === "PDF" && currentField) {
      exportFieldToPDF(currentField);
    } else if (format === "XLSX" && currentField) {
      exportFieldToXLSX(currentField);
    }
    handleClose();
  };
  useEffect(() => {
    if (pdfContent) {
      const input = document.getElementById("pdf-content");
      html2canvas(input)
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "pt", "a4");
          pdf.addImage(imgData, "PNG", 0, 0);
          pdf.save(`Field_${currentField?.nombre}.pdf`);
          setPdfContent("");
        })
        .catch((err) => console.error("Error exporting PDF: ", err));
    }
  }, [pdfContent]);

  const exportFieldToPDF = (field) => {
    const input = document.body;
    html2canvas(input, { scale: 1 })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: "a4"
        });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Field_${field.nombre}.pdf`);
      })
      .catch((err) => console.error("Error exporting PDF: ", err));
  };

  const exportFieldToXLSX = (field) => {
    const wb = XLSX.utils.book_new();
    const wsName = "Field Data";

    const data = [
      ["Field Name", field.nombre],
      ["Field ID", field._id],
      ["Hectares", field.campo_geojson.properties.hectareas],
      ["UUID", field.uuid],
      ["", ""],
      ["Lots", "Hectares"]
    ];

    field.lotes.forEach((lot) => {
      data.push([lot.properties.nombre, lot.properties.hectareas]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, wsName);

    XLSX.writeFile(wb, `Field_${field.nombre}.xlsx`);
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={handleClose}
      sx={{
        width: "40%",
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: "40%",
          boxSizing: "border-box"
        }
      }}
    >
      <div style={{ display: "none" }} id="pdf-content">
        {pdfContent && <div dangerouslySetInnerHTML={{ __html: pdfContent }} />}
      </div>
      <Box
        sx={{
          width: "100%",
          padding: "10px 15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e0e0e0"
        }}
      >
        <Typography variant="h6" noWrap>
          Listado de campos
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List sx={{ width: "100%" }}>
        {fields.map((field, index) => (
          <React.Fragment key={index}>
            <ListItem button onClick={() => handleFieldSelect(field)}>
              <ListItemText
                primary={
                  <Typography variant="subtitle1">{field.nombre}</Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="textSecondary">
                      Hectáreas:{" "}
                      {field.campo_geojson.properties.hectareas.toFixed(2)}
                    </Typography>
                    {field.lotes.map((lote, idx) => (
                      <Chip
                        key={idx}
                        label={`${
                          lote.properties.nombre
                        }: ${lote.properties.hectareas.toFixed(2)} ha`}
                        size="small"
                        variant="outlined"
                        sx={{ margin: "2px" }}
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectLot(lote, field);
                        }}
                      />
                    ))}
                  </>
                }
              />
              <IconButton
                aria-label="more"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={(event) => {
                  event.stopPropagation();
                  handleClick(event, field);
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </ListItem>
            {index < fields.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      <Menu
        id="field-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleExport("PDF")}>Export to PDF</MenuItem>
        <MenuItem onClick={() => handleExport("XLSX")}>Export to XLSX</MenuItem>
      </Menu>
    </Drawer>
  );
};

export default FieldsSideMenu;
