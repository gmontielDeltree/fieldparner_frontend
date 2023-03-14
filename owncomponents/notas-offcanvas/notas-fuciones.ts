import { uuidv7 } from 'uuidv7';
import { Attachment } from './../tipos/attachments';

export interface Nota {
    attachments : Attachment[]
}

export const nota_remover_adjunto = async (
    act: Nota,
    uuid: string
  ) => {
    act.attachments = act.attachments.filter((a) => a.uuid !== uuid);
    //return guardar_tr(act);
  };

export const nota_adjuntar_archivo = async (
    act: Nota,
    file: File
  ) => {
    if (act.attachments == null) {
      act.attachments = [];
    }
    act.attachments.push({ uuid: uuidv7(), filename: file.name });
    //return guardar_transfer(act);
  };