import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button as MuiButton,
  Card as MuiCard,
  CardContent as MuiCardContent,
  Container,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert as MuiAlert,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Assessment as AssessmentIcon,
  FileDownload as FileDownloadIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Progress,
  Alert,
  Spinner,
} from 'reactstrap';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Package,
} from 'lucide-react';
import { useTranslation } from "react-i18next";
import { TemplateLayout, Loading } from "../../components";
import { useAnnualPlanValorization } from "../../hooks/useAnnualPlanValorization";
import { useCampaign, useField, useCrops, useAppSelector } from "../../hooks";
import { useCountry } from "../../hooks/useCountry";
import { usePlanActividad, useListaDeCiclos } from "../../hooks/usePlanifications";
import { useLabores } from "../../hooks/useLabores";
import {
  IAnnualPlan,
  IInsumosxAnnualPlan,
  IServicxAnnualPlan,
  IAnnualPlanValorization
} from "../../interfaces/annualPlanValorization";
import {
  ICiclosPlanificacion,
  IActividadPlanificacion,
  IInsumosPlanificacion,
  ILaboresPlanificacion
} from "../../interfaces/planification";
import { Campaign, Field, Lot } from "../../types";
import { dbContext } from "../../services";
import { resolveLaborServiceName } from "../../utils/laborService";

interface FormData {
  // Sección 1
  campanaId: string;
  zafra: string;
  campoId: string;
  loteId: string;
  has: number;
  rindeHistorico: number | string; // Quintales/Ha
  cotizFutCer: number | string; // Moneda local por tonelada
  monedaAlterId: string;
  cotizMonAlt: number;
  operacMonAlt: 'multiplicar' | 'dividir';

  // Sección 2 (calculados)
  gastosMonLocal: number;
  gastosMonAlt: number;
  rendimientoMonLocal: number;
  rendimientoMonAlt: number;
  tendenciaMonLocal: number;
  tendenciaMonAlt: number;
}

export const AnnualPlanValorizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const isEditMode = !!id;

  const { user } = useAppSelector((state) => state.auth);
  const { campaigns, getCampaigns } = useCampaign();
  const { fields, getFields } = useField();
  const { crops, getCrops } = useCrops();
  const { country: countries, getCountries } = useCountry();
  const { getLineasInsumos, getLineasServicios } = usePlanActividad();
  const ciclos = useListaDeCiclos();
  const { getLaborFromId } = useLabores();
  const {
    updateAnnualPlanValorization,
  } = useAnnualPlanValorization();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Step management for better UX
  const [activeStep, setActiveStep] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);

  const [annualPlan, setAnnualPlan] = useState<any | null>(null);
  const [insumos, setInsumos] = useState<IInsumosxAnnualPlan[]>([]);
  const [servicios, setServicios] = useState<IServicxAnnualPlan[]>([]);
  const [cultivoNombre, setCultivoNombre] = useState('');
  const hasLoadedEditData = useRef(false);

  // Brazil uses "Sacas" (60kg) instead of "Toneladas" (1000kg) for commodity pricing
  const isBrazilMode =
    user?.countryId === 'BR' ||
    user?.currency === 'BRL' ||
    i18n.language.startsWith('pt');
  const cotizDivisor = isBrazilMode ? 60 : 1000;
  const localCurrency = isBrazilMode ? 'BRL' : (user?.currency || 'ARS');
  const normalizeId = (value: unknown) => (value ?? '').toString().trim();

  const getLotIdentifiers = (lot?: Partial<Lot> | any, loteValue?: string) =>
    Array.from(
      new Set(
        [loteValue, lot?.properties?.uuid, lot?.id, lot?.properties?.nombre, lot?._id]
          .map(normalizeId)
          .filter(Boolean),
      ),
    );

  const findFieldAndLotForCiclo = (cicloDoc: ICiclosPlanificacion) => {
    const orderedFields = cicloDoc.campoId
      ? [
          ...fields.filter((field) =>
            [field?._id, (field as any)?.uuid, (field as any)?.id]
              .map(normalizeId)
              .includes(normalizeId(cicloDoc.campoId)),
          ),
          ...fields.filter((field) =>
            ![field?._id, (field as any)?.uuid, (field as any)?.id]
              .map(normalizeId)
              .includes(normalizeId(cicloDoc.campoId)),
          ),
        ]
      : fields;

    for (const field of orderedFields) {
      const lote = field.lotes?.find((candidateLot: any) =>
        getLotIdentifiers(candidateLot).includes(normalizeId(cicloDoc.loteId)),
      );
      if (lote) {
        return { field, lote };
      }
    }

    return { field: undefined, lote: undefined };
  };

  const getCyclesForSelection = (campanaId: string, zafra?: string, campoId?: string) => {
    const currentAccountId = normalizeId(user?.accountId);

    return (ciclos.ciclos || []).filter((ciclo) => {
      if (normalizeId(ciclo.campanaId) !== normalizeId(campanaId)) {
        return false;
      }

      if (currentAccountId && normalizeId((ciclo as any).accountId) && normalizeId((ciclo as any).accountId) !== currentAccountId) {
        return false;
      }

      if (zafra && normalizeId(ciclo.zafra) !== normalizeId(zafra)) {
        return false;
      }

      if (campoId && normalizeId(ciclo.campoId) && normalizeId(ciclo.campoId) !== normalizeId(campoId)) {
        return false;
      }

      return true;
    });
  };

  const getAvailableFieldsForSelection = (campanaId: string, zafra: string) => {
    const matchingCycles = getCyclesForSelection(campanaId, zafra);
    if (matchingCycles.length === 0) {
      return fields;
    }

    const candidateFieldIds = new Set(
      matchingCycles
        .map((cycle) => normalizeId(cycle.campoId))
        .filter(Boolean),
    );

    return fields.filter((field) =>
      [field?._id, (field as any)?.uuid, (field as any)?.id]
        .map(normalizeId)
        .some((fieldId) => candidateFieldIds.has(fieldId)),
    );
  };

  const getAvailableLotesForSelection = (campanaId: string, campoId: string, zafra: string) => {
    const selectedField = fields.find((field) => field._id === campoId);
    if (!selectedField?.lotes) {
      return [];
    }

    const matchingCycles = getCyclesForSelection(campanaId, zafra, campoId);
    if (matchingCycles.length === 0) {
      return selectedField.lotes;
    }

    return selectedField.lotes.filter((lot) => {
      const lotIds = getLotIdentifiers(lot);
      return matchingCycles.some((cycle) => lotIds.includes(normalizeId(cycle.loteId)));
    });
  };

  const findMatchingCiclo = ({
    campanaId,
    campoId,
    zafra,
    lot,
    loteValue,
    cultivoId,
  }: {
    campanaId: string;
    campoId: string;
    zafra: string;
    lot?: Lot | any;
    loteValue: string;
    cultivoId?: string;
  }) => {
    const candidateLotIds = getLotIdentifiers(lot, loteValue);
    const matches = getCyclesForSelection(campanaId, zafra, campoId).filter((ciclo) => {
      if (candidateLotIds.length > 0 && !candidateLotIds.includes(normalizeId(ciclo.loteId))) {
        return false;
      }

      if (cultivoId && normalizeId(ciclo.cultivoId) !== normalizeId(cultivoId)) {
        return false;
      }

      return true;
    });

    if (matches.length === 1) {
      return matches[0];
    }

    if (matches.length > 1 && cultivoId) {
      const exactCropMatch = matches.find((ciclo) => normalizeId(ciclo.cultivoId) === normalizeId(cultivoId));
      if (exactCropMatch) {
        return exactCropMatch;
      }
    }

    return null;
  };

  const getCycleHectares = (cicloDoc: ICiclosPlanificacion) => {
    const { lote } = findFieldAndLotForCiclo(cicloDoc);
    return Number(lote?.properties?.hectareas || 0);
  };

  // Resolve crop name from a cultivoId using all available strategies
  const resolveCropName = async (cultivoId: string): Promise<string> => {
    if (!cultivoId) return '';
    const norm = normalizeId(cultivoId);

    // 1. By _id
    let crop: any = crops.find((c: any) => normalizeId(c?._id) === norm);
    // 2. By alt fields
    if (!crop) {
      crop = crops.find((c: any) =>
        [(c as any)?.id, (c as any)?.uuid, (c as any)?.codigo, (c as any)?.code]
          .some(val => val && normalizeId(val) === norm)
      );
    }
    // 3. By name match
    if (!crop) {
      crop = crops.find((c: any) =>
        normalizeId((c as any)?.crop) === norm ||
        normalizeId((c as any)?.descriptionES) === norm ||
        normalizeId((c as any)?.descriptionPT) === norm
      );
    }
    if (crop) {
      return (crop as any)?.crop || (crop as any)?.descriptionES || (crop as any)?.name || '';
    }
    // 4. Direct DB lookup
    try {
      const doc = await dbContext.crops.get(cultivoId) as any;
      return doc?.crop || doc?.descriptionES || doc?.name || '';
    } catch (_) {
      return '';
    }
  };

  // Form data
  const [formData, setFormData] = useState<FormData>({
    campanaId: '',
    zafra: '',
    campoId: '',
    loteId: '',
    has: 0,
    rindeHistorico: '',
    cotizFutCer: '',
    monedaAlterId: '',
    cotizMonAlt: 0,
    operacMonAlt: 'multiplicar',
    gastosMonLocal: 0,
    gastosMonAlt: 0,
    rendimientoMonLocal: 0,
    rendimientoMonAlt: 0,
    tendenciaMonLocal: 0,
    tendenciaMonAlt: 0,
  });

  // Filtered lists
  const [availableZafras, setAvailableZafras] = useState<any[]>([]);
  const [availableCampos, setAvailableCampos] = useState<Field[]>([]);
  const [availableLotes, setAvailableLotes] = useState<Lot[]>([]);
  const [availableCultivos, setAvailableCultivos] = useState<{ ciclo: ICiclosPlanificacion; cropName: string }[]>([]);

  // Define steps for the valorization flow
  const steps = [
    { label: t('valorization_parameters'), key: 'parameters' },
    { label: t('value_loading'), key: 'values' },
    { label: t('trend'), key: 'trend' },
  ];

  // Cargar datos iniciales
  useEffect(() => {
    getCampaigns();
    getFields();
    getCrops();
    getCountries();
    ciclos.refreshCiclos();
  }, []);

  // Reset load guard when the route id changes (navigating between valorizations)
  useEffect(() => {
    hasLoadedEditData.current = false;
  }, [id]);

  useEffect(() => {
    if (isEditMode && campaigns.length > 0 && fields.length > 0 && crops.length > 0 && !hasLoadedEditData.current) {
      hasLoadedEditData.current = true;
      loadValorizationData();
    }
  }, [id, campaigns, fields, crops]);

  // Inicializar campos disponibles cuando se cargan los fields
  useEffect(() => {
    if (fields.length > 0 && availableCampos.length === 0 && !formData.campanaId) {
        setAvailableCampos(fields);
    }
  }, [fields]);

  // Recalcular totales cuando cambien insumos o servicios
  // COMENTADO: Este useEffect puede estar causando el problema del lote
  // useEffect(() => {
  //   if (insumos.length > 0 || servicios.length > 0) {
  //     recalcularTotales();
  //   }
  // }, [insumos, servicios, formData.has, formData.rindeHistorico, formData.cotizFutCer]);

  // Nota: Removido useEffect que causaba bucle infinito

  const loadValorizationData = async () => {
    setLoading(true);
    try {
      if (!id) return;

      // Load the specific ciclo by its ID from the database
      const cicloDoc = await dbContext.fields.get(id) as unknown as ICiclosPlanificacion;
      setAnnualPlan(cicloDoc);

      // Find the campaign
      const campaign = campaigns.find(c => c._id === cicloDoc.campanaId);

      // Resolve the field/lote preferring the campoId stored on the ciclo.
      let { field: foundField, lote: foundLote } = findFieldAndLotForCiclo(cicloDoc);

      // Fallback: if field not found by campoId, try finding it by the loteId
      if (!foundField && cicloDoc.loteId) {
        for (const candidateField of fields) {
          const lot = candidateField.lotes?.find((l: any) =>
            getLotIdentifiers(l).includes(normalizeId(cicloDoc.loteId)),
          );
          if (lot) {
            foundField = candidateField;
            foundLote = lot;
            break;
          }
        }
      }

      // Populate availableZafras from campaign, with fallback to ciclos
      let zafrasArray: any[] = [];
      if (campaign?.zafra) {
        const zafrasFromCampaign = Array.isArray(campaign.zafra)
          ? campaign.zafra
          : (typeof campaign.zafra === 'string' ? [campaign.zafra] : []);
        zafrasArray = zafrasFromCampaign.map((z, i) => ({ id: `zafra_${i}`, name: z }));
      }
      // Fallback: extract zafras from ciclos for this campaign
      if (zafrasArray.length === 0) {
        const campaignCycles = (ciclos.ciclos || []).filter(c => c.campanaId === cicloDoc.campanaId);
        const uniqueZafras = new Map<string, { id: string; name: string }>();
        campaignCycles.forEach(ciclo => {
          if (ciclo.zafra) {
            uniqueZafras.set(ciclo.zafra, { id: ciclo.zafra, name: ciclo.zafra });
          } else if (ciclo.cultivoId) {
            const crop = crops.find(c => c._id === ciclo.cultivoId);
            const zafraName = crop ? `${t('harvest')} ${(crop as any).crop || (crop as any).name || crop._id}` : `${t('harvest')} ${ciclo.cultivoId}`;
            uniqueZafras.set(ciclo.cultivoId, { id: ciclo.cultivoId, name: zafraName });
          }
        });
        zafrasArray = Array.from(uniqueZafras.values());
      }
      setAvailableZafras(zafrasArray);

      // Populate available campos and lotes
      let camposForEdit = getAvailableFieldsForSelection(cicloDoc.campanaId, cicloDoc.zafra || '');
      // Ensure the found field is always in the list (may not match cycle filters)
      if (foundField && !camposForEdit.some(c => c._id === foundField._id)) {
        camposForEdit = [foundField, ...camposForEdit];
      }
      setAvailableCampos(camposForEdit);
      if (foundField?.lotes) {
        let lotesForEdit = getAvailableLotesForSelection(cicloDoc.campanaId, foundField._id, cicloDoc.zafra || '');
        // Ensure the found lote is always in the list
        if (foundLote && !lotesForEdit.some((l: any) => l.properties?.nombre === foundLote.properties?.nombre)) {
          lotesForEdit = [foundLote, ...lotesForEdit];
        }
        setAvailableLotes(lotesForEdit);
      }

      // Get the zafra value
      const zafra = cicloDoc.zafra ||
        (Array.isArray(campaign?.zafra) ? campaign.zafra[0] : campaign?.zafra) || '';

      const cultivoNorm = normalizeId(cicloDoc.cultivoId);

      let cropName = '';

      // 1. Try direct _id match (most common)
      let crop: any = crops.find((c: any) => normalizeId(c?._id) === cultivoNorm);

      // 2. Try other ID fields
      if (!crop) {
        crop = crops.find((c: any) =>
          [(c as any)?.id, (c as any)?.uuid, (c as any)?.codigo, (c as any)?.code, (c as any)?.cultivoId]
            .some(val => val && normalizeId(val) === cultivoNorm)
        );
      }

      // 3. Try matching cultivoId against crop name/description (in case cultivoId is stored as a name)
      if (!crop && cultivoNorm) {
        crop = crops.find((c: any) =>
          normalizeId((c as any)?.crop) === cultivoNorm ||
          normalizeId((c as any)?.descriptionES) === cultivoNorm ||
          normalizeId((c as any)?.descriptionPT) === cultivoNorm ||
          normalizeId((c as any)?.descriptionEN) === cultivoNorm
        );
      }

      // 4. If the ciclo has an embedded cultivo object
      if (!crop && (cicloDoc as any).cultivo) {
        const embedded = (cicloDoc as any).cultivo;
        const embeddedId = normalizeId(embedded._id || embedded.id);
        if (embeddedId) {
          crop = crops.find((c: any) => normalizeId(c?._id) === embeddedId);
        }
        if (!crop) {
          cropName = embedded.crop || embedded.descriptionES || embedded.name || embedded.nombre || '';
        }
      }

      // 5. Last resort: load directly from crops DB by cultivoId
      if (!crop && !cropName && cultivoNorm) {
        try {
          const directCrop = await dbContext.crops.get(cicloDoc.cultivoId) as any;
          cropName = directCrop?.crop || directCrop?.descriptionES || directCrop?.name || '';
        } catch {
          // crop not found in DB
        }
      }

      if (crop) {
        cropName = (crop as any)?.crop || (crop as any)?.descriptionES || (crop as any)?.name || (crop as any)?.nombre || '';
      }
      setCultivoNombre(cropName);

      // Set form data with real values from the ciclo
      setFormData({
        campanaId: cicloDoc.campanaId || '',
        zafra: zafra,
        campoId: foundField?._id || cicloDoc.campoId || '',
        loteId: foundLote?.properties?.nombre || cicloDoc.loteId || '',
        has: foundLote?.properties?.hectareas || 0,
        rindeHistorico: (cicloDoc as any).rindeHistorico || '',
        cotizFutCer: (cicloDoc as any).cotizFutCer || '',
        monedaAlterId: (cicloDoc as any).monedaAlterId || '',
        cotizMonAlt: (cicloDoc as any).cotizMonAlt || 0,
        operacMonAlt: (cicloDoc as any).operacMonAlt || 'dividir',
        gastosMonLocal: 0,
        gastosMonAlt: 0,
        rendimientoMonLocal: 0,
        rendimientoMonAlt: 0,
        tendenciaMonLocal: 0,
        tendenciaMonAlt: 0,
      });

      // Load planification data for this specific ciclo only
      await loadPlanificationData(cicloDoc.campanaId, foundField?._id || '', cicloDoc.loteId, zafra, [cicloDoc]);
    } catch (error) {
      console.error("Error loading valorization data:", error);
    } finally {
      setLoading(false);
    }
  };

  // When user selects a cultivo from the dropdown (multiple ciclos for the same lot)
  const handleCultivoChange = async (cultivoId: string) => {
    const selected = availableCultivos.find(c => c.ciclo.cultivoId === cultivoId);
    if (!selected) return;

    const ciclo = selected.ciclo;
    setAnnualPlan(ciclo);
    setCultivoNombre(selected.cropName);
    setFormData((prev) => ({
      ...prev,
      zafra: ciclo.zafra || prev.zafra,
      rindeHistorico: (ciclo as any).rindeHistorico || '',
      cotizFutCer: (ciclo as any).cotizFutCer || '',
      monedaAlterId: (ciclo as any).monedaAlterId || '',
      cotizMonAlt: (ciclo as any).cotizMonAlt || 0,
      operacMonAlt: (ciclo as any).operacMonAlt || 'multiplicar',
    }));

    loadPlanificationData(
      formData.campanaId,
      formData.campoId,
      formData.loteId,
      ciclo.zafra || formData.zafra,
      [ciclo],
    );
  };

  const handleLoteChange = async (loteValue: string) => {

    const selectedField = fields.find(f => f._id === formData.campoId);
    const selectedLot = selectedField?.lotes.find((lot) =>
      getLotIdentifiers(lot, loteValue).includes(normalizeId(loteValue)),
    );

    if (selectedLot) {
      const newHectareas = selectedLot.properties.hectareas || 0;

      // Find ALL matching ciclos for this lot (could be multiple crops)
      const candidateLotIds = getLotIdentifiers(selectedLot, loteValue);
      const allMatches = getCyclesForSelection(formData.campanaId, formData.zafra, formData.campoId)
        .filter((ciclo) => candidateLotIds.includes(normalizeId(ciclo.loteId)));

      if (allMatches.length >= 1) {
        // Build crop options for dropdown (works for 1 or many ciclos)
        const cultivoOptions = await Promise.all(
          allMatches.map(async (ciclo) => ({
            ciclo,
            cropName: await resolveCropName(ciclo.cultivoId) || ciclo.cultivoId,
          }))
        );
        setAvailableCultivos(cultivoOptions);

        if (allMatches.length === 1) {
          // Single ciclo → auto-select but still show in dropdown
          const matchingCiclo = allMatches[0];
          setAnnualPlan(matchingCiclo);
          setCultivoNombre(cultivoOptions[0].cropName);
          setFormData((prev) => ({
            ...prev,
            loteId: loteValue,
            has: newHectareas,
            zafra: matchingCiclo.zafra || prev.zafra,
            rindeHistorico: (matchingCiclo as any).rindeHistorico || '',
            cotizFutCer: (matchingCiclo as any).cotizFutCer || '',
            monedaAlterId: (matchingCiclo as any).monedaAlterId || '',
            cotizMonAlt: (matchingCiclo as any).cotizMonAlt || 0,
            operacMonAlt: (matchingCiclo as any).operacMonAlt || 'multiplicar',
          }));

          loadPlanificationData(
            formData.campanaId,
            formData.campoId,
            loteValue,
            matchingCiclo.zafra || formData.zafra,
            [matchingCiclo],
          );
        } else {
          // Multiple ciclos → user must pick
          setAnnualPlan(null);
          setCultivoNombre('');
          setFormData((prev) => ({
            ...prev,
            loteId: loteValue,
            has: newHectareas,
          }));
          setInsumos([]);
          setServicios([]);
        }
      } else {
        // No matching ciclo found
        setAvailableCultivos([]);
        setAnnualPlan(null);
        setFormData((prev) => ({
          ...prev,
          loteId: loteValue,
          has: newHectareas,
          rindeHistorico: '',
          cotizFutCer: '',
          monedaAlterId: '',
          cotizMonAlt: 0,
          operacMonAlt: 'multiplicar',
        }));
        setInsumos([]);
        setServicios([]);
        setCultivoNombre('');
        recalcularTotalesConDatos([], []);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        loteId: loteValue,
        has: 0,
        rindeHistorico: '',
        cotizFutCer: '',
        monedaAlterId: '',
        cotizMonAlt: 0,
        operacMonAlt: 'multiplicar',
      }));
      setAnnualPlan(null);
      setInsumos([]);
      setServicios([]);
      setCultivoNombre('');
    }
  };

  const handleFieldChange = (field: keyof FormData, value: any) => {

    // Crear objeto con los nuevos datos
    let updatedFormData = { ...formData, [field]: value };

    // Lógica específica por campo
    switch (field) {
      case 'campanaId':
        if (value !== formData.campanaId) {

          // Obtener zafras directamente de la campaña seleccionada
          const campaign = campaigns.find(c => c._id === value);
          const loadZafras = async () => {
            let zafrasArray: any[] = [];

            // 1. Intentar desde campaign.zafra
            if (campaign && campaign.zafra) {
              const zafrasFromCampaign = Array.isArray(campaign.zafra)
                ? campaign.zafra
                : (typeof campaign.zafra === 'string' ? [campaign.zafra] : []);
              zafrasArray = zafrasFromCampaign.map((zafra, index) => ({
                id: `zafra_${index}`,
                name: zafra
              }));
            }

            // 2. Si no hay, intentar desde ciclos ya cargados
            if (zafrasArray.length === 0) {
              let campaignCycles = ciclos.ciclos?.filter(c => c.campanaId === value) || [];

              // 3. Si ciclos no cargaron aún, cargarlos directamente de la DB
              if (campaignCycles.length === 0) {
                try {
                  const db = dbContext.fields as unknown as PouchDB.Database<ICiclosPlanificacion>;
                  const result = await db.allDocs({
                    include_docs: true,
                    startkey: "ciclo:",
                    endkey: "ciclo:\ufff0",
                  });
                  campaignCycles = result.rows
                    .filter(row => row.doc && !row.id.startsWith("_"))
                    .map(row => row.doc as unknown as ICiclosPlanificacion)
                    .filter(c => c.campanaId === value);
                } catch (err) {
                  console.warn('Error loading ciclos for zafra:', err);
                }
              }

              const uniqueZafras = new Map();
              campaignCycles.forEach(ciclo => {
                if (ciclo.zafra) {
                  uniqueZafras.set(ciclo.zafra, { id: ciclo.zafra, name: ciclo.zafra });
                } else if (ciclo.cultivoId) {
                  const crop = crops.find(c => c._id === ciclo.cultivoId);
                  const zafraName = crop ? `${t('harvest')} ${(crop as any).crop || (crop as any).name || crop._id}` : `${t('harvest')} ${ciclo.cultivoId}`;
                  uniqueZafras.set(ciclo.cultivoId, { id: ciclo.cultivoId, name: zafraName });
                }
              });
              zafrasArray = Array.from(uniqueZafras.values());
            }

            setAvailableZafras(zafrasArray);
          };

          loadZafras();

          setAnnualPlan(null);
          // Pre-load available campos (without zafra filter) so the user can browse
          const camposForCampaign = getAvailableFieldsForSelection(value, '');
          setAvailableCampos(camposForCampaign.length > 0 ? camposForCampaign : fields);
          setAvailableLotes([]);

          updatedFormData = {
            ...updatedFormData,
            zafra: '',
            campoId: '',
            loteId: '',
            has: 0,
            rindeHistorico: '',
            cotizFutCer: '',
            monedaAlterId: '',
            cotizMonAlt: 0,
            operacMonAlt: 'multiplicar',
          };

          // Clear insumos/servicios - they will reload when the user selects a lote
          setInsumos([]);
          setServicios([]);
          setCultivoNombre('');
        }
        break;

      case 'zafra':
        if (value !== formData.zafra) {
          setAnnualPlan(null);
          setAvailableCampos(getAvailableFieldsForSelection(formData.campanaId, value));
          setAvailableLotes([]);
          updatedFormData = {
            ...updatedFormData,
            campoId: '',
            loteId: '',
            has: 0,
            rindeHistorico: '',
            cotizFutCer: '',
            monedaAlterId: '',
            cotizMonAlt: 0,
            operacMonAlt: 'multiplicar',
          };
          setInsumos([]);
          setServicios([]);
          setCultivoNombre('');
        }
        break;

      case 'campoId':
        if (value !== formData.campoId) {
          setAnnualPlan(null);
          if (value) {
            setAvailableLotes(getAvailableLotesForSelection(formData.campanaId, value, formData.zafra));
            // Solo resetear el loteId si el campo realmente cambió
            updatedFormData = {
              ...updatedFormData,
              loteId: '', // Es correcto resetear aquí porque cambió el campo
              has: 0,
              rindeHistorico: '',
              cotizFutCer: '',
              monedaAlterId: '',
              cotizMonAlt: 0,
              operacMonAlt: 'multiplicar',
            };
            setInsumos([]);
            setServicios([]);
            setCultivoNombre('');
          }
        }
        break;
    }

    // Actualizar el estado una sola vez
    setFormData(updatedFormData);

    // Recalcular totales si es necesario
    if (['rindeHistorico', 'cotizFutCer', 'cotizMonAlt', 'operacMonAlt'].includes(field)) {
      setTimeout(() => recalcularTotales(), 0);
    }
  };

  const handleInsumoValorChange = (index: number, valor: number) => {
    const updatedInsumos = [...insumos];
    const validValue = isNaN(valor) || valor < 0 ? 0 : valor;
    updatedInsumos[index].valorUnidad = validValue;
    updatedInsumos[index].valorTotal = validValue * (updatedInsumos[index].cantidad || 0);
    setInsumos(updatedInsumos);
    recalcularTotalesConDatos(updatedInsumos, servicios);
  };

  const handleServicioValorChange = (index: number, valor: number) => {
    const updatedServicios = [...servicios];
    const validValue = isNaN(valor) || valor < 0 ? 0 : valor;
    updatedServicios[index].valorUnidad = validValue;
    const hectareasAplicadas = updatedServicios[index].cantidadHa || updatedServicios[index].cantidad || formData.has || 0;
    updatedServicios[index].valorTotal = validValue * hectareasAplicadas;
    setServicios(updatedServicios);
    recalcularTotalesConDatos(insumos, updatedServicios);
  };

  const recalcularTotales = () => {
    recalcularTotalesConDatos(insumos, servicios);
  };

  const recalcularTotalesConDatos = (insumosData: IInsumosxAnnualPlan[], serviciosData: IServicxAnnualPlan[]) => {
    const gastosInsumos = insumosData.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
    const gastosServicios = serviciosData.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
    const gastosTotal = gastosInsumos + gastosServicios;

    setFormData(currentFormData => {
      const rindeHistoricoVal = typeof currentFormData.rindeHistorico === 'string' ? parseFloat(currentFormData.rindeHistorico) || 0 : currentFormData.rindeHistorico;
      const cotizFutCerVal = typeof currentFormData.cotizFutCer === 'string' ? parseFloat(currentFormData.cotizFutCer) || 0 : currentFormData.cotizFutCer;

      const rindeKgHa = rindeHistoricoVal * 100;
      const rendimientoTotal = rindeKgHa * currentFormData.has * (cotizFutCerVal / cotizDivisor);
      const tendencia = rendimientoTotal - gastosTotal;

      let gastosMonAlt = 0, rendimientoMonAlt = 0, tendenciaMonAlt = 0;
      if (currentFormData.cotizMonAlt > 0) {
        const factor = currentFormData.operacMonAlt === 'dividir' ? (1 / currentFormData.cotizMonAlt) : currentFormData.cotizMonAlt;
        gastosMonAlt = gastosTotal * factor;
        rendimientoMonAlt = rendimientoTotal * factor;
        tendenciaMonAlt = tendencia * factor;
      }

      return {
        ...currentFormData,
        gastosMonLocal: gastosTotal,
        gastosMonAlt,
        rendimientoMonLocal: rendimientoTotal,
        rendimientoMonAlt,
        tendenciaMonLocal: tendencia,
        tendenciaMonAlt,
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validar campos requeridos
      if (!formData.campanaId || !formData.campoId || !formData.loteId) {
        alert(t("please_fill_required_fields"));
        setSaving(false);
        return;
      }

      // Obtener información adicional
      const selectedCampaign = campaigns.find(c => c._id === formData.campanaId);
      const selectedField = fields.find(f => f._id === formData.campoId);
      const selectedLot = selectedField?.lotes.find((lot) =>
        getLotIdentifiers(lot, formData.loteId).includes(normalizeId(formData.loteId)),
      );
      const selectedCiclo = annualPlan || findMatchingCiclo({
        campanaId: formData.campanaId,
        campoId: formData.campoId,
        zafra: formData.zafra,
        lot: selectedLot,
        loteValue: formData.loteId,
      });

      if (!selectedCiclo?._id) {
        throw new Error('No matching planning cycle found for the selected campaign, field, lot and harvest');
      }

      const cultivoId = selectedCiclo.cultivoId || '';
      const selectedCrop = crops.find(c => c._id === cultivoId);

      // Calcular cosecha estimada en toneladas
      const rindeHistoricoVal = typeof formData.rindeHistorico === 'string' ? parseFloat(formData.rindeHistorico) || 0 : formData.rindeHistorico;
      const rindeKgHa = rindeHistoricoVal * 100; // Convertir quintales a kg
      const cosechaEstimadaTn = (rindeKgHa * formData.has) / 1000; // Convertir a toneladas

      // Build maps of insumoId/servicioId -> valorUnidad to persist
      const valorizacionInsumos: Record<string, number> = {};
      insumos.forEach(i => { if (i.insumoId && i.valorUnidad) valorizacionInsumos[i.insumoId] = i.valorUnidad; });
      const valorizacionServicios: Record<string, number> = {};
      servicios.forEach(s => { if (s.servicioId && s.valorUnidad) valorizacionServicios[s.servicioId] = s.valorUnidad; });

      await updateAnnualPlanValorization({
        _id: isEditMode ? id! : selectedCiclo._id,
        _rev: selectedCiclo._rev,
        campanaId: formData.campanaId,
        campanaName: selectedCampaign?.name || '',
        zafra: formData.zafra,
        campoId: formData.campoId,
        campoNombre: selectedField?.nombre || '',
        loteId: selectedLot?.properties.uuid || formData.loteId,
        loteNombre: selectedLot?.properties.nombre || formData.loteId,
        has: formData.has,
        cultivoId: cultivoId,
        cultivoNombre: cultivoNombre || (selectedCrop as any)?.crop || (selectedCrop as any)?.name || '',
        cosechaEstimada: cosechaEstimadaTn,
        status: 'abierto',
        rindeHistorico: rindeHistoricoVal,
        cotizFutCer: typeof formData.cotizFutCer === 'string' ? parseFloat(formData.cotizFutCer) || 0 : formData.cotizFutCer,
        monedaAlterId: formData.monedaAlterId,
        cotizMonAlt: formData.cotizMonAlt,
        operacMonAlt: formData.operacMonAlt,
        valorizada: true,
        accountId: user?.accountId || '',
        created: selectedCiclo.created || { userId: user?.id || '', date: new Date().toISOString() },
        modified: { userId: user?.id || '', date: new Date().toISOString() },
      } as IAnnualPlan, valorizacionInsumos, valorizacionServicios);

      navigate("/init/overview/annual-plan-valorization");
    } catch (error) {
      console.error("Error saving valorization:", error);
      alert(t("error_saving_valorization"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/init/overview/annual-plan-valorization");
  };

  const handleNext = () => {
    const nextStep = activeStep + 1;
    setActiveStep(nextStep);
    if (nextStep > maxStepReached) {
      setMaxStepReached(nextStep);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    } else {
      navigate("/init/overview/annual-plan-valorization");
    }
  };

  const handleStepClick = (step: number) => {
    if (step <= maxStepReached) {
      setActiveStep(step);
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex === activeStep) return 'current';
    if (stepIndex < activeStep) return 'complete';
    if (stepIndex <= maxStepReached) return 'available';
    return 'upcoming';
  };

  // Función removida - ya no necesitamos el botón refresh

  const handleExportToExcel = async () => {
    try {
      // Importar dinámicamente la función de exportación
      const { exportValorizationToExcel } = await import('../../helpers/excelExport');

      // Obtener información necesaria para la exportación
      const selectedCampaign = campaigns.find(c => c._id === formData.campanaId);
      const selectedField = fields.find(f => f._id === formData.campoId);
      const selectedLot = selectedField?.lotes.find((lot) =>
        getLotIdentifiers(lot, formData.loteId).includes(normalizeId(formData.loteId)),
      );
      const selectedCiclo = annualPlan || findMatchingCiclo({
        campanaId: formData.campanaId,
        campoId: formData.campoId,
        zafra: formData.zafra,
        lot: selectedLot,
        loteValue: formData.loteId,
      });
      const cultivoId = selectedCiclo?.cultivoId || '';
      const selectedCrop = crops.find(c => c._id === cultivoId);

      {/* Crear objeto de valorización para exportar */ }
      const rindeHistoricoVal = typeof formData.rindeHistorico === 'string' ? parseFloat(formData.rindeHistorico) || 0 : formData.rindeHistorico;
      const valorization: IAnnualPlanValorization = {
        _id: 'temp',
        annualPlanId: `plan_${formData.campanaId}_${formData.campoId}_${formData.loteId}`,
        campanaId: formData.campanaId,
        campanaName: selectedCampaign?.name || '',
        zafra: formData.zafra,
        campoId: formData.campoId,
        campoName: selectedField?.nombre || '',
        loteId: selectedLot?.properties.uuid || formData.loteId,
        loteName: selectedLot?.properties.nombre || formData.loteId,
        has: formData.has,
        cultivoId: cultivoId,
        cultivoName: (selectedCrop as any)?.name || '',
        cosechaEstimada: (rindeHistoricoVal * 100 * formData.has) / 1000,
        tendenciaMonLocal: formData.tendenciaMonLocal,
        status: 'abierto',
        accountId: user?.accountId || '',
        created: {
          userId: user?.id || '',
          date: new Date().toISOString()
        },
        modified: {
          userId: user?.id || '',
          date: new Date().toISOString()
        }
      };

      // Exportar a Excel
      exportValorizationToExcel({
        valorization,
        insumos,
        servicios,
        formData
      }, t);

    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert(t("error_exporting_to_excel"));
    }
  };

  const formatCurrency = (value: number, currency?: string) => {
    const curr = currency || localCurrency;
    const locale = isBrazilMode ? 'pt-BR' : 'es-AR';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 0) => {
    const locale = isBrazilMode ? 'pt-BR' : 'es-AR';
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  // Calcular totales en tiempo real sin modificar estado
  const calcularTotalesEnTiempoReal = () => {
    const gastosInsumos = insumos.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
    const gastosServicios = servicios.reduce((sum, item) => sum + (item.valorTotal || 0), 0);
    const gastosTotal = gastosInsumos + gastosServicios;

    // Calcular rendimiento
    const rindeHistoricoVal = typeof formData.rindeHistorico === 'string' ? parseFloat(formData.rindeHistorico) || 0 : formData.rindeHistorico;
    const cotizFutCerVal = typeof formData.cotizFutCer === 'string' ? parseFloat(formData.cotizFutCer) || 0 : formData.cotizFutCer;

    const rindeKgHa = rindeHistoricoVal * 100;
    const rendimientoTotal = rindeKgHa * formData.has * (cotizFutCerVal / cotizDivisor);

    // Calcular tendencia
    const tendencia = rendimientoTotal - gastosTotal;

    return {
      gastosTotal,
      rendimientoTotal,
      tendencia,
      gastosInsumos,
      gastosServicios
    };
  };

  const getCropName = () => {
    return cultivoNombre || '';
  };

  const loadPlanificationData = async (campanaId: string, campoId: string, loteId: string, zafra: string, targetCiclos?: ICiclosPlanificacion[]) => {
    try {

      // Limpiar arrays al inicio
      setInsumos([]);
      setServicios([]);

      // Extract saved valorization prices from the ciclo (if previously saved)
      const savedInsumosPrices: Record<string, number> = (targetCiclos?.[0] as any)?.valorizacionInsumos || {};
      const savedServiciosPrices: Record<string, number> = (targetCiclos?.[0] as any)?.valorizacionServicios || {};

      let allCampaignCycles = (targetCiclos || []).filter(Boolean);
      if (allCampaignCycles.length === 0 && loteId) {
        const field = fields.find((currentField) => currentField._id === campoId);
        const lot = field?.lotes?.find((candidateLot: any) =>
          getLotIdentifiers(candidateLot, loteId).includes(normalizeId(loteId)),
        );
        const possibleLoteIds = getLotIdentifiers(lot, loteId);
        const matchingCycles = getCyclesForSelection(campanaId, zafra, campoId).filter((cycle) =>
          possibleLoteIds.includes(normalizeId(cycle.loteId)),
        );

        allCampaignCycles = matchingCycles.length > 0 ? [matchingCycles[0]] : [];
      }

      if (allCampaignCycles.length === 0) {
        setInsumos([]);
        setServicios([]);
        return;
      }

      // Collect activity IDs from all cycles
      let allActivitiesIds: string[] = [];
      for (const cycle of allCampaignCycles) {
        allActivitiesIds = [...allActivitiesIds, ...(cycle.actividadesIds || [])];
      }

      const uniqueActivitiesIds = [...new Set(allActivitiesIds)];

      const planDb = dbContext.fields as PouchDB.Database<IActividadPlanificacion>;
      const cycleIds = allCampaignCycles.map((cycle) => cycle?._id).filter(Boolean);
      const actividadesResult = uniqueActivitiesIds.length > 0
        ? await planDb.allDocs({
            keys: uniqueActivitiesIds,
            include_docs: true
          })
        : { rows: [] };
      const actividadesByCicloResult = cycleIds.length > 0
        ? await planDb.allDocs({
            include_docs: true,
            startkey: 'planactividad:',
            endkey: 'planactividad:\ufff0',
          })
        : { rows: [] };

      const validActivitiesMap = new Map<string, typeof actividadesResult.rows[number]>();

      actividadesResult.rows
        .filter((row) => row.doc && !row.error)
        .forEach((row) => {
          if (row.doc?._id) {
            validActivitiesMap.set(row.doc._id, row);
          }
        });

      if (validActivitiesMap.size === 0) {
        actividadesByCicloResult.rows
          .filter((row) => row.doc && !row.error && cycleIds.includes((row.doc as IActividadPlanificacion).cicloId))
          .forEach((row) => {
            if (row.doc?._id) {
              validActivitiesMap.set(row.doc._id, row as typeof actividadesResult.rows[number]);
            }
          });
      }

      const validActivities = Array.from(validActivitiesMap.values());

      // Collect insumo and servicio line IDs
      let allInsumosIds: string[] = [];
      let allServiciosIds: string[] = [];
      let insumosData: IInsumosxAnnualPlan[] = [];
      let serviciosData: IServicxAnnualPlan[] = [];

      for (const row of validActivities) {
        if (row.doc) {
          const actividad = row.doc as IActividadPlanificacion;
          if (actividad.insumosLineasIds?.length) allInsumosIds.push(...actividad.insumosLineasIds);
          if (actividad.laboresLineasIds?.length) allServiciosIds.push(...actividad.laboresLineasIds);
        }
      }

      // Load insumo lines
      if (allInsumosIds.length > 0) {
        const lineasInsumos = await getLineasInsumos(allInsumosIds);
        const validInsumos = lineasInsumos.filter(linea => linea && linea.insumoId);

        // Agrupar insumos por ID de insumo para consolidar cantidades
        const insumosGrouped = new Map<string, {
          insumoId: string;
          activityType: string;
          name: string;
          totalCantidad: number;
          totalHectareas: number;
        }>();

        await Promise.all(
          validInsumos.map(async (linea, index) => {
            if (!linea.insumoId) return;

            let insumoName = `${t('supplies')} ${index + 1}`;
            try {
              const insumoDoc = await dbContext.supplies.get(linea.insumoId) as any;
              insumoName = insumoDoc.name || insumoDoc.description || insumoDoc.brand || insumoDoc.nombre || insumoName;
            } catch {
              try {
                const allSupplies = await dbContext.supplies.allDocs({ include_docs: true });
                const matchingSupply = allSupplies.rows.find((row: any) =>
                  row.doc && (row.id === linea.insumoId || (row.doc as any).code === linea.insumoId)
                );
                if (matchingSupply?.doc) {
                  const doc = matchingSupply.doc as any;
                  insumoName = doc.name || doc.description || doc.brand || doc.nombre || insumoName;
                }
              } catch { /* skip */ }
            }

            const activity = getActivityForLine(linea, validActivities);
            const labor = getActivityTypeForLine(linea, validActivities);
            const cantidad = Number(linea.totalCantidad ?? linea.dosis ?? 0);
            const hectareasAplicadas = Number(linea.hectareas || activity?.area || formData.has || 0);
            const groupKey = `${linea.insumoId}::${labor}`;

            if (insumosGrouped.has(groupKey)) {
              const existing = insumosGrouped.get(groupKey)!;
              existing.totalCantidad += cantidad;
              existing.totalHectareas += hectareasAplicadas;
            } else {
              insumosGrouped.set(groupKey, {
                insumoId: linea.insumoId,
                activityType: labor,
                name: insumoName,
                totalCantidad: cantidad,
                totalHectareas: hectareasAplicadas,
              });
            }
          })
        );

        // Convertir a array de IInsumosxAnnualPlan
        console.log('📋 Converting to final insumos array...');
        insumosData = Array.from(insumosGrouped.values()).map((item, index) => {
          const cantidadPorHa = item.totalHectareas > 0 ? item.totalCantidad / item.totalHectareas : item.totalCantidad;
          const savedPrice = savedInsumosPrices[item.insumoId] || 0;
          const valorTotal = savedPrice * item.totalCantidad;

          return {
            _id: `valorization_insumo_${index}`,
            annualPlanId: 'temp_plan_id',
            labor: item.activityType,
            item: item.name,
            insumoId: item.insumoId,
            cantidad: item.totalCantidad,
            cantidadHa: cantidadPorHa,
            valorUnidad: savedPrice,
            valorTotal,
            accountId: '',
            created: { userId: '', date: '' },
            modified: { userId: '', date: '' },
          };
        });
      }

      // Load servicio lines
      if (allServiciosIds.length > 0) {
        const lineasServicios = await getLineasServicios(allServiciosIds);
        const validServicios = lineasServicios.filter(linea => linea && linea.laborId);

        const serviciosGrouped = new Map<string, {
          laborId: string;
          activityType: string;
          name: string;
          descripcion: string;
          totalHectareas: number;
        }>();

        await Promise.all(
          validServicios.map(async (linea, index) => {
            if (!linea.laborId) return;

            const persistedLaborValue = (linea as any).laborNombre ?? (linea as any).servicio ?? (linea as any).labor;
            let laborName = resolveLaborServiceName(persistedLaborValue);
            if (!laborName) {
              try {
                const laborDoc = await dbContext.laborsServices.get(linea.laborId) as any;
                laborName = resolveLaborServiceName(laborDoc);
              } catch {
                const labor = getLaborFromId(linea.laborId);
                laborName = resolveLaborServiceName(labor);
              }
            }

            if (!laborName) {
              laborName = `${t('service')} ${index + 1}`;
            }

            const activity = getActivityForLine(linea, validActivities);
            const activityType = getActivityTypeForLine(linea, validActivities);
            const hectareasAplicadas = Number(linea.hectareas || activity?.area || formData.has || 0);
            const groupKey = `${linea.laborId}::${activityType}`;

            if (serviciosGrouped.has(groupKey)) {
              const existing = serviciosGrouped.get(groupKey)!;
              existing.totalHectareas += hectareasAplicadas;
              if (linea.comentario) existing.descripcion = linea.comentario;
            } else {
              serviciosGrouped.set(groupKey, {
                laborId: linea.laborId,
                activityType,
                name: laborName,
                descripcion: linea.comentario || t('service'),
                totalHectareas: hectareasAplicadas,
              });
            }
          })
        );

        // Convertir a array de IServicxAnnualPlan
        serviciosData = Array.from(serviciosGrouped.values()).map((item, index) => {
          const savedPrice = savedServiciosPrices[item.laborId] || 0;
          const valorTotal = savedPrice * item.totalHectareas;
          return {
            _id: `valorization_servicio_${index}`,
            annualPlanId: 'temp_plan_id',
            labor: item.activityType,
            item: item.name,
            servicioId: item.laborId,
            descripcion: item.descripcion,
            cantidad: item.totalHectareas,
            cantidadHa: item.totalHectareas,
            valorUnidad: savedPrice,
            valorTotal,
            accountId: '',
            created: { userId: '', date: '' },
            modified: { userId: '', date: '' },
          };
        });
      }

      setInsumos(insumosData);
      setServicios(serviciosData);
      recalcularTotalesConDatos(insumosData, serviciosData);

    } catch (error) {
      console.error('Error loading planification data:', error);
      setInsumos([]);
      setServicios([]);
    }
  };

  const getActivityForLine = (linea: any, activities: any[]): IActividadPlanificacion | null => {
    for (const row of activities) {
      if (row.doc) {
        const actividad = row.doc as IActividadPlanificacion;
        if (actividad.insumosLineasIds?.includes(linea._id) ||
          actividad.laboresLineasIds?.includes(linea._id)) {
          return actividad;
        }
      }
    }

    return null;
  };

  const getActivityTypeForLine = (linea: any, activities: any[]): string => {
    // Buscar a qué actividad pertenece esta línea para obtener el tipo
    for (const row of activities) {
      if (row.doc) {
        const actividad = row.doc as IActividadPlanificacion;
        if (actividad.insumosLineasIds?.includes(linea._id) ||
          actividad.laboresLineasIds?.includes(linea._id)) {
          return getActivityTypeName(actividad.tipo);
        }
      }
    }
    return t('activity');
  };

  const getActivityTypeName = (tipo: string): string => {
    const tipos: { [key: string]: string } = {
      'siembra': t('activityType_siembra'),
      'cosecha': t('activityType_cosecha'),
      'aplicacion': t('activityType_aplicacion'),
      'preparado': t('activityType_preparado'),
      'otro': t('other')
    };
    return tipos[tipo] || t('activity');
  };

  const getStepStyle = (status: string) => {
    switch (status) {
      case 'complete':
        return {
          background: '#22c55e',
          color: 'white',
          border: 'none',
        };
      case 'current':
        return {
          background: 'white',
          color: '#22c55e',
          border: '2px solid #22c55e',
        };
      case 'upcoming':
        return {
          background: '#f3f4f6',
          color: '#6b7280',
          border: 'none',
        };
      default:
        return {
          background: '#e5e7eb',
          color: '#6b7280',
          border: 'none',
        };
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Parameters step
        return renderParametersStep();
      case 1: // Values step
        return renderValuesStep();
      case 2: // Trend step
        return renderTrendStep();
      default:
        return null;
    }
  };

  const renderParametersStep = () => (
    <>
      <Typography variant="h6" gutterBottom>
        {t("valorization_parameters")}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>{t("campaign")}</InputLabel>
            <Select
              value={formData.campanaId}
              onChange={(e) => handleFieldChange('campanaId', e.target.value)}
              label={t("campaign")}
              disabled={isEditMode}
            >
              {campaigns.map((campaign) => (
                <MenuItem key={campaign._id} value={campaign._id}>
                  {campaign.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>{t("harvest")}</InputLabel>
            <Select
              value={formData.zafra}
              onChange={(e) => handleFieldChange('zafra', e.target.value)}
              label={t("harvest")}
              disabled={isEditMode || !formData.campanaId || availableZafras.length === 0}
            >
              {availableZafras.length === 0 ? (
                <MenuItem value="" disabled>
                  {t("no_harvests_available")}
                </MenuItem>
              ) : (
                availableZafras.map((zafra) => (
                  <MenuItem key={zafra.id} value={zafra.name}>
                    {zafra.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>{t("field")}</InputLabel>
            <Select
              value={formData.campoId}
              onChange={(e) => handleFieldChange('campoId', e.target.value)}
              label={t("field")}
              disabled={isEditMode || !formData.campanaId}
            >
              {availableCampos.map((campo) => (
                <MenuItem key={campo._id} value={campo._id}>
                  {campo.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>{t("lot")}</InputLabel>
            <Select
              value={formData.loteId}
              onChange={(e) => handleLoteChange(e.target.value as string)}
              label={t("lot")}
              disabled={isEditMode || !formData.campoId}
            >
              {availableLotes.length === 0 ? (
                <MenuItem value="" disabled>
                  {t("no_lots_available")}
                </MenuItem>
              ) : (
                availableLotes.map((lote) => (
                  <MenuItem key={lote.properties.uuid || lote.properties.nombre} value={lote.properties.nombre}>
                    {lote.properties.nombre}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            size="small"
            label={t("hectares")}
            value={formData.has}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          {availableCultivos.length > 0 ? (
            <FormControl fullWidth size="small">
              <InputLabel>{t("crop")}</InputLabel>
              <Select
                value={annualPlan?.cultivoId || ''}
                onChange={(e) => handleCultivoChange(e.target.value as string)}
                label={t("crop")}
              >
                {availableCultivos.map((opt) => (
                  <MenuItem key={opt.ciclo.cultivoId} value={opt.ciclo.cultivoId}>
                    {opt.cropName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <FormControl fullWidth size="small">
              <InputLabel>{t("crop")}</InputLabel>
              <Select
                value={cultivoNombre}
                onChange={(e) => setCultivoNombre(e.target.value as string)}
                label={t("crop")}
                disabled={isEditMode}
              >
                {crops.map((crop: any) => (
                  <MenuItem key={crop._id} value={crop.crop || crop.descriptionES || crop.name || ''}>
                    {crop.crop || crop.descriptionES || crop.name || crop._id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            required
            type="number"
            label={t("historical_yield_qq_ha")}
            value={formData.rindeHistorico}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setFormData(prev => ({ ...prev, rindeHistorico: value === '' ? 0 : parseFloat(value) || 0 }));
              }
            }}
            onBlur={() => setTimeout(() => recalcularTotales(), 0)}
            inputProps={{ style: { textAlign: 'right' } }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            required
            type="number"
            label={isBrazilMode ? `${t("future_cereal_quote")} (Saca)` : `${t("future_cereal_quote")} (Tn)`}
            value={formData.cotizFutCer}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setFormData(prev => ({ ...prev, cotizFutCer: value === '' ? 0 : parseFloat(value) || 0 }));
              }
            }}
            onBlur={() => setTimeout(() => recalcularTotales(), 0)}
            inputProps={{ style: { textAlign: 'right' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {isBrazilMode ? 'R$' : '$'}
                </InputAdornment>
              ),
            }}
            helperText={isBrazilMode ? 'R$/Saca (60kg)' : t("local_currency_per_ton")}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Autocomplete
            size="small"
            options={countries}
            getOptionLabel={(option) => {
              const desc = i18n.language.startsWith('pt') ? option.descriptionPT
                : i18n.language === 'en' ? option.descriptionEN
                : option.descriptionES;
              return desc ? `${desc} (${option.currency})` : (option.currency || '');
            }}
            value={countries.find((c: any) => c.currency === formData.monedaAlterId) || null}
            onChange={(e, value) => handleFieldChange('monedaAlterId', value?.currency || '')}
            renderInput={(params) => (
              <TextField {...params} label={t("alternative_currency")} />
            )}
          />
        </Grid>
        {formData.monedaAlterId && (
          <>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label={`${t("alternative_currency_quote")} (${formData.monedaAlterId})`}
                value={formData.cotizMonAlt || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    handleFieldChange('cotizMonAlt', value === '' ? 0 : parseFloat(value) || 0);
                  }
                }}
                inputProps={{ style: { textAlign: 'right' } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{t("operation")}</InputLabel>
                <Select
                  value={formData.operacMonAlt}
                  onChange={(e) => handleFieldChange('operacMonAlt', e.target.value)}
                  label={t("operation")}
                >
                  <MenuItem value="dividir">{t("divide") || 'Dividir'}</MenuItem>
                  <MenuItem value="multiplicar">{t("multiply") || 'Multiplicar'}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        )}
      </Grid>
    </>
  );

  const renderValuesStep = () => (
    <>
      <Typography variant="h6" gutterBottom>
        {t("value_loading")}
      </Typography>

      {/* Insumos */}
      <Box mb={3}>
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{
            bgcolor: 'primary.main',
            color: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: '50%',
            fontWeight: 'bold'
          }}>
            A
          </Box>
          {t("supplies")}
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("labor")}</TableCell>
                <TableCell>{t("item")}</TableCell>
                <TableCell align="right">{t("quantity_ha")}</TableCell>
                <TableCell align="right">{t("unit_value")}</TableCell>
                <TableCell align="right">{t("total_value")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {insumos.map((insumo, index) => (
                <TableRow key={insumo._id}>
                  <TableCell>{insumo.labor}</TableCell>
                  <TableCell>{insumo.item}</TableCell>
                  <TableCell align="right">{formatNumber(insumo.cantidadHa || 0, 2)} Kg/Ha</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={insumo.valorUnidad || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          handleInsumoValorChange(index, parseFloat(value) || 0);
                        }
                      }}
                      sx={{ width: 120 }}
                      InputProps={{
                        startAdornment: <span style={{ marginRight: 4 }}>$</span>
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(insumo.valorTotal || 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Servicios */}
      <Box>
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{
            bgcolor: 'primary.main',
            color: 'white',
            px: 1.5,
            py: 0.5,
            borderRadius: '50%',
            fontWeight: 'bold'
          }}>
            B
          </Box>
          {t("services")}
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("labor")}</TableCell>
                <TableCell>{t("item")}</TableCell>
                <TableCell align="right">{t("quantity_ha")}</TableCell>
                <TableCell align="right">{t("unit_value")}</TableCell>
                <TableCell align="right">{t("total_value")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servicios.map((servicio, index) => (
                <TableRow key={servicio._id}>
                  <TableCell>{servicio.labor}</TableCell>
                  <TableCell>{servicio.item}</TableCell>
                  <TableCell align="right">{formatNumber(servicio.cantidad || 0, 2)} Ha</TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={servicio.valorUnidad || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          handleServicioValorChange(index, parseFloat(value) || 0);
                        }
                      }}
                      sx={{ width: 120 }}
                      InputProps={{
                        startAdornment: <span style={{ marginRight: 4 }}>$</span>
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(servicio.valorTotal || 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {formData.has > 0 && (
        <MuiAlert severity="info" sx={{ mt: 3 }}>
          <Typography variant="caption" display="block">
            <strong>{t("hectaresSelected")}: {formatNumber(formData.has, 2)} ha</strong>
          </Typography>
        </MuiAlert>
      )}
    </>
  );

  const renderTrendStep = () => {
    const totales = calcularTotalesEnTiempoReal();
    return (
      <>
        <Typography variant="h6" gutterBottom>
          {t("trend")} ($)
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t("expenses")}
              </Typography>
              <Typography variant="h5">
                {localCurrency} {formatNumber(totales.gastosTotal)}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {t("supplies")}: {formatCurrency(totales.gastosInsumos)} | {t("services")}: {formatCurrency(totales.gastosServicios)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t("yield")}
              </Typography>
              <Typography variant="h5">
                {localCurrency} {formatNumber(totales.rendimientoTotal)}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {formData.rindeHistorico} qq/ha × {formData.has} ha × ${formData.cotizFutCer}/{isBrazilMode ? 'saca' : 'tn'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                border: '2px solid',
                borderColor: totales.tendencia >= 0 ? 'success.main' : 'error.main',
                borderRadius: 1,
                bgcolor: totales.tendencia >= 0 ? 'success.light' : 'error.light',
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                {t("trend")}
              </Typography>
              <Typography variant="h4" color={totales.tendencia >= 0 ? 'success.dark' : 'error.dark'}>
                {localCurrency} {formatNumber(totales.tendencia)}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {totales.tendencia >= 0 ? '✅ ' + t('profitable') : '❌ ' + t('notProfitable')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </>
    );
  };

  if (loading) {
    return <Loading loading />;
  }

  return (
    <TemplateLayout viewMap={false}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Card className="shadow-lg">
          {/* Header */}
          <CardHeader
            className="p-0"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              borderTopLeftRadius: '0.5rem',
              borderTopRightRadius: '0.5rem',
            }}
          >
            <div className="p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle bg-white bg-opacity-25 d-flex align-items-center justify-content-center"
                    style={{ width: '60px', height: '60px' }}
                  >
                    <TrendingUp size={35} color="white" />
                  </div>
                  <div className="text-white">
                    <h4 className="mb-0 fw-bold">{t("annual_plan_valorization")}</h4>
                    <small className="opacity-75">
                      {isEditMode ? t("editMode") : t("createMode")}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Stepper */}
          <div className="px-4 py-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              {steps.map((step, index) => {
                const status = getStepStatus(index);
                return (
                  <div
                    key={step.key}
                    className="text-center position-relative"
                    style={{ flex: 1 }}
                  >
                    <div
                      onClick={() => handleStepClick(index)}
                      className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                      style={{
                        width: '40px',
                        height: '40px',
                        cursor: index <= maxStepReached ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                        ...getStepStyle(status),
                      }}
                    >
                      {status === 'complete' ? (
                        <Check size={20} />
                      ) : (
                        <span style={{ fontWeight: '600' }}>{index + 1}</span>
                      )}
                    </div>

                    <div className="mt-2">
                      <small
                        className="text-muted"
                        style={{
                          fontWeight: status === 'current' ? '600' : '400',
                        }}
                      >
                        {step.label}
                      </small>
                    </div>

                    {index < steps.length - 1 && (
                      <Progress
                        value={index < activeStep ? 100 : 0}
                        color="success"
                        style={{
                          position: 'absolute',
                          top: '20px',
                          left: '50%',
                          width: '100%',
                          height: '2px',
                          zIndex: -1,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <CardBody className="p-4">
            {renderStepContent()}
          </CardBody>

          {/* Actions */}
          <CardFooter className="bg-light d-flex justify-content-between align-items-center p-4">
            <Button
              color="light"
              onClick={handleBack}
              className="d-flex align-items-center gap-2"
            >
              <ChevronLeft size={16} />
              {activeStep === 0 ? t('back') : t('previous')}
            </Button>

            <div className="d-flex gap-2">
              {activeStep < steps.length - 1 && (
                <Button
                  color="success"
                  onClick={handleNext}
                  className="d-flex align-items-center gap-2"
                >
                  {t('next')}
                  <ChevronRight size={16} />
                </Button>
              )}

              {activeStep === steps.length - 1 && (
                <>
                  {isEditMode && (
                    <Button
                      color="outline-success"
                      onClick={handleExportToExcel}
                      className="d-flex align-items-center gap-2"
                    >
                      <Package size={16} />
                      {t('export_to_excel')}
                    </Button>
                  )}
                  <Button
                    color="success"
                    onClick={handleSave}
                    disabled={saving}
                    className="d-flex align-items-center gap-2"
                  >
                    {saving ? (
                      <Spinner size="sm" />
                    ) : (
                      <Check size={16} />
                    )}
                    {t('save')}
                  </Button>
                </>
              )}
            </div>
          </CardFooter>
        </Card>
      </Container>
    </TemplateLayout>
  );
};
