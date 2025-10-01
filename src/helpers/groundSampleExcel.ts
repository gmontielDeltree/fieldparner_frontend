import * as XLSX from 'xlsx';

// Interface for soil variables
interface SoilVariables {
  carbono_organico?: number;
  materia_organica?: number;
  fosforo_bray?: number;
  fosforo_ii?: number;
  fosforo_iii?: number;
  calcio?: number;
  potasio?: number;
  sodio?: number;
  azufre?: number;
  zinc_zn?: number;
  nitratos_no3?: number;
  nitratos_n_n03?: number;
  nitrogeno_total?: number;
  sulfatos_s_so4?: number;
  humedad?: number;
  conductividad_electrica?: number;
}

// Variable labels for Excel export (Spanish)
const variableLabels = {
  carbono_organico: 'Carbono Orgánico (%)',
  materia_organica: 'Materia Orgánica (%)',
  fosforo_bray: 'Fósforo Bray (ppm)',
  fosforo_ii: 'Fósforo II (ppm)',
  fosforo_iii: 'Fósforo III (ppm)',
  calcio: 'Calcio (meq/100g)',
  potasio: 'Potasio (meq/100g)',
  sodio: 'Sodio (meq/100g)',
  azufre: 'Azufre (ppm)',
  zinc_zn: 'Zinc (ppm)',
  nitratos_no3: 'Nitratos NO3 (ppm)',
  nitratos_n_n03: 'Nitratos N-NO3 (ppm)',
  nitrogeno_total: 'Nitrógeno Total (%)',
  sulfatos_s_so4: 'Sulfatos S-SO4 (ppm)',
  humedad: 'Humedad (%)',
  conductividad_electrica: 'Conductividad Eléctrica (dS/m)'
};

/**
 * Export soil variables to Excel file
 */
export const exportSoilVariablesToExcel = (
  soilVariables: SoilVariables,
  lotName: string = 'Lote',
  fileName: string = 'variables_suelo'
) => {
  try {
    // Create workbook
    const wb = XLSX.utils.book_new();

    // Prepare data for the worksheet
    const data = [];

    // Add header row
    data.push(['Variable', 'Valor', 'Unidad']);

    // Add empty row for better readability
    data.push([]);

    // Add lot information
    data.push(['Información del Lote']);
    data.push(['Lote:', lotName]);
    data.push(['Fecha de Exportación:', new Date().toLocaleDateString('es-ES')]);

    // Add empty row
    data.push([]);

    // Add section header
    data.push(['Variables del Análisis de Suelo']);
    data.push(['Variable', 'Valor', 'Unidad']);

    // Add soil variables
    Object.entries(variableLabels).forEach(([key, label]) => {
      const value = soilVariables[key as keyof SoilVariables];
      const unit = extractUnit(label);
      const variableName = extractVariableName(label);

      data.push([
        variableName,
        value !== undefined && value !== null ? value : '',
        unit
      ]);
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    const colWidths = [
      { wch: 30 }, // Variable column
      { wch: 15 }, // Value column
      { wch: 15 }  // Unit column
    ];
    ws['!cols'] = colWidths;

    // Apply styles to header rows
    const headerStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "E8F5E9" } },
      alignment: { horizontal: "center" }
    };

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Variables de Suelo');

    // Generate Excel file
    const timestamp = new Date().toISOString().slice(0, 10);
    const fullFileName = `${fileName}_${lotName}_${timestamp}.xlsx`;

    // Write file
    XLSX.writeFile(wb, fullFileName);

    return { success: true, fileName: fullFileName };
  } catch (error) {
    console.error('Error exporting soil variables to Excel:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Import soil variables from Excel file
 */
export const importSoilVariablesFromExcel = async (file: File): Promise<{
  success: boolean;
  data?: SoilVariables;
  error?: string;
}> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // Initialize result object
        const soilVariables: SoilVariables = {};

        // Process rows to extract variables
        let inVariablesSection = false;

        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];

          // Check if we're in the variables section
          if (row[0] === 'Variables del Análisis de Suelo' ||
              row[0] === 'Variable' && row[1] === 'Valor') {
            inVariablesSection = true;
            continue;
          }

          // Skip empty rows or non-variable rows
          if (!inVariablesSection || !row[0] || row[0] === 'Variable') {
            continue;
          }

          // Try to match the variable name with our known variables
          const variableName = row[0].toString().toLowerCase();
          const value = parseFloat(row[1]);

          // Map Spanish names to field keys
          if (variableName.includes('carbono') && variableName.includes('orgánico')) {
            soilVariables.carbono_organico = isNaN(value) ? undefined : value;
          } else if (variableName.includes('materia') && variableName.includes('orgánica')) {
            soilVariables.materia_organica = isNaN(value) ? undefined : value;
          } else if (variableName.includes('fósforo') && variableName.includes('bray')) {
            soilVariables.fosforo_bray = isNaN(value) ? undefined : value;
          } else if (variableName.includes('fósforo') && variableName.includes('ii')) {
            soilVariables.fosforo_ii = isNaN(value) ? undefined : value;
          } else if (variableName.includes('fósforo') && variableName.includes('iii')) {
            soilVariables.fosforo_iii = isNaN(value) ? undefined : value;
          } else if (variableName.includes('calcio')) {
            soilVariables.calcio = isNaN(value) ? undefined : value;
          } else if (variableName.includes('potasio')) {
            soilVariables.potasio = isNaN(value) ? undefined : value;
          } else if (variableName.includes('sodio')) {
            soilVariables.sodio = isNaN(value) ? undefined : value;
          } else if (variableName.includes('azufre') && !variableName.includes('sulfato')) {
            soilVariables.azufre = isNaN(value) ? undefined : value;
          } else if (variableName.includes('zinc')) {
            soilVariables.zinc_zn = isNaN(value) ? undefined : value;
          } else if (variableName.includes('nitrato') && variableName.includes('no3') && !variableName.includes('n-no3')) {
            soilVariables.nitratos_no3 = isNaN(value) ? undefined : value;
          } else if (variableName.includes('nitrato') && variableName.includes('n-no3')) {
            soilVariables.nitratos_n_n03 = isNaN(value) ? undefined : value;
          } else if (variableName.includes('nitrógeno') && variableName.includes('total')) {
            soilVariables.nitrogeno_total = isNaN(value) ? undefined : value;
          } else if (variableName.includes('sulfato')) {
            soilVariables.sulfatos_s_so4 = isNaN(value) ? undefined : value;
          } else if (variableName.includes('humedad')) {
            soilVariables.humedad = isNaN(value) ? undefined : value;
          } else if (variableName.includes('conductividad')) {
            soilVariables.conductividad_electrica = isNaN(value) ? undefined : value;
          }
        }

        // Check if we got any valid data
        const hasData = Object.values(soilVariables).some(v => v !== undefined);

        if (!hasData) {
          resolve({
            success: false,
            error: 'No se encontraron datos válidos en el archivo Excel'
          });
        } else {
          resolve({
            success: true,
            data: soilVariables
          });
        }
      } catch (error) {
        resolve({
          success: false,
          error: `Error al procesar el archivo: ${error.message}`
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Error al leer el archivo'
      });
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Generate Excel template for soil variables
 */
export const generateSoilVariablesTemplate = () => {
  try {
    const wb = XLSX.utils.book_new();

    // Prepare template data
    const data = [];

    // Add instructions
    data.push(['PLANTILLA DE VARIABLES DE SUELO']);
    data.push([]);
    data.push(['Instrucciones:']);
    data.push(['1. Complete los valores en la columna "Valor"']);
    data.push(['2. No modifique los nombres de las variables']);
    data.push(['3. Use punto (.) como separador decimal']);
    data.push(['4. Deje en blanco las variables que no tenga']);
    data.push([]);

    // Add variables section
    data.push(['Variables del Análisis de Suelo']);
    data.push(['Variable', 'Valor', 'Unidad']);

    // Add all variables with empty values
    Object.entries(variableLabels).forEach(([key, label]) => {
      const unit = extractUnit(label);
      const variableName = extractVariableName(label);
      data.push([variableName, '', unit]);
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws['!cols'] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 15 }
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Variables de Suelo');

    // Generate file
    const fileName = `plantilla_variables_suelo.xlsx`;
    XLSX.writeFile(wb, fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error generating template:', error);
    return { success: false, error: error.message };
  }
};

// Helper functions
const extractUnit = (label: string): string => {
  const match = label.match(/\(([^)]+)\)/);
  return match ? match[1] : '';
};

const extractVariableName = (label: string): string => {
  return label.replace(/\s*\([^)]+\)/, '');
};