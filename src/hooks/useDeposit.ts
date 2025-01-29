import Swal from "sweetalert2";
import { Deposit } from "../types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { dbContext } from "../services";
import { useAppSelector } from ".";

// const remoteCouchDBUrl = getEnvVariables().VITE_COUCHDB_URL;
// const myDBs = {
//     deposits: "deposits",
// };

// const DbDeposits = new PouchDB(myDBs.deposits);
// DbDeposits.sync(`${remoteCouchDBUrl}/${myDBs.deposits}`, { live: true, retry: true, });
// const syncDb = async () => await DbDeposits.sync(`${remoteCouchDBUrl}/${myDBs.deposits}`, { live: true, retry: true, });

export const useDeposit = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getDeposits = async () => {
    setIsLoading(true);
    try {
      const result = await dbContext.deposits.find({
        selector: { accountId: user?.accountId }
      });

      setIsLoading(false);
      if (result.docs) {
        const documents: Deposit[] = result.docs.map((row) => row as Deposit);
        setDeposits(documents);
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error al cargar documentos:", error);
    }
  };

  const createDeposit = async (newDeposit: Deposit) => {
    setIsLoading(true);
    try {
      if (!user) throw new Error("There is no user!!!!");

      const response = await dbContext.deposits.post({
        ...newDeposit,
        accountId: user.accountId
      });
      setIsLoading(false);

      if (response.ok) {
        Swal.fire("Deposito", "Agregado con exito.", "success");
      }
      navigate("/init/overview/deposit");
    } catch (error) {
      console.log("Error al crear el documento: ", error, newDeposit);
      Swal.fire("Ups", "Ocurrio un error inesperado ", "error");
      setIsLoading(false);
    }
  };

  const updateDeposit = async (updateDeposit: Deposit) => {
    setIsLoading(true);
    try {
      const response = await dbContext.deposits.put(updateDeposit);
      setIsLoading(false);

      if (response.ok) {
        Swal.fire("Deposito", "Actualizado con exito.", "success");
      }

      navigate("/init/overview/deposit");
    } catch (error) {
      console.log("Error al actualizar el documento: ", error);
      Swal.fire("Ups", "Ocurrio un error inesperado ", "error");
      setIsLoading(false);
    }
  };

  const deleteDeposit = async (deleteDepositId: string, revDeposit: string) => {
    setIsLoading(true);
    try {
      // const response = await fieldpartnerAPI.patch(`${controller}/${businessId}`, updateBusiness);
      const response = await dbContext.deposits.remove(
        deleteDepositId,
        revDeposit
      );
      setIsLoading(false);

      setIsLoading(false);

      if (response.ok) Swal.fire("Deposito", "Eliminado.", "success");
      navigate("/init/overview/deposit");
    } catch (error) {
      console.log("Error al actualizar el documento: ", error);
      Swal.fire("Ups", "Ocurrio un error inesperado ", "error");
      setIsLoading(false);
    }
  };

  const findDepositsByAccountId = async (accountId: string) => {
    setIsLoading(true);
    try {
      const result = await dbContext.deposits.find({
        selector: { accountId: accountId }
      });

      setIsLoading(false);
      if (result.docs) {
        const documents: Deposit[] = result.docs.map((row) => row as Deposit);
        return documents;
      }
      return [];
    } catch (error) {
      setIsLoading(false);
      console.error("Error finding deposits by accountId:", error);
      return [];
    }
  };

  const getDepositsBySupplyId = async (supplyId: string) => {
    setIsLoading(true);
    try {
      if (!user) return;
      const accountId = user.accountId;
      const promisesResult = await Promise.all([
        dbContext.stock.find({
          selector: {
            "$and": [{ "supplyId": supplyId }, { "accountId": accountId }]
          }
        }),
        dbContext.deposits.find({
          selector: { accountId: accountId }
        })
      ]);

      if (promisesResult) {
        const supplyStock = promisesResult[0].docs;
        const deposits = promisesResult[1].docs;
        let depositsOfSupply: Deposit[] = [];

        supplyStock.forEach((element) => {
          const depositId = element.depositId;
          const depositFound = deposits.find(d => d._id === depositId);
          if (depositFound) depositsOfSupply.push(depositFound);
        });

        setDeposits(depositsOfSupply);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error al cargar documentos:", error);
    }
  }
  const getDepositsByCropId = async (cropId: string) => {
    setIsLoading(true);
    try {
      if (!user) return;
      const accountId = user.accountId;
      const promisesResult = await Promise.all([
        dbContext.cropStockControl.find({
          selector: {
            "$and": [{ "cropId": cropId }, { "accountId": accountId }]
          }
        }),
        dbContext.deposits.find({
          selector: { accountId: accountId }
        })
      ]);

      if (promisesResult) {
        const stockCrop = promisesResult[0].docs;
        const deposits = promisesResult[1].docs;
        let depositsOfSupply: Deposit[] = [];

        stockCrop.forEach((element) => {
          const depositId = element.depositId;
          const depositFound = deposits.find(d => d._id === depositId);
          if (depositFound) depositsOfSupply.push(depositFound);
        });

        setDeposits(depositsOfSupply);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error al cargar documentos:", error);
    }
  }

  return {
    deposits,
    isLoading,
    setDeposits,
    getDeposits,
    createDeposit,
    updateDeposit,
    deleteDeposit,
    findDepositsByAccountId,
    getDepositsBySupplyId,
    getDepositsByCropId
  };
};
