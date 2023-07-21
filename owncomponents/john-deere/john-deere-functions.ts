import { env } from "process";
import {
  FileResponse,
  JDMachine,
  LocationHistory,
  LocationHistoryResponse,
  OrganizationsResponse,
} from "./john-deere-types";

const base_url = import.meta.env.VITE_INTEGRACIONES_SERVER_URL;
console.log("INTEGRACIONES_BASE_URL = ", base_url);

export const john_deere_login = async () => {
  fetch(base_url + "/api/john-deere-login", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
  })
    .then((response) => {
      // HTTP 301 response
      // HOW CAN I FOLLOW THE HTTP REDIRECT RESPONSE?
      if (response.redirected) {
        window.location.href = response.url;
      }
    })
    .catch(function (err) {
      console.info(err + " url: " + url);
    });
};

async function postData(data = {}) {
  // Default options are marked with *
  let url = base_url + "/api/call-api";
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

async function postDataDownload(data = {}) {
  // Default options are marked with *
  let url = base_url + "/api/call-api-download";
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  // console.log(response.blob())
  return response.blob(); // parses JSON response into native JavaScript objects
}

export const jd_get_organizations = async (token: string) => {
  let data = { url: api_ep + "organizations", token: token };
  return postData(data) as unknown as OrganizationsResponse;
};

export const jd_get_files = async (token: string, orgId: number) => {
  let data = {
    url: api_ep + "organizations/" + orgId + "/files",
    token: token,
  };
  return postData(data) as unknown as FileResponse;
};

export const jd_get_file = async (token: string, fileId: number) => {
  let data = { url: api_ep + "files/" + fileId, token: token };
  return postDataDownload(data) as unknown as FileResponse;
};

export const jd_get_farms_boundaries = async (token: string, orgId: number) => {
  let data = {
    url: api_ep + "organizations/" + orgId + "/boundaries",
    token: token,
  };
  return postData(data) as unknown as FileResponse;
};

export const jd_get_machines = async (token: string, orgId: number) => {
  let data = {
    url: api_ep + "organizations/" + orgId + "/machines",
    token: token,
  };
  return postData(data) as unknown as FileResponse;
};

export const jd_get_machine_position = async (
  token: string,
  machine: JDMachine
) => {
  let self_url = machine.links.find((e) => e.rel === "self")?.uri;
  let location_url = machine.links.find(
    (e) => e.rel === "locationHistory"
  )?.uri;

  let data = { url: location_url, token: token };
  return postData(data) as unknown as LocationHistoryResponse;
};

const api_ep = "https://sandboxapi.deere.com/platform/";
