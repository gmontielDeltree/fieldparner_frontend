import PouchDB from "pouchdb";
export const sw_docs_starting = async (
  db: PouchDB.Database,
  key: string,
  devolver_docs: boolean = false,
  attachments: boolean = false,
  binary: boolean = false
) => {
  return db
    .allDocs({
      include_docs: devolver_docs,
      attachments: attachments,
      binary: binary,
      startkey: key,
      endkey: key + "\ufff0",
    })
    .then((result) => {
      return result;
    });
};

export const sw_only_docs = (alldocs: PouchDB.Core.AllDocsResponse<{}>) => {
  if (alldocs.rows.length > 0) {
    return alldocs.rows.map((row) => {
      return row.doc;
    });
  } else {
    return [];
  }
};

/**
 *
 * @param db
 * @param filename_or_id
 * @returns null si no existe el archivo, el doc si existe
 */
export const sw_get_file_doc = async (
  db: PouchDB.Database,
  filename_or_id: string //uriEncoded
) => {
  console.log("FILENAME REQUESTED", filename_or_id);
  return sw_docs_starting(db, ASCIItoHex(filename_or_id), true, true, true)
    .then(sw_only_docs)
    .then((docs) => {
      if (docs.length === 0) {
        return null as SWFileAttachment;
      } else {
        return docs[0] as unknown as SWFileAttachment;
      }
    });
};

export const sw_post_file_doc = async (
  db: PouchDB.Database,
  file: File,
  uploaded: boolean
) => {
  let new_doc: SWFileAttachment = {
    _id: ASCIItoHex(file.name),
    filename: file.name,
    uploaded: uploaded,
    _attachments: { file_0: { type: file.type, data: file } },
  };

  db.put(new_doc);
};

export interface SWFileAttachment {
  _id: string;
  filename: string;
  upload_date?: string;
  uploaded: boolean;
  _attachments: { file_0: { data: File; type: string } };
}

export async function postData(file: File) {
  // Opciones por defecto estan marcadas con un *
  console.log("POST AL SERVER",file);

  fetch("https://staging--agrotools.netlify.app/.netlify/functions/ibmcos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: file.name,
      type: file.type,
    }),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      console.log("UPLOAD URL",json)
      return fetch(json.uploadURL, {
        method: "PUT",
        body: file,
      });
    })
    .then(function (e) {
      console.log(e)
      console.log(
        "UPLOADED to https://adjuntos-fieldpartner.s3.us-south.cloud-object-storage.appdomain.cloud/" +
          file.name
      );
    });
}

export const fetch_file = async (filename: string) => {
  return fetch(
    "https://adjuntos-fieldpartner.s3.us-south.cloud-object-storage.appdomain.cloud/" +
      filename
  ).then((r) => r.body);
};

function ASCIItoHex(ascii) {
  let hex = "";
  let tASCII, Hex;
  ascii.split("").map((i) => {
    tASCII = i.charCodeAt(0);
    Hex = tASCII.toString(16);
    hex = hex + Hex;
  });
  return (hex = hex.trim());
}

function hextoASCII(ascii) {
  let string = "";
  ascii.split(" ").map((i) => {
    let merge = parseInt(i, 16);
    string = string + String.fromCharCode(merge);
  });
  return string;
}
