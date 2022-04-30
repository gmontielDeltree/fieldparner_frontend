/* global zuix */

let drawerLayout;
let viewPager;
let topicIndicator;
let topicButtons;
let viewPagerSensores;
var campos_db;
var notas_db;
var map;
var ndvi_db;
var camposchanges_db;
var local_campos_changes;
var couch_username;
var darkdb;

zuix.using('script', './service-worker.js');
//zuix.using('style', '//zuixjs.github.io/zkit/css/flex-layout-attribute.min.css');
zuix.using('style', './index.css');

zuix.$.find('.profile').on('click', function () {
    if (drawerLayout) drawerLayout.open();
});

window.options = {
    drawerLayout: {
        autoHideWidth: -1,
        drawerWidth: 280,
        ready: function () { drawerLayout = this; this.close(); }
    },
    headerBar: {
        ready: function () {
            const view = zuix.$(this.view());
            // handle 'topic' buttons click (goto clicked topic page)
            topicButtons = view.find('.topics').children().each(function (i, el) {
                this.on('click', function (e) {
                    if (viewPager) viewPager.page(i);
                });
            });
            // open drawer when the profile icon is clicked
            view.find('.profile').on('click', function () {
                if (drawerLayout) drawerLayout.open();
            });
            showPage(0);
        }
    },
    footerBar: {
        ready: function () {
            const view = zuix.$(this.view());
            const buttons = view.find('button');
            buttons.each(function (i, el) {
                // TODO:
                this.on('click', function () {
                    buttons.removeClass('active');
                    this.addClass('active');
                    showPage(i);
                });
            });
        }
    },
    viewPager: {
        enablePaging: true,
        startGap: 36,
        on: {
            'page:change': function (e, page) {
                syncPageIndicator(page);
                // show header/footer
                if (viewPager) {
                    const p = viewPager.get(page.in);
                    zuix.context(p).show();
                }
            }
        },
        ready: function () {
            viewPager = this;
        }
    },
    viewPagerSensores: {
        enablePaging: true,
        startGap: 36,
        ready: function (ctx) {
            viewPagerSensores = this;
        }
    },
    topicIndicator: {
        enablePaging: true,
        startGap: 36,
        ready: function () {
            topicIndicator = this;
        }
    },
    autoHidingBars: {
        header: 'header-bar',
        footer: 'footer-bar',
        height: 56,
        on: {
            'page:scroll': function (e, data) {
                zuix.componentize();
            }
        }
    },
    content: {
        css: false
    }
};

function syncPageIndicator(page) {
    if (topicButtons) {
        topicButtons.eq(page.out).removeClass('active');
        topicButtons.eq(page.in).addClass('active');
    }
    if (topicIndicator) topicIndicator.page(page.in);
}

function showPage(i) {
    // show header top-box
    zuix.field('header-box')
        .children().hide()
        .eq(i).show();
    // show header bottom-box
    zuix.field('header-tools')
        .children().hide()
    //.eq(i).show();
    // show page
    zuix.field('pages')
        .children().hide()
        .eq(i).show();
    if (viewPager) viewPager.refresh();
}

// Turn off debug output
window.zuixNoConsoleOutput = true;

var auth0 = null;

const fetchAuthConfig = () => fetch("/auth_config.json");
const configureClient = async () => {
    const response = await fetchAuthConfig();
    const config = await response.json();

    console.log("Creando UTH=0")
    auth0 = await createAuth0Client({
        domain: config.domain,
        client_id: config.clientId,
        cacheLocation: 'localstorage'
    });
};


window.onload = async () => {
    check_logged_user();
    // console.log("ONLOAD")
    // await configureClient();
    // console.log("PO CL")
    // document.getElementById('login-btn').addEventListener('click', login);

    // const isAuthenticated = await auth0.isAuthenticated();

    // if (isAuthenticated) {
    //     console.log("> User is authenticated");
    //     window.history.replaceState({}, document.title, window.location.pathname);
    //     get_dbs();
    //     updateUI();
    //     return;
    // }

    // console.log("> User not authenticated");

    // const query = window.location.search;
    // const shouldParseResult = query.includes("code=") && query.includes("state=");

    // if (shouldParseResult) {
    //     console.log("> Parsing redirect");
    //     try {
    //         const result = await auth0.handleRedirectCallback();

    //         if (result.appState && result.appState.targetUrl) {
    //             //showContentFromUrl(result.appState.targetUrl);
    //         }

    //         get_dbs();
    //         console.log("Logged in!");
    //     } catch (err) {
    //         console.log("Error parsing redirect:", err);
    //     }

    //     window.history.replaceState({}, document.title, "/");
    // }

    // updateUI();
}

// NEW
const updateUI = async () => {
    const isAuthenticated = await auth0.isAuthenticated();

    //document.getElementById("logout-btn").disabled = !isAuthenticated;
    //document.getElementById("login-btn").disabled = isAuthenticated;

    //if(!isAuthenticated){
    //   login();
    // }
};

const login = async () => {
    await auth0.loginWithRedirect({
        redirect_uri: window.location.origin + '/index.html'
    });
};

const check_logged_user = async () => {
    darkdb = new PouchDB('dark')
    darkdb.get('cross').then((doc) => {
        un = doc.un
        base_url = "https://apikey-v2-213njg3v1nihlky5l9jvum36ihirjsgu3dpddva8lfd0:7e233eca960bdea27bdc2a6db0251d89@ab6ed2ec-b5b6-4976-995e-39b79e891d70-bluemix.cloudantnosqldb.appdomain.cloud/"
        get_dbs(base_url, un)
        console.log("Username:", un)

    }).catch((e) => {
        // No existe / Offline /
        // No Logged In
        no_logged_screen()
    })
}

const no_logged_screen = () => {
    console.log("User Not Logged In")
    // Redirect
}

const get_dbs_auth0 = async () => {

    user = await auth0.getUser();
    couchdb_config = user['http://mynamespace/couchdb'].couchDB;

    campos_db_uri = couchdb_config.campos
    notas_db_uri = couchdb_config.notas

    couch_username = couchdb_config.username

    campos_db = new PouchDB('campos_' + couch_username);
    notas_db = new PouchDB('notas_' + couch_username);

    var remote_campos_db = new PouchDB(campos_db_uri);

    campos_db.sync(remote_campos_db, {
        live: true,
        retry: true
    }).on('change', function (change) {
        // yo, something changed!
    }).on('paused', function (info) {
        // replication was paused, usually because of a lost connection
    }).on('active', function (info) {
        // replication was resumed
    }).on('error', function (err) {
        // totally unhandled error (shouldn't happen)
    });


    ndvi_db = new PouchDB("https://apikey-v2-213njg3v1nihlky5l9jvum36ihirjsgu3dpddva8lfd0:7e233eca960bdea27bdc2a6db0251d89@ab6ed2ec-b5b6-4976-995e-39b79e891d70-bluemix.cloudantnosqldb.appdomain.cloud/ndvi")


    remote_campos_changes = new PouchDB("https://apikey-v2-213njg3v1nihlky5l9jvum36ihirjsgu3dpddva8lfd0:7e233eca960bdea27bdc2a6db0251d89@ab6ed2ec-b5b6-4976-995e-39b79e891d70-bluemix.cloudantnosqldb.appdomain.cloud/campos_changes")
    local_campos_changes = new PouchDB("campos_changes")

    console.log("Changes Sync Set");
    local_campos_changes.replicate.to(remote_campos_changes, {
        live: true
    }).on('complete', function () {
        // yay, we're done!
        console.log("Changes Uploaded")
    }).on('error', function (err) {
        // boo, something went wrong!
        console.log("Error Changes")
    });


}



const get_dbs = async (base_url, username) => {

    couch_username = username

    // Local DBs
    campos_db = new PouchDB('campos_' + username);
    notas_db = new PouchDB('notas_' + username);

    // Remote URIs and Remote Dbs
    campos_db_uri = base_url + 'campos_' + username
    notas_db_uri = base_url + 'notas_' + username

    var remote_campos_db = new PouchDB(campos_db_uri);

    campos_db.sync(remote_campos_db, {
        live: true,
        retry: true
    }).on('change', function (change) {
        // yo, something changed!
    }).on('paused', function (info) {
        // replication was paused, usually because of a lost connection
    }).on('active', function (info) {
        // replication was resumed
    }).on('error', function (err) {
        // totally unhandled error (shouldn't happen)
    });


    ndvi_db = new PouchDB("https://apikey-v2-213njg3v1nihlky5l9jvum36ihirjsgu3dpddva8lfd0:7e233eca960bdea27bdc2a6db0251d89@ab6ed2ec-b5b6-4976-995e-39b79e891d70-bluemix.cloudantnosqldb.appdomain.cloud/ndvi")


    // Cambios DBs
    remote_campos_changes = new PouchDB("https://apikey-v2-213njg3v1nihlky5l9jvum36ihirjsgu3dpddva8lfd0:7e233eca960bdea27bdc2a6db0251d89@ab6ed2ec-b5b6-4976-995e-39b79e891d70-bluemix.cloudantnosqldb.appdomain.cloud/campos_changes")
    local_campos_changes = new PouchDB("campos_changes")

    console.log("Changes Sync Set");
    local_campos_changes.replicate.to(remote_campos_changes, {
        live: true
    }).on('complete', function () {
        // yay, we're done!
        console.log("Changes Uploaded")
    }).on('error', function (err) {
        // boo, something went wrong!
        console.log("Error Changes")
    });

    console.log("DBs set ok")


}


var wentOffline, wentOnline;
 function handleConnectionChange(event){
    if(event.type == "offline"){
        console.log("You lost connection.");
        wentOffline = new Date(event.timeStamp);
    }
    if(event.type == "online"){
        console.log("You are now back online.");
        wentOnline = new Date(event.timeStamp);
        console.log("You were offline for " + (wentOnline - wentOffline) / 1000 + "seconds.");
    }
}
window.addEventListener('online', handleConnectionChange);
window.addEventListener('offline', handleConnectionChange);
