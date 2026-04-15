import { Business } from "@types";
import { BaseDocRepository } from "./BaseRepository";
import { dbContext } from "../services";
import { uuidv7 } from "uuidv7";

interface LoteRepositoryInterface {
  add(cropDoc: Business): Promise<any>;
  getAll(): Promise<Business[]>;
}

export class LoteRepository
  extends BaseDocRepository<Business>
  implements LoteRepositoryInterface
{
  private _lotes: Lote[];

  constructor() {
    super(dbContext.fields);
  }

  async getAll() {
    this._businnes = (await this.getAllDocs("")) as unknown as Business[];
    return this._businnes;
  }

  async add(doc: Business) {
    if (!doc._id) {
      doc._id = "contractor:" + uuidv7();
    }
    await this.saveDoc(doc);
    this.getAll().then(() => this.notify());
    return doc;
  }

  private notify(): void {
    console.log("Subject: Notifying observers...");
    for (const observer of this.observers) {
      observer(this._businnes);
    }
  }
}
