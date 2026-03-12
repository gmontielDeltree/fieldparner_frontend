import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "../interfaces/input";
import { getInputListLocal } from "../helpers/input";

const useInputs = (db: PouchDB.Database) => {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState<Input[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getInputListLocal(db)
      .then((data: any) => {
        setInputs(data);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error(t("errorLoadingInputs"), err);
        setError(err);
        setLoading(false);
      });
  }, [db]);

  return { inputs, loading, error };
};

export default useInputs;