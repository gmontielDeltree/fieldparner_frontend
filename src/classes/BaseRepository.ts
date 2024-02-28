import { uuidv7 } from "uuidv7";
import { only_docs } from "../../owncomponents/helpers";
import { FPDocument } from "../interfaces/planification";
import { dbContext } from "../services";



export class BaseDocRepository<T> {

  private _userId: string
  private _db : PouchDB.Database

  observers: ((crops: T[]) => void)[] = [];


  constructor(dataBase : PouchDB.Database){
    this._userId = "elid"
    this._db = dataBase
  }

  async saveDoc(doc : PouchDB.Core.Document<any>){
    return this._db.put(doc)
  }

  async getAllDocs(key :string){
    let s = await this._db.allDocs({
      startkey: key,
      endkey: key + "\ufff0",
      include_docs: true,
    });
    let docs = only_docs(s);
    return docs;
  }


  public attachObserver(observer: (args: any) => void) {
    const isExist = this.observers.includes(observer);
    if (isExist) {
      return console.log("Subject: Observer has been attached already.");
    }

    console.log("Subject: Attached an observer.");
    this.observers.push(observer);
  }

  public detachObserver(observer: (args: any) => void): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
      return console.log("Subject: Nonexistent observer.");
    }

    this.observers.splice(observerIndex, 1);
    console.log("Subject: Detached an observer.");
  }


 
}