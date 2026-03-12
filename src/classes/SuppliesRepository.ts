import { Supply } from "@types";
import { BaseDocRepository } from "./BaseRepository";
import { dbContext } from "../services";
import { uuidv7 } from "uuidv7";
import store from "../redux/store";


interface SuppliesRepositoryInterface {
  add(cropDoc: Supply): Promise<any>;
  getAll(): Promise<Supply[]>;
}

export class SuppliesRepository
  extends BaseDocRepository<Supply>
  implements SuppliesRepositoryInterface
{
  private __supplies: Supply[];
  private __platformSupplies: Supply[]

  private __platformSuppliesRepo;

  constructor() {
    super(dbContext.supplies);

    this.__platformSuppliesRepo = new BaseDocRepository(dbContext.platformSupplies)
  }

  async getAll() {
    // Obtener el usuario del store
    const state = store.getState();
    const user = state.auth.user;

    if (!user) {
      console.warn("SuppliesRepository: No user found in store");
      return [];
    }

    // Usar la misma lógica que useSupply.ts
    const result = await dbContext.supplies.find({
      selector: {
        $or: [
          { accountId: user.accountId },
          { isDefault: true }
        ]
      },
    });

    // Filtrar por countryId del usuario
    const documents: Supply[] = result.docs.map(row => row as Supply);
    const docsCountryFiltered = documents.filter(doc => doc.countryId === user.countryId);

    this.__supplies = docsCountryFiltered;

    // También obtener platform supplies (si las necesitas)
    this.__platformSupplies = await this.__platformSuppliesRepo.getAllDocs("") as unknown as Supply[];

    return [...this.__supplies, ...this.__platformSupplies];
  }

  async add(doc: Supply) {
    if (!doc._id) {
      doc._id = "supply:" + uuidv7();
    }
    await this.saveDoc(doc);
    this.getAll().then(() => this.notify());
    return doc;
  }

  private notify(): void {
    console.log("Subject: Notifying observers...");
    for (const observer of this.observers) {
      observer(this.__supplies);
    }
  }
}
