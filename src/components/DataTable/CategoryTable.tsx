import React, { useEffect } from "react";
import {
  Box,
  Fab,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataTable, ItemRow, Loading, TableCellStyled } from "../";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  CloudOff as CloudOffIcon,
} from "@mui/icons-material";
import { ColumnProps } from "../../types";
import { useCategory, useForm } from "../../hooks";
import { useTranslation } from "react-i18next";

const columns: ColumnProps[] = [{ text: "Categoría", align: "left" }];

// const optionsCategory = ["Cliente", "Proveedor", "Ingeniero"];

export interface CategoryTableProps {
  categories: string[];
  handleDeleteCategory: (category: string) => void;
  handleAddCategory: (category: string) => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  handleDeleteCategory,
  handleAddCategory,
}) => {
  const { category, handleSelectChange, reset } = useForm({ category: "" });
  const {
    isLoading,
    categories: optionsCategories,
    getCategories,
  } = useCategory();

  const handleOnClickAdd = () => {
    if (!category) return;
    handleAddCategory(category);
    reset();
  };

  useEffect(() => {
    getCategories();
  }, []);

  const { t } =useTranslation ();

  return (
    <Box component="div" sx={{ p: 1 }}>
      {isLoading && <Loading loading />}
      <Grid
        container
        spacing={1}
        justifyContent="flex-start"
        alignItems="center"
        sx={{ paddingLeft: 1, mb: 2 }}
      >
        <Grid item xs={4}>
          <FormControl fullWidth>
            <InputLabel id="category">{t("_categories")}</InputLabel>
            <Select
              labelId="category"
              name="category"
              value={category}
              label={t("_categories")}
              onChange={handleSelectChange}
            >
              {optionsCategories.map((option) => (
                <MenuItem value={option.name}>{option.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <Fab
            onClick={handleOnClickAdd}
            size="small"
            color="primary"
            aria-label="add"
          >
            <AddIcon />
          </Fab>
        </Grid>
      </Grid>
      <DataTable key="datatable-category" columns={columns} isLoading={false}>
        {categories.length === 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            padding={4}
          >
            <Typography variant="h6" sx={{ paddingRight: 1 }}>
            {t("no_records")}
            </Typography>
            <CloudOffIcon fontSize="large" />
          </Box>
        )}
        {categories.map((category) => (
          <ItemRow key={category} hover>
            <TableCellStyled align="left">{category}</TableCellStyled>
            <TableCellStyled align="center">
              <Tooltip title={t("icon_delete")}>
                <IconButton
                  onClick={() => handleDeleteCategory(category)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </TableCellStyled>
          </ItemRow>
        ))}
      </DataTable>
    </Box>
  );
};
