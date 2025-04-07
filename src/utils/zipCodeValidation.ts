import Swal from "sweetalert2";
import { getLocalityAndStateByZipCode } from "./getDataZipCode";
import { CountryCode } from "../types";

type LocalityAndState = {
  locality: string;
  state: string;
};

export const fetchBrazilZipCode = async (zipCode: string) => {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    console.log("Datos de Brasil recibidos:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("Failed to fetch Brazil zip code data:", error);
    return null;
  }
};


const setMultipleFieldNames = (
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  fieldNames: string[],
  value: string
) => {
  fieldNames.forEach((name) => {
    handleInputChange({
      target: { name, value },
    } as React.ChangeEvent<HTMLInputElement>);
  });
};


export const onBlurZipCode = async (
  cp: string,
  pais: string,
  setLoadingZipCode: (loading: boolean) => void,
  setLocalities: (localities: string[]) => void,
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  t: (key: string) => string
) => {
  if (!cp.trim()) return;

  setLoadingZipCode(true);

  try {
    if (pais === CountryCode.ARGENTINA) {
      const localityAndStates: LocalityAndState[] = await getLocalityAndStateByZipCode("AR", cp);

      if (localityAndStates?.length) {
        const firstLocality = localityAndStates[0].locality || "Desconocido";
        const firstProvince = localityAndStates[0].state || "Desconocido";

        setLocalities(localityAndStates.map((x) => x.locality || "Desconocido"));

        setMultipleFieldNames(handleInputChange, ["localidad", "locality"], firstLocality);
        setMultipleFieldNames(handleInputChange, ["provincia", "province"], firstProvince);
      } else {
        throw new Error("El código postal no coincide con ningún registro en Argentina.");
      }

    } else if (pais === CountryCode.BRASIL) {
      const brazilData = await fetchBrazilZipCode(cp);

      if (brazilData) {
        const localidad = brazilData.localidade || "Desconocido";
        const provincia = `${brazilData.uf}${brazilData.estado ? ` - ${brazilData.estado}` : ""}`;
        const domicilio = [
          brazilData.logradouro,
          brazilData.complemento,
          brazilData.bairro,
        ]
          .filter(Boolean)
          .join(", ");

        setLocalities([localidad]);

        setMultipleFieldNames(handleInputChange, ["localidad", "locality"], localidad);
        setMultipleFieldNames(handleInputChange, ["provincia", "province"], provincia);
        setMultipleFieldNames(handleInputChange, ["domicilio", "address"], domicilio);
      } else {
        throw new Error("El código postal no coincide con ningún registro en Brasil.");
      }

    } else if (pais === CountryCode.PARAGUAY) {
      const localityAndStates: LocalityAndState[] = await getLocalityAndStateByZipCode("PRY", cp);

      if (localityAndStates?.length) {
        const firstLocality = localityAndStates[0].locality;
        const firstProvince = localityAndStates[0].state;

        setLocalities(localityAndStates.map((x) => x.locality));

        setMultipleFieldNames(handleInputChange, ["localidad", "locality"], firstLocality);
        setMultipleFieldNames(handleInputChange, ["provincia", "province"], firstProvince);
      } else {
        throw new Error("El código postal no coincide con ningún registro en Paraguay.");
      }

    } else {
      throw new Error("El país seleccionado no es válido o no está soportado.");
    }

  } catch (error) {
    console.error(error);

    Swal.fire({
      title: "Error",
      text: t("error_zip_code"),
      icon: "error",
    });
  } finally {
    setLoadingZipCode(false);
  }
};
