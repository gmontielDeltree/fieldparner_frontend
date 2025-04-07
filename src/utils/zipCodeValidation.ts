import Swal from "sweetalert2";
import { getLocalityAndStateByZipCode } from "./getDataZipCode";
import { CountryCode } from "../types"; 



export const fetchBrazilZipCode = async (zipCode: string) => {



  try {
    const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.json();
    console.log('Datos de Brasil recibidos:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("Failed to fetch Brazil zip code data:", error);
    return null;
  }
};

export const onBlurZipCode = async (
  cp: string,
  pais: string,
  setLoadingZipCode: (loading: boolean) => void,
  setLocalities: (localities: string[]) => void,
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  t: (key: string) => string
) => {


  if (cp !== "") {
    setLoadingZipCode(true);
    try {
      if (pais === CountryCode.ARGENTINA) {
        const localityAndStates = await getLocalityAndStateByZipCode("AR", cp);

        if (localityAndStates?.length) {
            const firstLocality = localityAndStates[0].locality || "Desconocido";
            const firstProvince = localityAndStates[0].state || "Desconocido";
          

          
            setLocalities(localityAndStates.map((x: { locality: any; }) => x.locality || "Desconocido"));
          
            handleInputChange({
              target: {
                name: "localidad",
                value: firstLocality,
              },
            } as React.ChangeEvent<HTMLInputElement>);
          
            handleInputChange({
              target: {
                name: "provincia",
                value: firstProvince,
              },
            } as React.ChangeEvent<HTMLInputElement>);
          } else {
          throw new Error("El código postal no coincide con ningún registro en Argentina.");
        }
      } else if (pais === CountryCode.BRASIL) {
        const brazilData = await fetchBrazilZipCode(cp);

        if (brazilData) {
          // 1. Actualiza las localidades disponibles
          setLocalities([brazilData.localidade]);
          
          // 2. Setea la localidad (Curitiba)
          handleInputChange({
            target: {
              name: "localidad",
              value: brazilData.localidade,
            },
          } as React.ChangeEvent<HTMLInputElement>);

          // 3. Setea la provincia (PR - Paraná)
          handleInputChange({
            target: {
              name: "provincia",
              value: `${brazilData.uf}${brazilData.estado ? ` - ${brazilData.estado}` : ''}`,
            },
          } as React.ChangeEvent<HTMLInputElement>);

          // 4. Construye la dirección completa
          const addressParts = [
            brazilData.logradouro,
            brazilData.complemento,
            brazilData.bairro
          ].filter(Boolean).join(', ');
          
          handleInputChange({
            target: {
              name: "domicilio",
              value: addressParts,
            },
          } as React.ChangeEvent<HTMLInputElement>);
        } else {
          throw new Error("El código postal no coincide con ningún registro en Brasil.");
        }
      }else if (pais === CountryCode.PARAGUAY) {
        const localityAndStates = await getLocalityAndStateByZipCode("PRY", cp);

        if (localityAndStates?.length) {
          const firstLocality = localityAndStates[0].locality;
          const firstProvince = localityAndStates[0].state;

          setLocalities(localityAndStates.map((x: { locality: any; }) => x.locality ));

          handleInputChange({
            target: {
              name: "localidad",
              value: firstLocality,
            },
          } as React.ChangeEvent<HTMLInputElement>);

          handleInputChange({
            target: {
              name: "provincia",
              value: firstProvince,
            },
          } as React.ChangeEvent<HTMLInputElement>);
        } else {
          throw new Error("El código postal no coincide con ningún registro en Paraguay.");
        }
      } else {
        throw new Error("El país seleccionado no es válido o no está soportado.");
      }

      setLoadingZipCode(false);
    } catch (error) {
      console.error(error);

      Swal.fire({
        title: "Error",
        text: t("error_zip_code"),
        icon: "error",
      });

      setLoadingZipCode(false);
    }
  }
};