'use strict';
zuix.controller(function (cp) {
  const zx = zuix; // shorthand
  let itemsList;

  const logout = () => {
    try {
      console.log("Logging out");
      auth0.logout({
        returnTo: window.location.origin
      });
    } catch (err) {
      console.log("Log out failed", err);
    }
  };
  
  cp.create = function () {
    console.log("CONSLOEE", auth0)
    document.getElementById('logout-btn').addEventListener('click',logout);

  }

});