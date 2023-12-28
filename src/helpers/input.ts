import { Input } from "../interfaces/input";
import generics from "./../../public/insumos_genericos.json";

export const getInputs = async (db: PouchDB.Database) => {
  let result = await db.allDocs({
    include_docs: true,
    startkey: "input:",
    endkey: "input:\ufff0",
    inclusive_end: true
  });

  if (result.rows.length > 0) {
    let docs = result.rows.map((r) => r.doc);
    return docs as Input[];
  } else {
    return [];
  }
};

export const getInputList = async (db: PouchDB.Database) => {
  let generics = [];
  try {
    generics = await fetch("/inputs_generics.json").then((response) =>
      response.json()
    );
  } catch (error) {
    console.warn("Could not load generic inputs:", error);
  }

  let own = await getInputs(db);
  let ownIds = own.map((input) => input._id);
  let filteredGenerics = generics.filter(
    (input: any) => !ownIds.includes(input._id)
  );

  return [...filteredGenerics, ...own];
};

export const getInputListLocal = async (db: PouchDB.Database) => {
  let own = await getInputs(db);
  let ownIds = own.map((input) => input._id);
  let filteredGenerics = generics.filter(
    (input: any) => !ownIds.includes(input._id)
  );

  return [...filteredGenerics, ...own];
};
