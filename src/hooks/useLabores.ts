import { useState } from "react";
import { useTranslation } from "react-i18next";

const tablaLabores = [
  { name: "laborSeeding", id: "1" },
  { name: "laborHarvesting", id: "3" },
  { name: "laborAerialApplication", id: "4" },
  { name: "laborGroundApplication", id: "5" },
  { name: "laborChisel", id: "6" },
  { name: "laborDisk", id: "7" },
  { name: "laborBroadcastFertilization", id: "8" },
  { name: "laborIrrigation", id: "9" },
];

export const useLabores = () => {
  const { t } = useTranslation();
  const [labores, setLabores] = useState(tablaLabores);

  const getLaborLabelFromId = (id) => {
    let c = labores.find((a) => a.id === id);
    if (c) {
      return t(c.name);
    }
  };

  const getLaborFromId = (id) => {
    const labor = labores.find((l) => l.id === id);
    if (labor) {
      return {
        ...labor,
        displayName: t(labor.name)
      };
    }
    return undefined;
  };

  return { labores, getLaborLabelFromId, getLaborFromId };
};