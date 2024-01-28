import React, { useEffect, useState } from "react";
import { Card, Typography, Box, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { styled, keyframes } from "@mui/material/styles";
import { useSupply } from "../../../hooks";
import {
  IActividadPlanificacion,
  IInsumosPlanificacion,
} from "../../../interfaces/planification";
import Button from "@mui/material/Button";
import CancelIcon from "@mui/icons-material/Close";
import {
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  useGridApiContext,
} from "@mui/x-data-grid";

import { Autocomplete, TextField } from "@mui/material";
import { useCallback } from "react";
import { uuidv7 } from "uuidv7";
import { useLineasInsumos } from "../../../hooks/usePlanifications";

const flashFadeAnimation = keyframes`
  0% {
    background-color: red;
    opacity: 1;
  }
  50% {
    background-color: red;
  }
  100% {
    opacity: 0;
  }
`;

const CustomListItem = styled(Card)(({ deleting }) => ({
  margin: "10px 0",
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  animation: deleting ? `${flashFadeAnimation} 1s forwards` : "none",
}));

const Title = styled(Typography)({
  fontSize: "1.5em",
  fontWeight: "bold",
  color: "#333",
  marginBottom: "20px",
});

const CustomPaper = styled(Paper)({
  padding: "20px",
  margin: "20px 0",
  backgroundColor: "#f7f7f7",
});

interface EditToolbarProps {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
}

function EditToolbar(props: EditToolbarProps) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = "lineaInsumo:" + uuidv7();
    setRows((oldRows) => [
      ...oldRows,
      { id, insumo: { name: "" }, dosis: 0, isNew: true },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "insumoId" },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add record
      </Button>
    </GridToolbarContainer>
  );
}

function PlanSuppliesForm({
  formData,
  setFormData,
  rows,
  setRows,
}: {
  formData: IActividadPlanificacion;
  setFormData: (a: IActividadPlanificacion) => void;
}) {

  // Son la representacion interna de cada linea de insumo
  const { supplies, getSupplies } = useSupply();

  const lineasInsumosDocs = useLineasInsumos(formData.insumosLineasIds);

  useEffect(() => {
    getSupplies();
  }, []);

  useEffect(() => {
    // rows cambiaron
    console.log("TODO UPDATE ACT DOC", rows);
    // let new_insumosIds = rows.map((s) => s._id);
    // setFormData({ ...formData, insumosLineasIds: new_insumosIds });
  }, [rows]);

  useEffect(() => {
    if (formData && supplies && lineasInsumosDocs) {
      console.log("TODO Load ROWS");
    }
  }, [formData, supplies, lineasInsumosDocs]);

  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    let r = rows.find((r) => r.id === id);
    if (r) {
      // Chech insumo not null
      console.log("INsumo not null?");
      if (r.insumo) {
        console.log("NO");
        setRowModesModel({
          ...rowModesModel,
          [id]: { mode: GridRowModes.View },
        });
      } else {
        setRows(rows.map((r) => r.id !== id));
      }
    }
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow: GridRowModel) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    {
      field: "insumo",
      headerName: "Insumo",
      width: 180,
      editable: true,
      renderEditCell: (params) => (
        <AutocompleteEditInputCell params={params} options={supplies} />
      ),
      valueFormatter: (params) => {
        return `${params.value.name || ""}`;
      },
      valueSetter: (params)=>{
        let hectareas = formData.area
        return { ...params.row, insumo :params.value, hectareas,dosis:0 };
      }
    },
    {
      field: "dosis",
      headerName: "Unidades/has",
      type: "number",
      width: 80,
      align: "right",
      headerAlign: "left",
      editable: true,
      valueSetter: (params)=>{
        return { ...params.row, dosis :params.value, totalCantidad:params.value*params.row.hectareas };
      },
      valueFormatter: (params) => {
        return `${params.value}`;
      },
    },
    {
      field: "unit",
      headerName: "",
      type: "number",
      width: 80,
      align: "right",
      headerAlign: "left",
      editable: false,
      valueGetter: (params) => {
        return `${params.row.insumo.unitMeasurement || ""}`;
      },
    },
    {
      field: "totalCantidad",
      headerName: "Cant. Total",
      type: "number",
      width: 80,
      align: "right",
      headerAlign: "left",
      editable: false,
      valueGetter: (params) => {
        return params.row.dosis * formData.area;
      },
    },
    {
      field: "precioUnitario",
      headerName: "Precio Unitario",
      type: "number",
      width: 80,
      align: "right",
      headerAlign: "left",
      editable: true,
      valueSetter: (params)=>{
        return { ...params.row, precioUnitario :params.value, totalCosto:params.value*params.row.totalCantidad };
      },
      valueFormatter: (params) => {
        return `USD ${params.value || ""}`;
      },
    },

    {
      field: "totalCosto",
      headerName: "Costo",
      type: "number",
      width: 80,
      align: "right",
      headerAlign: "left",
      editable: false,
      valueGetter: (params) => {
        return params.row.dosis * formData.area * params.row.precioUnitario;
      },
    },


    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box
      sx={{
        height: 500,
        width: "100%",
        "& .actions": {
          color: "text.secondary",
        },
        "& .textPrimary": {
          color: "text.primary",
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{
          toolbar: EditToolbar,
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
      />
    </Box>
  );
}

interface AutocompleteEditInputCellProps {
  params: GridRenderEditCellParams;
  options: any[] | undefined;
  freeSolo?: boolean;
  multiple?: boolean;
  getOptionLabel?: (option: any) => string;
}

export function AutocompleteEditInputCell(
  props: AutocompleteEditInputCellProps
) {
  const { params, options, freeSolo, getOptionLabel, multiple } = props;
  const apiRef = useGridApiContext();

  const handleChange = useCallback(
    (event: React.SyntheticEvent<Element, Event>, newValue: any) => {
      event.stopPropagation();
      apiRef.current.setEditCellValue({
        id: params.id,
        field: params.field,
        value: newValue,
      });
    },
    [params.id, params.field]
  );

  const getValue = useCallback(() => {
    if (params.value) return params.value;

    if (multiple) return [];

    return null;
  }, [params.value, multiple]);

  return (
    <Autocomplete
      value={getValue()}
      onChange={handleChange}
      onInputChange={(event, value) =>
        freeSolo && !multiple && event && handleChange(event, value)
      }
      fullWidth
      multiple={multiple}
      getOptionLabel={(option) => option.name}
      disableClearable
      options={options ?? []}
      freeSolo={freeSolo}
      autoHighlight
      // getOptionLabel={getOptionLabel}
      renderInput={(inputParams) => (
        <TextField variant="standard" {...inputParams} error={params.error} />
      )}
    />
  );
}

export default PlanSuppliesForm;
