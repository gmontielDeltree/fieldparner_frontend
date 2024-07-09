import { uuidv7 } from "uuidv7";
import { only_docs } from "../../owncomponents/helpers";
import { FPDocument } from "../interfaces/planification";
import { dbContext } from "../services";
import { BaseDocRepository } from "./BaseRepository";
import { Country } from "@types";

interface CountryRepositoryInterface {
  add(countryDoc: Country): Promise<any>;
  getAll(): Promise<Country[]>;
  getUnselected(): Promise<Country[]>; // Añadir este método
}

export class CountryRepository
  extends BaseDocRepository<Country>
  implements CountryRepositoryInterface
{
  private _country: Country[];

  constructor(){
    super(dbContext.country);
  }

  async getAll() {
    let map = new Map();
    let data = await this.getAllDocs("") as unknown as Country[];
    console.log("Data from getAllDocs:", data); // Log para inspeccionar datos
    data.map((a) => map.set(a.descriptionES, a));
    this. _country = [...map.values()];
    console.log("Processed pais data:", this._country); // Log para inspeccionar datos procesados
    return this._country;
  }

  async add(countryDoc: Country) {
    if (!countryDoc._id) {
        countryDoc._id = "pais:userDefined:" + uuidv7();
    }
    console.log("Country to be added:", countryDoc); // Log para inspeccionar el cultivo a añadir
    await this.saveDoc(countryDoc);
    this.getAll().then(() => this.notify());
    return countryDoc;
  }

  private notify(): void {
    console.log("Subject: Notifying observers...");
    for (const observer of this.observers) {
      observer(this._country);
    }
  }

  async getUnselected(): Promise<Country[]> {
    // Asumiendo que hay una propiedad isSelected en pais
    let allCountry = await this.getAllDocs("") as unknown as Country[];
    let selectedCountry = new Set(this._country.map(country => country.descriptionES));
    let unselectedCountry = allCountry.filter(country => !selectedCountry.has(country.descriptionES));
    console.log("Unselected Paises:", unselectedCountry); // Log para inspeccionar cultivos no seleccionados
    return unselectedCountry;
  }
}
