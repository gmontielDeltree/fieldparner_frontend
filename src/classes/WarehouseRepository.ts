import { Deposit } from "@types";
import { BaseDocRepository } from "./BaseRepository";
import { dbContext } from "../services";
import { uuidv7 } from "uuidv7";


interface WarehouseRepositoryInterface {
  add(cropDoc: Deposit): Promise<any>;
  getAll(): Promise<Deposit[]>;
}

export class WarehouseRepository
  extends BaseDocRepository<Deposit>
  implements WarehouseRepository
{
  private _warehouse: Deposit[];

  constructor() {
    super(dbContext.deposits);
  }

  async getAll() {
    this._warehouse = (await this.getAllDocs("")) as unknown as Deposit[];
    return this._warehouse;
  }

  async add(doc: Deposit) {
    if (!doc._id) {
      doc._id = "warehouse:" + uuidv7();
    }
    await this.saveDoc(doc);
    this.getAll().then(() => this.notify());
    return doc;
  }

  private notify(): void {
    console.log("Subject: Notifying observers...");
    for (const observer of this.observers) {
      observer(this._warehouse);
    }
  }
}
