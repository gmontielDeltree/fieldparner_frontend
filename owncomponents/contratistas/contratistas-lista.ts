import { LitElement, html, unsafeCSS, render, CSSResultGroup } from "lit";
import { property, state } from "lit/decorators.js";
import "@vaadin/form-layout";
import "@vaadin/email-field";
import "@vaadin/text-field";
import "@vaadin/combo-box";
import "@vaadin/button";
import "@vaadin/horizontal-layout";
import "@vaadin/vertical-layout";
import "@vaadin/custom-field";
import "@vaadin/grid";
import bootstrap from "bootstrap/dist/css/bootstrap.min.css?inline";
import Modal from "bootstrap/js/dist/modal";
import lista_de_labores from "../jsons/labores";
import { uuid4 } from "uuid4";
import PouchDB from "pouchdb";
import { Contratista, empty_contratista, getContratistas, Labor } from "./contratista-types";
import { ContratistaCrud } from "./contratista-crud";
import { GridItemModel } from "@vaadin/grid";
import "../contratistas/contratista-crud";
import "@vaadin/icons";
import "@vaadin/upload";
import "@vaadin/dialog";
import { read, writeFile, utils } from "xlsx";
import { i18n_upload } from "../i18n/vaadin";
import { Upload } from "@vaadin/upload";
import '@vaadin/menu-bar';

export class ContratistasLista extends LitElement {
  @state()
  _contratistas: Contratista[];

  @state({
    hasChanged(newVal: Modal, oldVal: Modal) {
      return false;
    },
  })
  _modal: Modal;

  @property()
  db: PouchDB.Database;

  @state({
    hasChanged(newVal: Modal, oldVal: Modal) {
      return false;
    },
  })
  _modal_excel: Modal;

  @state()
  _uploaded_contratistas : any; 

  @state({
    hasChanged(newVal: Upload, oldVal: Upload) {
      return false;
    },
  })
  _excel_file_input : Upload;

  static override styles: CSSResultGroup = [unsafeCSS(bootstrap)];

  override firstUpdated() {
    this._modal = new Modal(this.shadowRoot.getElementById("modal"));
    this._modal_excel = new Modal(
      this.shadowRoot.getElementById("modal-importar-excel")
    );

    this._excel_file_input = this.shadowRoot.getElementById('upload-drop-enabled') as Upload

    /**Recepcion del mensaje enviado por el sw al recibir el POST del archivo */
    navigator.serviceWorker.addEventListener("message", async (event) => {
      if (event.data.action !== "load-excel") {
        return;
      }
      console.log("OnMessageExcel", event);

      const data = await event.data.file.arrayBuffer();
      /* data is an ArrayBuffer */
      const workbook = read(data);
      console.log(workbook);
      workbook.SheetNames.forEach((sheet) => {
        let rowObject = utils.sheet_to_json(workbook.Sheets[sheet]);
        this._uploaded_contratistas = rowObject
        console.log(rowObject);
      });
    });
  }

  show() {
    this._modal.show();

    getContratistas(this.db).then((contratistas)=>{
      this._contratistas = contratistas
    })

    // this.db
    //   .get("contratistas")
    //   .then((e: any) => {
    //     this._contratistas = Object.values(e.contratistas);
    //     console.log("Contratistas", e);
    //   })
    //   .catch((e) => {});
  }

  edit_contratista(c: Contratista) {
    this._modal.hide();
    ((this.shadowRoot.getElementById("contratista-crud")) as ContratistaCrud).edit(c);
  }

  borrar_contratista(c: Contratista) {

    this.db.remove(c as PouchDB.Core.RemoveDocument).then(()=>{
      getContratistas(this.db).then((contratistas)=>{
        this._contratistas = contratistas
      })
    }).catch((e) => {
      console.log("Error", e);
      alert("Error al Borrar")
    })

    // this.db
    //   .get("contratistas")
    //   .then((e: any) => {
    //     delete e.contratistas[c.uuid];
    //     this.db.put(e);
    //     this._contratistas = Object.values(e.contratistas);

    //     console.log("Contratistas", e);
    //   })
    //   .catch((e) => {});
  }

  private statusRenderer = (
    root: HTMLElement,
    _: HTMLElement,
    model: GridItemModel<Contratista>
  ) => {
    const contratista = model.item;
    render(
      html`
        <span theme="badge" @click=${() => this.edit_contratista(contratista)}
          ><vaadin-icon icon="vaadin:edit"></vaadin-icon
        ></span>

        <span theme="badge" @click=${() => this.borrar_contratista(contratista)}
          ><vaadin-icon icon="vaadin:trash"></vaadin-icon
        ></span>
      `,
      root
    );
  };

  private laboresRenderer = (
    root: HTMLElement,
    _: HTMLElement,
    model: GridItemModel<Contratista>
  ) => {
    const contratista = model.item;
    const labores = contratista.labores;

    render(
      html`
        <vaadin-vertical-layout>
          ${labores.map((labor) => {
            if (labor?.labor === "Siembra") {
              return html`<vaadin-button theme="primary success small"
                >${labor.labor}</vaadin-button
              >`;
            } else if (labor?.labor === "Cosecha") {
              return html`<vaadin-button theme="primary error small"
                >${labor.labor}</vaadin-button
              >`;
            } else {
              return html`<vaadin-button theme="primary contrast small"
                >${labor.labor}</vaadin-button
              >`;
            }
          })}
        </vaadin-vertical-layout>
      `,
      root
    );
  };

  importar() {
    this._uploaded_contratistas = undefined;
    this._modal.hide();
    this._modal_excel.show();
    this._excel_file_input.files = []
  }

  save_imports(){

    /**
     * Convierte la "fila de excel" a Contratista
     * @param up 
     * @returns 
     */
    const up_to_contratista = (up) => {
      let contratista : Contratista = {...empty_contratista}
      contratista.uuid = uuid4()
      contratista._id = "contratista:"+contratista.uuid 
      contratista.nombre = up.Nombre || ""
      contratista.cuit = up.CUIT || ""
      contratista.datos_generales = {...empty_contratista.datos_generales}
      contratista.datos_generales.email = up.Email || ""
      contratista.datos_generales.telefono = up["Teléfono"] || ""
      contratista.datos_generales.direccion = up['Dirección'] || ""
      contratista.labores = []
      
      if(up.Labores_1){
        let labor_buscada = up.Labores_1;
        let labor_encontrada = lista_de_labores.find((x) => x.labor.toLowerCase() === labor_buscada.toLowerCase())
        if(labor_encontrada){
          contratista.labores.push(labor_encontrada)
        }else{
          contratista.labores.push({labor: labor_buscada.toLowerCase, uuid:uuid4()}) 
        }
      }

      if(up.Labores_2){
        let labor_buscada = up.Labores_2;
        let labor_encontrada = lista_de_labores.find((x) => x.labor.toLowerCase() === labor_buscada.toLowerCase())
        if(labor_encontrada){
          contratista.labores.push(labor_encontrada)
        }else{
          contratista.labores.push({labor: labor_buscada.toLowerCase, uuid:uuid4()}) 
        }
      }

      if(up.Labores_3){
        let labor_buscada = up.Labores_3;
        let labor_encontrada = lista_de_labores.find((x) => x.labor.toLowerCase() === labor_buscada.toLowerCase())
        if(labor_encontrada){
          contratista.labores.push(labor_encontrada)
        }else{
          contratista.labores.push({labor: labor_buscada.toLowerCase, uuid:uuid4()}) 
        }
      }

      if(up.Labores_4){
        let labor_buscada = up.Labores_4;
        let labor_encontrada = lista_de_labores.find((x) => x.labor.toLowerCase() === labor_buscada.toLowerCase())
        if(labor_encontrada){
          contratista.labores.push(labor_encontrada)
        }else{
          contratista.labores.push({labor: labor_buscada.toLowerCase, uuid:uuid4()}) 
        }
      }

      return contratista
    }



    //console.log("CONT uc", this._uploaded_contratistas)
    let todos_los_contratistas = this._uploaded_contratistas.map(up_to_contratista)

    //console.log("CONT sin uuid", todos_los_contratistas, this._uploaded_contratistas)
    // let todos_los_contratistas_con_uuid : (Contratista & {uuid:string}) [] = todos_los_contratistas.map((c : Contratista) => {
    //   let nuevo_uuid = uuid4()
    //   c.uuid = nuevo_uuid
    //   return c;
    // })
    
    //console.log("CONT", todos_los_contratistas_con_uuid)
    this.db.bulkDocs(todos_los_contratistas)

    // this.db
    //     .get("contratistas")
    //     .then((result: any) => {
    //       todos_los_contratistas_con_uuid.map((c) => {
    //         result.contratistas[c.uuid] = c
    //         return c;
    //       })
    //       this.db
    //         .put(result)
    //         .then(() => {
    //           console.log("Contratistas Doc Updated");
    //           this._modal_excel.hide();
    //           this.show()
    //         })
    //         .catch((e) => console.error("Error al update Contratistas", e));
    //     })
    //     .catch(() => {
    //       // El doc no existe. Lo creo.
    //       let lista_contratistas = {};
    //       todos_los_contratistas_con_uuid.map((c) => {
    //         lista_contratistas[c.uuid] = c
    //         return c;
    //       })
    //       let con_doc = {
    //         _id: "contratistas",
    //         contratistas: lista_contratistas,
    //       };
    //       this.db
    //         .put(con_doc)
    //         .then(() => {
    //           console.log("Contratistas Doc Creado");
    //           this._modal_excel.hide();
    //           this.show()
    //         })
    //         .catch((e) => console.error("Error al crear Contratistas", e));
    //     });
  }

  menu_click({detail}){
    //console.log("CLICK,", detail)
    let valor = detail.value.value
    if(valor === 'importar_excel' ){
      this.importar()
    }else if(valor === 'exportar_excel'){
      const contratista_a_row = (c : Contratista) => {
        let row = {
          "Nombre":c.nombre,
          "CUIT":c.cuit,
          "Dirección":c.datos_generales.direccion,
          "Teléfono":c.datos_generales.telefono,
          "Email":c.datos_generales.email,
          "Labores_1":c.labores[0]?.labor || "",
          "Labores_2":c.labores[1]?.labor || "",
          "Labores_3":c.labores[2]?.labor || "",
          "Labores_4":c.labores[3]?.labor || "",
        }
        return row;
      }


      let data = this._contratistas.map(contratista_a_row)

      
      const worksheet = utils.json_to_sheet(data);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Contratistas");
      writeFile(workbook, "Contratistas.xlsx");
      console.log(this._contratistas)
    }
  }

  render() {
    return html`
    
    
      <!-- Modal Importar-->
      <div
        class="modal fade backdrop"
        id="modal-importar-excel"
        data-bs-backdrop="static" data-bs-keyboard="false"
        tabindex="-1"
        role="dialog"
      >
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Importar desde Excel</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <label for="upload-drop-enabled">Formatos aceptados: xlsx, xlsm, ods, csv.</label>
              <p>Puede descargar el ejemplo/template para formatear correctamente sus datos.</p>
              <vaadin-upload
                id="upload-drop-enabled"
                .nodrop="${false}"
                accept=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx,.ods,.csv
                max-files="1"
                target="/excel-contratistas-upload"
                .i18n=${i18n_upload}
                @files-changed=${(e) => {if(e.target.files.length === 0){
                  this._uploaded_contratistas = undefined
                }}}
              ></vaadin-upload>


              ${
                this._uploaded_contratistas ? html`<h4>Preview</h4>
                <vaadin-grid .items="${this._uploaded_contratistas}" theme="compact" style="height: 200px;">
                <vaadin-grid-column path="Nombre" header="Nombre"></vaadin-grid-column>
                <vaadin-grid-column path="CUIT" header="CUIT"></vaadin-grid-column>
                <vaadin-grid-column path="Email" header="E-Mail"></vaadin-grid-column>
              </vaadin-grid>`:null
              }
              

            </div>
            <div class="modal-footer">
       
            <a class="btn btn-primary d-block d-md-none" href="excel_template.xlsx" download="agrotools_contratistas_template.xlsx">Ejemplo/Template</a>

            <a class="btn btn-primary d-none d-md-block" href="excel_template.xlsx" download="agrotools_contratistas_template.xlsx">Descargar Ejemplo/Template</a>
          
            <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
              <button type="button" class="btn btn-primary" @click=${this.save_imports}>Guardar</button>
            </div>
          </div>
        </div>
      </div>

    
    
    
    
    <div
        class="modal fade"
        id="modal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-fullscreen">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Contratistas</h5>

              <vaadin-menu-bar
                theme="small"
                .items="${[{ text: 'Importar/Exportar', children: [{ text: 'Importar Excel',value : "importar_excel" }, { text: 'Exportar Excel', value: 'exportar_excel' }] }]}"
                @item-selected=${this.menu_click}
                class='ms-1'
              ></vaadin-menu-bar>

            </div>
            <div class="modal-body">
              <vaadin-grid .items=${this._contratistas} all-rows-visible>
                <vaadin-grid-column
                  header="Nombre"
                  path="nombre"
                  auto-width
                ></vaadin-grid-column>
                <vaadin-grid-column
                  header="CUIT"
                  path="cuit"
                ></vaadin-grid-column>
                <vaadin-grid-column
                  header="Labores"
                  .renderer=${this.laboresRenderer}
                ></vaadin-grid-column>
                <vaadin-grid-column
                  header="Acción"
                  .renderer=${this.statusRenderer}
                ></vaadin-grid-column>
              </vaadin-grid>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

    

      <contratista-crud
        id="contratista-crud"
        .db=${this.db}
      ></contratista-crud> `;
  }
}

customElements.define("contratistas-lista", ContratistasLista);

declare global {
  interface HTMLElementTagNameMap {
    "contratistas-lista": ContratistasLista;
  }
}
