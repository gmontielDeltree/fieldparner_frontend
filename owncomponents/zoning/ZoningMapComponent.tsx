import React, { useEffect, useRef, useState } from "react";
import { useMachine } from "@xstate/react";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { TextField } from "@mui/material";
import SplitButton from "./components/SplitButton";
import { Ambiente, Dosis } from "./machine";
import { histogram } from "./geotiff-helpers";
import { ChartSelector } from "./components/ChartSelector";
import Grid from "@mui/material/Grid";
import { provideMachine } from "./machine-provides";
import { uuidv7 } from "uuidv7";
import Modal from "@mui/material/Modal";
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from "./index.module.css"
import Icon from '@mui/material/Icon';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

mapboxgl.accessToken =
  "pk.eyJ1IjoibGF6bG9wYW5hZmxleCIsImEiOiJja3ZzZHJ0ZzYzN2FvMm9tdDZoZmJqbHNuIn0.oQI_TrJ3SvJ6e5S9_CnzFw";

const scale = (num, in_min, in_max, out_min, out_max) => {
  return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

const mymin = (data) =>
  Math.min.apply(
    null,
    data.filter(function (n) {
      return !isNaN(n);
    })
  );

const mymax = (data) =>
  Math.max.apply(
    null,
    data.filter(function (n) {
      return !isNaN(n);
    })
  );

const modal_style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  display: "flex",
  justifyContent: "space-between",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export const ZoningMapComponent: React.FC = ({ baseImageNameParam }) => {
  const { t } = useTranslation();
  const mapContainer = useRef(null);
  const map = useRef(null);

  const navigate = useNavigate()

  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12?optimize=true",
      center: [5, 34],
      zoom: 5,
    });


  });

  const [state, send, actorRef] = useMachine(provideMachine(), {
    input: {
      /*CTX */
      base_image_url: baseImageNameParam, //"86236837-d6ef-4fa4-8740-d7dd1303130f_2023-11-04_ndvi",
      base_image_name: baseImageNameParam, //"86236837-d6ef-4fa4-8740-d7dd1303130f_2023-11-04_ndvi",
      base_image: {},
      canvas: document.createElement("canvas"),
      map: map,
      ambientes: [
        {
          nombre: t('environment1'),
          color: "#FF0000",
          orden: 0,
          id: uuidv7(),
          superficie: undefined,
          dosis: [],
        },
        {
          nombre: t('environment2'),
          color: "#FF0000",
          orden: 1,
          id: uuidv7(),
          superficie: undefined,
          dosis: [],
        },
      ],
      dosis: [],
      rangos: [0],

      border_geojson: "fill",
      result_geojson: "fill2",
    },
  });


  useEffect(() => {
    const subscription = actorRef.subscribe((snapshot) => {
      // simple logging
      console.log(snapshot);
    });

    return subscription.unsubscribe;
  }, [actorRef]); // note: actor ref should never change

  const handleSliderChange = (event, newValue) => {
    // setRange(newValue);
    console.log(state.context, newValue.sort());
    send({ type: "SET_RANGES", new_ranges: newValue.sort() });
    // console.log(event,newValue)
  };

  const handleNumberChange = (event) => {
    let num_amb = event.target.value;
    let new_ranges_A = [...Array(num_amb - 1).keys()].map(
      (a) => (a + 1) * (2 / num_amb) - 1
    ); // va desde -1 a 1

    // scalar entre min y max
    let min = mymin(state.context.base_image.data[0]);
    let max = mymax(state.context.base_image.data[0]);
    let new_ranges = new_ranges_A.map((r) => scale(r, -1, 1, min, max));
    console.log("MMM", min, max, new_ranges_A, new_ranges);
    send({
      type: "SET_NUM_AMBIENTES",
      ambientes: num_amb,
      new_ranges: new_ranges,
    });
    // setNumber(event.target.value);
  };

  const handleDosisUnidadChange = (event) => { };

  return (
    <Grid container spacing={0} sx={{ position: "relative", width: "100%" }}>
      <Grid item xs={3} sx={{ textAlign: "center" }}>
        <div style={{ display: "flex", width: "100%", justifyContent: "space-between", padding: "1rem", alignItems: "center" }}>
          <h3 className="main-title" style={{ margin: "0px" }}>{t('zoneGenerator')}</h3>
          <Button onClick={() => navigate(-1)} startIcon={<Icon component={CancelIcon} />} color="secondary"></Button>
        </div>
        {/* <h4 className="agrotools-title">by Agrotools</h4> */}

        {state.matches("settingParameters") && (
          <>
            <FormControl fullWidth variant="standard">
              <InputLabel id="demo-simple-select-label">
                {t('environmentCount')}
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                value={state.context.rangos.length + 1}
                onChange={handleNumberChange}
              >
                {[...Array(7).keys()].map((num) => (
                  <MenuItem key={num + 1} value={num + 2}>
                    {num + 2}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <ChartSelector
              datos={histogram(state.context.base_image.data[0], 0.05)}
              rangos={state.context.rangos}
            ></ChartSelector>

            <Slider
              size="small"
              value={state.context.rangos}
              onChange={handleSliderChange}
              valueLabelDisplay="auto"
              min={mymin(state.context.base_image.data[0])}
              step={0.01}
              max={mymax(state.context.base_image.data[0])}
            />

            <table className={"center"}>
              <tr>
                <th>{t('color')}</th>
                <th>{t('name')}</th>
              </tr>
              {state.context.ambientes.map((a: Ambiente, index: number) => {
                return (
                  <tr key={index}>
                    <td>
                      {" "}
                      <input
                        type="color"
                        className="color-picker"
                        name="head"
                        value={a.color}
                        onChange={(e) => {
                          send({
                            type: "SET_COLOR",
                            value: e.target.value,
                            ambiente_id: a.id,
                          });
                        }}
                      />{" "}
                    </td>
                    <td>
                      <TextField
                        size="small"
                        variant="standard"
                        value={a.nombre}
                        onChange={(e) => {
                          send({
                            type: "SET_NOMBRE",
                            value: e.target.value,
                            ambiente_id: a.id,
                          });
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </table>

            <Button
              variant="contained"
              color="success"
              onClick={() => send({ type: "POLYGONIZE" })}
            >
              {t('generateEnvironments')}
            </Button>
          </>
        )}

        {state.matches("settingDosis") && (
          <>
            <Modal
              open={openModal}
              onClose={() => setOpenModal(false)}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={modal_style}>
                <TextField
                  size="small"
                  value={state.context.dosis_en_edit.insumo}
                  label={t('input')}
                  onChange={(e) => send({ type: "DOSIS_NOMBRE_UNIDAD" })}
                ></TextField>
                <Select
                  size="small"
                  value={state.context.dosis_en_edit.unidad}
                  label={t('unit')}
                  labelId="demo-simple-select-label"
                  onChange={(e) => {
                    state.context.dosis_en_edit.unidad = e.target.value;
                  }}
                >
                  {["Kg/ha", "Tn/ha", "l/ha", t('seedsPerHa')].map(
                    (num, index) => (
                      <MenuItem key={index + 1} value={num}>
                        {num}
                      </MenuItem>
                    )
                  )}
                </Select>
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  onClick={() => {
                    send({ type: "ADD_INSUMO" });
                  }}
                >
                  {t('add')}
                </Button>
              </Box>
            </Modal>

            <table>
              <tr>
                <th>{t('environment')}</th>

                {Array.from(state.context.insumos).map(([key, value]) => {
                  return (
                    <th>
                      <Button
                        variant="contained"
                        size="small"
                        color="success"
                        onClick={() =>
                          send({ type: "DELETE_INSUMO", id: key })
                        }
                      >
                        {value.nombre}
                      </Button>
                    </th>
                  );
                })}

                <th>
                  {" "}
                  <Button
                    variant="contained"
                    size="small"
                    color="success"
                    onClick={() => send({ type: "ADD_INSUMO" })}
                  >
                    + {t('dose')}
                  </Button>
                </th>
              </tr>

              {state.context.ambientes.map((a: Ambiente, index: number) => {
                return (
                  <tr>
                    <td>
                      <input
                        type="color"
                        className="color-picker"
                        name="head"
                        value={a.color}
                        onChange={(e) => {
                          send({
                            type: "SET_COLOR",
                            value: e.target.value,
                            ambiente_id: a.id,
                          });
                        }}
                      />
                      <TextField
                        size="small"
                        variant="standard"
                        value={a.nombre}
                        onChange={(e) => {
                          send({
                            type: "SET_NOMBRE",
                            value: e.target.value,
                            ambiente_id: a.id,
                          });
                        }}
                      />
                    </td>

                    {Array.from(state.context.insumos).map(([key, value]) => {
                      return (
                        <td>
                          <TextField
                            value={
                              state.context.dosis.get(a.id + "_" + key) ?? 0
                            }
                            onChange={(e) =>
                              send({
                                type: "SET_DOSIS",
                                ambiente_id: a.id,
                                insumo_id: key,
                                value: e.target.value,
                              })
                            }
                          ></TextField>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </table>

            <Button variant="text" onClick={() => send({ type: "VOLVER" })}>
              {t('back')}
            </Button>

            <Button variant="contained"
              onClick={() => send({ type: "DOWNLOAD_SHP" })}
            >{t('downloadSHP')}</Button>
          </>
        )}
      </Grid>
      <Grid item xs={9}>
        <div className={styles.mapa} ref={mapContainer} />
      </Grid>
    </Grid>
  );
};