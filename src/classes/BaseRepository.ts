import { only_docs } from "../../owncomponents/helpers";



export class BaseDocRepository<T> {

  private _userId: string
  private _db: PouchDB.Database


  observers: ((crops: T[]) => void)[] = [];


  constructor(dataBase: PouchDB.Database, userId?: string) {
    // No usar hooks en el constructor - eso viola las reglas de React
    this._userId = userId || "default_user_id"
    this._db = dataBase
  }

  async saveDoc(doc: PouchDB.Core.Document<any>) {

    await this._db.put(doc)
    return doc

  }

  async getAllDocs(key: string) {
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