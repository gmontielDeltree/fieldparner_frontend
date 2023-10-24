import React, { useEffect, useState } from "react";
import PouchDB from "pouchdb";
import { getEnvVariables } from "../../helpers/getEnvVariables";

import { Loading } from "../";
import { Deposit } from "../../types";

const remoteCouchDBUrl = getEnvVariables().VITE_COUCHDB_URL;
const myDBs = {
  deposits: "deposits",
  zipCodeArg: "zip-code-arg"
};

// const db = new PouchDB("Vehiculos-test");

export interface PouchDBComponentProps {
  children: React.ReactNode;
}

const PouchDBComponent: React.FC<PouchDBComponentProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("Iniciando SYNC");
    const syncDB = new PouchDB(myDBs.deposits)
      .sync(`${remoteCouchDBUrl}/${myDBs.deposits}`, {
        live: true,
        retry: true,
      })
      .on("complete", (complete: any) => {
        console.log("sync completa: ", complete);
      })
      .on("change", (change: any) => {
        console.log(
          "Cambios detectados en la base de datos remota deposits",
          change
        );
      })
      .on("error", (error: any) => {
        console.error("Error en la sincronización con CouchDB deposits", error);
      });

    // Limpia la sincronización cuando el componente se desmonta
    return () => {
      syncDB.cancel();
    };
  }, []);

  return (
    <>
      {/* <Loading loading={isLoading} /> */}
      {children}
    </>
  );
};

export default PouchDBComponent;
