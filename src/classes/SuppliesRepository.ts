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

  constructor() {
    super(dbContext.supplies);
  }

  async getAll() {
    this.__supplies = (await this.getAllDocs("")) as unknown as Supply[];
    return this.__supplies;
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
