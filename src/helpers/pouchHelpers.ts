

const onSyncChange = () => {

}

const onSyncPaused = () => {

}

const onSyncError = () => {

}

/*
 * https://pouchdb.com/api.html#replication
 * do one way, one-off sync from the server until completion
 * "...The above technique results in fewer HTTP requests being used and better performance than just using db.sync on its own."
 */
export const setInitialReplication = (db: PouchDB.Database, remoteURL: string, opts?: any) => {

  db.replicate.from(remoteURL).on('complete', function(info) {
    // then two-way, continuous, retriable sync
    db.sync(remoteURL, opts)
      .on('change', onSyncChange)
      .on('paused', onSyncPaused)
      .on('error', onSyncError);
  }).on('error', onSyncError);
}
