import { uuidv7 } from "uuidv7";
import { only_docs } from "../../owncomponents/helpers";
import { FPDocument } from "../interfaces/planification";
import { dbContext } from "../services";
import { BaseDocRepository } from "./BaseRepository";

export interface Crop extends FPDocument {
  label: string;
  color?: string;
}

interface CropsRepositoryInterface {
  add(cropDoc: Crop): Promise<any>;
  getAll(): Promise<Crop[]>;
}

export class CropsRepository
  extends BaseDocRepository<Crop>
  implements CropsRepositoryInterface
{
  
  private _crops: Crop[];


  constructor(){
    super(dbContext.platform)
  }

  async getAll() {
    this._crops =  await this.getAllDocs("crop:") as unknown as Crop[];
    return this._crops;
  }

  async add(cropDoc: Crop) {
    if (!cropDoc._id) {
      cropDoc._id = "crop:userDefined:" + uuidv7();
    }
    await this.saveDoc(cropDoc);
    this.getAll().then(()=>this.notify())
    return cropDoc;
  }


  private notify(): void {
    console.log("Subject: Notifying observers...");
    for (const observer of this.observers) {
      observer(this._crops);
    }
  }
}
