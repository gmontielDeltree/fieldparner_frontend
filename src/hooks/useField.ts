import Swal from "sweetalert2";
import { Field } from "@types";
import { useState } from "react";
import { dbContext } from "../services";
import { useAppSelector } from ".";
import { Lot } from "../interfaces/field";

export const useField = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [fields, setFields] = useState<Field[]>([]);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [field, setField] = useState<Field>();

  const db = dbContext.Fields;
  const getFields = async () => {
    setIsLoading(true);
    try {
      if (!user) throw new Error("User not found");

      // const result = await dbContext.fields.allDocs({ include_docs: true });
      const result = await db.find({
        selector: { accountId: user.accountId }, //user?.accountId }
      });

      // const vehiculos = response.map((v: any) => v.content);
      if (result.docs.length) {
        const documents = result.docs.map((doc) => doc);
        const d: Field[] = documents.filter((d) => d._id.includes("campos_"));
        // console.log("DSDSDSSDSDSDSDS",d)
        setFields(d);
      }

      setIsLoading(false);
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "No hay registro de Campos.", "error");
      setIsLoading(false);
      if (error) setError(error);
    }
  };

  const getField = async (id: string) => {
    return db.get(id).then((d) => setField(d));
  };

  const saveField = async (doc: Field) => {
    doc.accountId = user?.accountId || "test";
    return db.put(doc);
  };

  const deleteField = async (doc: Field) => {
    return db.remove(doc);
  };

  const addLotToField = async (field: Field, lot: Lot) => {
    field.lotes.push(lot);
    return saveField(field);
  };

  const removeLotFromField = async (field: Field, lot: Lot) => {
    let lotes = field.lotes;
    let filtrado = lotes.filter((l) => l.id !== lot.id);
    field.lotes = filtrado;
    return saveField(field);
  };

  const getLotFromField = async (field: Field, lotId: string) => {
    let lotes = field.lotes;
    let filtrado = lotes.find((l) => l.id === lotId);
    if(filtrado){
      return filtrado
    }else{
      return undefined
    }
  };

  return {
    //* Props
    fields,
    error,
    field,
    isLoading,

    //*Methods
    getFields,
    getField,
    saveField,
    getLotFromField,
    deleteField,
    addLotToField,
    removeLotFromField,
  };
};
