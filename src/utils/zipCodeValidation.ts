import Swal from "sweetalert2";
import { getLocalityAndStateByZipCode } from "./getDataZipCode"; 

export const fetchBrazilZipCode = async (zipCode: string) => {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
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
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
) => {
  if (cp !== "") {
    setLoadingZipCode(true);
    try {
      console.log("Ejecutando1", pais);

      if (pais === "ARG" || pais === "AR") {
        console.log("Ejecutando2", pais);
        console.log("Código postal recibido:", cp);
        const localityAndStates = await getLocalityAndStateByZipCode("ARG", cp);
        console.log("Datos devueltos para Argentina:", localityAndStates);

        if (localityAndStates?.length) {
            const firstLocality = localityAndStates[0].locality || "Desconocido";
            const firstProvince = localityAndStates[0].state || "Desconocido";
          
            console.log("Actualizando localidad:", firstLocality);
            console.log("Actualizando provincia:", firstProvince);
          
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
      } else if (pais === "BR") {
        const brazilData = await fetchBrazilZipCode(cp);

        if (brazilData) {
          handleInputChange({
            target: {
              name: "localidad",
              value: brazilData.localidade || brazilData.logradouro,
            },
          } as React.ChangeEvent<HTMLInputElement>);

          handleInputChange({
            target: {
              name: "provincia",
              value: brazilData.uf,
            },
          } as React.ChangeEvent<HTMLInputElement>);

          handleInputChange({
            target: {
              name: "domicilio",
              value: `${brazilData.logradouro}, ${brazilData.bairro}`,
            },
          } as React.ChangeEvent<HTMLInputElement>);
        } else {
          throw new Error("El código postal no coincide con ningún registro en Brasil.");
        }
      } else if (pais === "PY" || pais === "PRY") {
        console.log("Ejecutando3", pais);
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
        text: "Revisa que el Código Postal sea correspondiente al país.",
        icon: "error",
      });

      setLoadingZipCode(false);
    }
  }
};