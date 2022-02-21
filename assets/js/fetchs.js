
function getSensoresData(userid) {
  return fetch('/phpiot20/apiv0/devices_by_user.php').then(response => {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response.json();
  });
}