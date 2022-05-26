var img_bucket_url =
  "https://testbucketgarrapollo.s3.us-south.cloud-object-storage.appdomain.cloud/";

const emptyGJ = {
  type: "FeatureCollection",
  features: [],
};

let touchEvent = "ontouchstart" in window ? "touchstart" : "click";

async function hashMessage(message) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}

const layer_visibility = (map, layer_id, status) => {
  map.setLayoutProperty(layer_id, "visibility", status ? "visible" : "none");
};

const base_url =
  "https://apikey-v2-213njg3v1nihlky5l9jvum36ihirjsgu3dpddva8lfd0:7e233eca960bdea27bdc2a6db0251d89@ab6ed2ec-b5b6-4976-995e-39b79e891d70-bluemix.cloudantnosqldb.appdomain.cloud/";

const sendEvent = (name,details) => {
  let event = new CustomEvent(name, {
    detail: details,
    bubbles: true,
    composed: true,
  });
  this.dispatchEvent(event);
}

export { emptyGJ, base_url, touchEvent, sendEvent, layer_visibility, hashMessage };
