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
export const sw_get_file_doc = async (db:PouchDB.Database, filename_or_id:string) => {
	return sw_docs_starting(db,filename_or_id,true,true,true).then(sw_only_docs).then((docs)=>{
		if(docs.length===0){
			return null as SWFileAttachment
		}else{
			return docs[0] as unknown as SWFileAttachment
		}
	})
}

export const sw_post_file_doc = async (db:PouchDB.Database, filename:string, file: File) => {
	let new_doc = {_id:filename, filename:filename}
	db.put(new_doc)
}

export interface SWFileAttachment{
	_id:string,
	filename:string,
	upload_date: string,
	uploaded:boolean,
	_attachments: {"file_0" : {data: Blob, content_type: string}}
}

export async function postData(url = '', data = {}) {
	// Opciones por defecto estan marcadas con un *
	console.log('POST AL SERVER')
}