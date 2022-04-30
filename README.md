# fieldpartner_frontend

# Demo Database
darkdb = new PouchDB('dark');

darkdb.get('cross').then(function(doc) {
  return darkdb.put({
    _id: 'cross',
    _rev: doc._rev,
    un: "demo"
  });
}).then(function(response) {
  // handle response
}).catch(function (err) {
	darkdb.put({_id:'cross', un: 'demo'})  
    console.log(err);
});
