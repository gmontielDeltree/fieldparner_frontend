# fieldpartner_frontend

# UserId
El userId viene dado por el campo 'sub' del objeto user que devuelve auth0.
El userId se utiliza para identificar al usuario el la app
Nombre de la user_db = ${user.sub}

# Router
@vaadin/router

# State
El State del la app es monitoreado por la libreria @lit-app/state
[https://github.com/lit-apps/lit-app/tree/main/packages/state]

# Traduccion


# Mantenimiento 
npm-check


# Links
### Discusión Multiples DB.
https://github.com/pouchdb/pouchdb/issues/3732

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

