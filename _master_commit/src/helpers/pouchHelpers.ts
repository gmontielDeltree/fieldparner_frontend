import store from "../redux/store";
import { incrementSyncCounter, setSyncStatus } from "../redux/syncStatus";

import PouchDB from "pouchdb";

const onSyncChange = (change) => {
  console.log("sync - changes", change);
  store.dispatch(incrementSyncCounter());
};

const onSyncPaused = () => {};

const onSyncError = () => {
  console.log("Sync Error");
};

const onReplicationError = () => {
  console.log("Replication Error");
};
/*
 * https://pouchdb.com/api.html#replication
 * do one way, one-off sync from the server until completion
 * "...The above technique results in fewer HTTP requests being used and better performance than just using db.sync on its own."
 */
export const startInitialReplication = async (
  db: PouchDB.Database,
  remoteURL: string,
  opts?: any,
) => {
  // If no tiene nigun doc -> asumo que es una DB 'nueva'
  let docs_en_local_db = await db.allDocs();
  if (docs_en_local_db.rows.length === 0) {
    let rdb = new PouchDB(remoteURL);
    // Get all Docs from remote
    let allDocs = await rdb.allDocs({ include_docs: true, attachments: true });
    //
    if (allDocs.rows) {
      await db.bulkDocs(allDocs.rows.map((r) => r.doc));
    }
  }

  // Set normal sync
  db.sync(remoteURL, opts)
    .on("active", function () {
      console.log("sync active");
      // store.dispatch(setSyncStatus("active"));
    })
    .on("paused", () => {
      console.log("sync paused");
      store.dispatch(incrementSyncCounter());
      // store.dispatch(setSyncStatus("paused"));
    })

    .on("change", onSyncChange)
    .on("error", onSyncError);
};
