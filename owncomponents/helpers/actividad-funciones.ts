import { gbl_state } from "./../state";
import { uuidv7 } from "uuidv7";
import { Actividad } from "../depositos/depositos-types";

export const actividad_adjuntar_archivo = async (
  act: Actividad,
  file: File
) => {
  if (act.attachments == null) {
    act.attachments = [];
  }
  act.attachments.push({ uuid: uuidv7(), filename: file.name });
  return guardar_actividad(act);
};

export const actividad_remover_adjunto = async (
  act: Actividad,
  uuid: string
) => {
  act.attachments.filter((a) => a.uuid !== uuid);
  return guardar_actividad(act);
};

export const guardar_actividad = async (act: Actividad) => {

    return gbl_state.db.put(act).then((response)=>{
        act._rev = response.rev // Muto la rev
        return act //devulvo la act, quizas es util
    });
 
};
