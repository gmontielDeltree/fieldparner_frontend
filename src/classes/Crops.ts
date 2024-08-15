import { uuidv7 } from "uuidv7";
import { only_docs } from "../../owncomponents/helpers";
import { FPDocument } from "../interfaces/planification";
import { dbContext } from "../services";
import { BaseDocRepository } from "./BaseRepository";
import { Crops } from "@types";


interface CropsRepositoryInterface {
  add(cropDoc: Crops): Promise<any>;
  getAll(): Promise<Crops[]>;
}

export class CropsRepository
  extends BaseDocRepository<Crops>
  implements CropsRepositoryInterface
{
  
  private _crops: Crops[];


  constructor(){
    super(dbContext.crops)
  }

  async getAll() {
    let map = new Map()
    let data =  await this.getAllDocs("") as unknown as Crops[];
    data.map((a)=>map.set(a.descriptionES,a))
    this._crops =[...map.values()]
    return this._crops;
  }

  async add(cropDoc: Crops) {
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
