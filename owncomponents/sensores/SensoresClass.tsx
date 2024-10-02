import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Map } from 'mapbox-gl';
import { format } from 'date-fns';
import ApexCharts from 'apexcharts';
import PouchDB from 'pouchdb';
import { Devices, extract_tele } from './sensores';
import devices_modelos from './devices_modelos';
import { DailyTelemetryCard } from './sensores-types';

// Importa los componentes de medición
import TemperaturaCard from './mediciones-cards/temperatura';
import PresionCard from './mediciones-cards/presion';
import HumedadCard from './mediciones-cards/humedad';
import RadiacionCard from './mediciones-cards/radiacion';
import VientoVelocidadCard from './mediciones-cards/viento_velocidad';
import VientoDireccionCard from './mediciones-cards/viento_direccion';
import SensacionTermicaCard from './mediciones-cards/sensacion_termica';
import PuntoDeRocioCard from './mediciones-cards/punto_de_rocio';
import InversionTermicaChacabucoBajaCard from './mediciones-cards/inversion_termica_chacabuco_baja';
import StressTermicoCard from './mediciones-cards/stress_termico';
import PluviometroCard from './mediciones-cards/pluviometro';

import FpSidebar from '../john-deere/fp-sidebar';

import './SensoresClass.css';

const SensoresClass = forwardRef(({ onClose, map, uuid }, ref) => {
  const [selectedDeviceCard, setSelectedDeviceCard] = useState(null);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [devices] = useState(new Devices());
  const [datapoints, setDatapoints] = useState(null);
  const [showChartOnly, setShowChartOnly] = useState(false);

  useImperativeHandle(ref, () => ({
    async show(card) {
      if (card) {
        setSelectedDeviceCard(card);
        const details = await devices.get_details(card.device_id);
        setSelectedDetails(details);
        loadDataPoints(card.device_id);
      }
    }
  }));

  useEffect(() => {
    if (selectedDeviceCard) {
      const fetchDetails = async () => {
        const details = await devices.get_details(selectedDeviceCard.device_id);
        if (details) {
          setSelectedDetails(details);
        } else {
          console.error("Failed to fetch device details.");
          setSelectedDetails({});
        }
        loadDataPoints(selectedDeviceCard.device_id);
      };
      fetchDetails();
    }
  }, [selectedDeviceCard]);
  const valor = (key) => {
    return selectedDeviceCard
      ? extract_tele(key, selectedDeviceCard).value || 'N/A'
      : 'N/A';
  };

  const loadDataPoints = async (deviceId) => {
    const nt = await devices.get_raw_data_for_charts_generic(deviceId);
    setDatapoints(nt);
  };

  const deviceTiene = (sensor) => {
    console.log("SELECTED DEVICE: ",selectedDetails)
    if (!selectedDetails || !selectedDetails.tipo) {
      return false;
    }
    const tipo = selectedDetails.tipo;
    console.log("TIPO> ", tipo);
    return devices_modelos[tipo]?.sensores.includes(sensor) || false;
  };
  

  const ifLoadedShow = (nombre_var) => {
    if (!selectedDetails || !selectedDetails.tipo) {
      return false;
    }
    const hasSensor = deviceTiene(nombre_var);
    console.log("HAS SENSOR PARA ", nombre_var, ":\n", hasSensor);
    const hasCard = selectedDeviceCard ? true : false;
    return hasSensor && hasCard;
  };
  

if (!selectedDetails) {
  return <div>Loading...</div>;
}

  return (
    <>
    <FpSidebar onClose={onClose}>
      <h4 slot="title">Sensores</h4>
      <div slot="content">
        {ifLoadedShow('temperatura') && (
          <TemperaturaCard card={selectedDeviceCard} data={datapoints} />
        )}

{ifLoadedShow('humedad') && (
          <HumedadCard card={selectedDeviceCard} data={datapoints} />
        )}
        {ifLoadedShow('presion') && (
          <PresionCard card={selectedDeviceCard} data={datapoints} />
        )}
        {ifLoadedShow('radiacion_solar') && (
          <RadiacionCard card={selectedDeviceCard} data={datapoints} />
        )}
        {ifLoadedShow('viento_velocidad') && (
          <VientoVelocidadCard card={selectedDeviceCard} data={datapoints} />
        )}
        {ifLoadedShow('viento_direccion') && (
          <VientoDireccionCard card={selectedDeviceCard} data={datapoints} />
        )}
        {ifLoadedShow('pluviometro') && selectedDeviceCard && (
          <PluviometroCard deveui={selectedDeviceCard.device_id} />
        )}
        {ifLoadedShow('sensacion_termica') && (
          <SensacionTermicaCard card={selectedDeviceCard} data={datapoints} />
        )}
        {ifLoadedShow('punto_de_rocio') && (
          <PuntoDeRocioCard card={selectedDeviceCard} data={datapoints} />
        )}
        {ifLoadedShow('inversion_termica_chacabuco_baja') && (
          <InversionTermicaChacabucoBajaCard card={selectedDeviceCard} data={datapoints} />
        )}
        {ifLoadedShow('stress_termico') && (
          <StressTermicoCard card={selectedDeviceCard} data={datapoints} />
        )}
        
      </div>
    </FpSidebar>
    </>
  );
});

export default SensoresClass;