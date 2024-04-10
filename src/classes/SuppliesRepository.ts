import { Supply } from "@types";
import { BaseDocRepository } from "./BaseRepository";
import { dbContext } from "../services";
import { uuidv7 } from "uuidv7";


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
    this.__supplies = (await this.getAllDocs("")) as unknown as Supply[];
    this.__platformSupplies = await this.__platformSuppliesRepo.getAllDocs("") as unknown as Supply[]

    return [...this.__supplies,...this.__platformSupplies];
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
