import * as XLSX from 'xlsx';
import { IAnnualPlanValorization } from '../interfaces/annualPlanValorization';

export interface ExportValorizationData {
  valorization: IAnnualPlanValorization;
  insumos: any[];
  servicios: any[];
  formData: any;
}

export const exportValorizationToExcel = (data: ExportValorizationData, t: any) => {
  const { valorization, insumos, servicios, formData } = data;

  // Crear libro de trabajo
  const wb = XLSX.utils.book_new();

  // Hoja 1: Información General
  const generalData = [
    [t('annual_plan_valorization')],
    [''],
    [t('campaign'), valorization.campanaName || ''],
    [t('harvest'), valorization.zafra || ''],
    [t('field'), valorization.campoName || ''],
    [t('lot'), valorization.loteName || ''],
    [t('hectares'), valorization.has || 0],
    [t('crop'), valorization.cultivoName || ''],
    [''],
    [t('valorization_parameters')],
    [t('historical_yield_qq_ha'), formData.rindeHistorico || 0],
    [t('future_quote_local_currency'), formData.cotizFutCer || 0],
    [''],
    [t('results')],
    [t('estimated_harvest_tn'), valorization.cosechaEstimada || 0],
    [t('expenses'), t('local_currency'), formData.gastosMonLocal || 0],
    [t('yield'), t('local_currency'), formData.rendimientoMonLocal || 0],
    [t('trend'), t('local_currency'), formData.tendenciaMonLocal || 0],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(generalData);
  ws1['!cols'] = [{ width: 30 }, { width: 20 }, { width: 20 }];
  XLSX.utils.book_append_sheet(wb, ws1, t('general'));

  // Hoja 2: Insumos
  const insumosHeaders = [
    t('labor'),
    t('item'),
    t('quantity_ha'),
    t('unit_value'),
    t('total_value')
  ];

  const insumosData = insumos.map(insumo => [
    insumo.labor || '',
    insumo.item || '',
    insumo.cantidad || 0,
    insumo.valorUnidad || 0,
    insumo.valorTotal || 0
  ]);

  const insumosTotal = insumos.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
  
  const ws2Data = [
    insumosHeaders,
    ...insumosData,
    ['', '', '', t('total'), insumosTotal]
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
  ws2['!cols'] = [{ width: 15 }, { width: 30 }, { width: 15 }, { width: 15 }, { width: 15 }];
  XLSX.utils.book_append_sheet(wb, ws2, t('supplies'));

  // Hoja 3: Servicios
  const serviciosHeaders = [
    t('labor'),
    t('item'),
    t('quantity_ha'),
    t('unit_value'),
    t('total_value')
  ];

  const serviciosData = servicios.map(servicio => [
    servicio.labor || '',
    servicio.item || '',
    servicio.cantidad || 0,
    servicio.valorUnidad || 0,
    servicio.valorTotal || 0
  ]);

  const serviciosTotal = servicios.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
  
  const ws3Data = [
    serviciosHeaders,
    ...serviciosData,
    ['', '', '', t('total'), serviciosTotal]
  ];

  const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
  ws3['!cols'] = [{ width: 15 }, { width: 30 }, { width: 15 }, { width: 15 }, { width: 15 }];
  XLSX.utils.book_append_sheet(wb, ws3, t('services'));

  // Generar archivo
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const fileName = `${t('valorization')}_${valorization.campanaName}_${valorization.campoName}_${valorization.loteName}.xlsx`;
  
  // Crear blob y descargar
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}; 