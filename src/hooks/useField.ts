import { Field } from "@types";
import { useCallback, useState } from "react";
import { dbContext } from "../services";
import { useAppSelector } from ".";
import { Lot } from "../interfaces/field";
import { useTranslation } from "react-i18next";
import { NotificationService } from "../services/notificationService";

export const useField = () => {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [fields, setFields] = useState<Field[]>([]);
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [field, setField] = useState<Field>();

  const db = dbContext.fields;
  const getFields = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!user) throw new Error(t("userNotFound"));

      const result = await db.find({
        selector: { accountId: user.accountId },
      });

      const docs = result.docs.filter((d) => d._id.includes("campos_")) as Field[];
      setFields(docs);
    } catch (err) {
      NotificationService.showError(t("noFieldsRecords"), err, t("field_label"));
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [db, user, t]);


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
    if (filtrado) {
      return filtrado
    } else {
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