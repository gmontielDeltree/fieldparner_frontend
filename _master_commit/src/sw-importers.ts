import { read, writeFile, utils } from "xlsx";

export const process_analisis_suelo = (
  self: ServiceWorkerGlobalScope,
  event: FetchEvent
) => {
  /* This is to fix the issue Jake found */
  //event.respondWith(Response.redirect('/index.html'));
  event.respondWith(
    new Response(
      "<p>This is a response that comes from your service worker!</p>",
      {
        headers: { "Content-Type": "text/html" },
      }
    )
  );

  event.waitUntil(
    (async function () {
      const data = await event.request.formData();
      const client = await self.clients.get(
        event.resultingClientId || event.clientId
      );
      // Get the data from the named element 'file'
      const file = data.get("file") as File;

      console.log("Excel file", file);

      // Parse Excel y devolver json
      const excel_data = await file.arrayBuffer();
      /* data is an ArrayBuffer */
      const workbook = read(excel_data);
      console.log(workbook);

      workbook.SheetNames.forEach((sheet) => {
        let rowObject = utils.sheet_to_json(workbook.Sheets[sheet],{header:['variable','valor']});
        client.postMessage({  analisis:rowObject, action: "load-excel-analisis" });
        console.log("ROW",rowObject);
        return; //only once
      });
    })()
  );
};
