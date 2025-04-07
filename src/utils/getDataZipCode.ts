import { dbContext } from "../services";
import { CountryCode } from "../types";

export const getLocalityAndStateByZipCode = async (country: string, zipCode: string) => {
  if (!zipCode?.trim() || !country) {
    console.warn("Parámetros inválidos:", { country, zipCode });
    return [];
  }
  if (country === CountryCode.BRASIL) {
    return [];
  }
  try {
    const dbResult = await tryWithDbContext(country, zipCode);
    if (dbResult.length > 0) {
      return dbResult;
    }
  } catch (dbError) {
    console.warn("Error con dbContext. Intentando conexión directa...", dbError);
  }

  try {
    const cloudantResult = await tryDirectCloudantConnection(country, zipCode);
    if (cloudantResult.length === 0) {
      console.warn("No se encontraron resultados para:", { country, zipCode });
    }
    return cloudantResult;
  } catch (error) {
    console.error("Error en conexión directa:", error);
    return [];
  }
};


const tryWithDbContext = async (country: string, zipCode: string) => {
  const collection = getCollectionForCountry(country);
  if (!collection) return [];

  const result = await collection.find({
    selector: { "CP": zipCode },
    limit: 20 
  });

  return result.docs || [];
};

const tryDirectCloudantConnection = async (country: string, zipCode: string) => {
  const { baseUrl, credentials, dbName } = getCloudantConfig(country);
  const endpoint = `${baseUrl}/${dbName}/_find`;


  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(credentials)}`
    },
    body: JSON.stringify({
      selector: { "CP": zipCode },
      limit: 20
    })
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  return data.docs || [];
};


const getCollectionForCountry = (country: string) => {
  switch (country) {
    case CountryCode.ARGENTINA: return dbContext.zipCodeARG;
    case CountryCode.PARAGUAY: return dbContext.zipCodePRY;
    default: return null;
  }
};

const getCloudantConfig = (country: string) => {
  const FULL_URL = import.meta.env.VITE_TELEMETRIA_URL;
  if (!FULL_URL) throw new Error("VITE_TELEMETRIA_URL no definida");

  const [credentials, domain] = FULL_URL.includes('@') 
    ? FULL_URL.split('//')[1].split('@') 
    : ['', FULL_URL.split('//')[1]];

  return {
    baseUrl: `https://${domain.replace(/\/+$/, '')}`,
    credentials: credentials || `${import.meta.env.VITE_CLOUDANT_USER}:${import.meta.env.VITE_CLOUDANT_PASS}`,
    dbName: country === CountryCode.ARGENTINA ? 'zip-code-arg' : 'zip-code-pry'
  };
};