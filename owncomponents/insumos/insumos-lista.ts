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
import bootstrap from "bootstrap/dist/css/bootstrap.min.css";
import Modal from "bootstrap/js/dist/modal";
import lista_de_labores from "./labores.json";
import { uuid4 } from "uuid4";
import PouchDB from "pouchdb";
import { Insumo, get_empty_insumo } from "./insumos-types";
import { InsumoCrud } from "./insumos-crud";
import { GridItemModel } from "@vaadin/grid";
import "./insumos-crud";
import "@vaadin/icons";
import "@vaadin/upload";
import "@vaadin/dialog";
import { read, writeFile, utils } from "xlsx";
import { i18n_upload } from "../i18n/vaadin";
import { Upload } from "@vaadin/upload";
import '@vaadin/menu-bar';

export class InsumosLista extends LitElement {
  @state()
  _insumos: Insumo[];

  @state({
    hasChanged(newVal: Modal, oldVal: Modal) {
      return false;
    },
  })
  _modal: Modal;

  @property()
  db: PouchDB.Database;

  @state()
  _modal_excel: Modal;

  @state()
  _uploaded_contratistas : any; 

  @state()
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
      if (event.data.action !== "load-excel-insumos") {
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

  load_data(){
    this.db.allDocs({startkey:"insumo:", endkey:"insumo:\ufff0", include_docs:true }).then((e: any) => {
      //this._insumos = Object.values(e.);
      console.log("Insumos DOC", e);
      this._insumos = e.rows.map((r) => r.doc)
    })
    .catch((e) => {});
  }

  show() {
    this._modal.show();
    this.load_data();
  }

  edit(c: Insumo) {
    this._modal.hide();
    let ic = this.shadowRoot.getElementById("insumo-crud") as InsumoCrud 
    ic.edit(c);
  }

  borrar(c: Insumo) {
    this.db.remove(c as any).then((e: any) => {
       this.load_data() // Reload
      })
      .catch((e) => {});
  }

  private actionsRenderer = (
    root: HTMLElement,
    _: HTMLElement,
    model: GridItemModel<Insumo>
  ) => {
    const insumo = model.item;
    render(
      html`
        <span theme="badge" @click=${() => this.edit(insumo)}
          ><vaadin-icon icon="vaadin:edit"></vaadin-icon
        ></span>

        <span theme="badge" @click=${() => this.borrar(insumo)}
          ><vaadin-icon icon="vaadin:trash"></vaadin-icon
        ></span>
      `,
      root
    );
  };

  private seAplicaARenderer = (
    root: HTMLElement,
    _: HTMLElement,
    model: GridItemModel<Insumo>
  ) => {
    const insumo = model.item;
    const se_aplica_a = insumo.se_aplica_a;

    render(
      html`
        <vaadin-vertical-layout>
          ${se_aplica_a.map((c) => {
            let theme = ""
            if (c.cultivo === "Soja") {
              theme="primary success small"
            } else if (c.cultivo === "Maiz") {
              theme="primary error small";
            } else {
              theme="primary contrast small";
            }
            return html`<vaadin-button theme=theme
              >${c.cultivo}</vaadin-button
            >`
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
    // const up_to_contratista = (up) => {
    //   let contratista : Contratista = {...empty_contratista}
      
    //   contratista.nombre = up.Nombre || ""
    //   contratista.cuit = up.CUIT || ""
    //   contratista.datos_generales = {...empty_contratista.datos_generales}
    //   contratista.datos_generales.email = up.Email || ""
    //   contratista.datos_generales.telefono = up["Teléfono"] || ""
    //   contratista.datos_generales.direccion = up['Dirección'] || ""
    //   contratista.labores = []
      
    //   if(up.Labores_1){
    //     let labor_buscada = up.Labores_1;
    //     let labor_encontrada = lista_de_labores.find((x) => x.labor.toLowerCase() === labor_buscada.toLowerCase())
    //     if(labor_encontrada){
    //       contratista.labores.push(labor_encontrada)
    //     }else{
    //       contratista.labores.push({labor: labor_buscada.toLowerCase, uuid:uuid4()}) 
    //     }
    //   }

    //   if(up.Labores_2){
    //     let labor_buscada = up.Labores_2;
    //     let labor_encontrada = lista_de_labores.find((x) => x.labor.toLowerCase() === labor_buscada.toLowerCase())
    //     if(labor_encontrada){
    //       contratista.labores.push(labor_encontrada)
    //     }else{
    //       contratista.labores.push({labor: labor_buscada.toLowerCase, uuid:uuid4()}) 
    //     }
    //   }

    //   if(up.Labores_3){
    //     let labor_buscada = up.Labores_3;
    //     let labor_encontrada = lista_de_labores.find((x) => x.labor.toLowerCase() === labor_buscada.toLowerCase())
    //     if(labor_encontrada){
    //       contratista.labores.push(labor_encontrada)
    //     }else{
    //       contratista.labores.push({labor: labor_buscada.toLowerCase, uuid:uuid4()}) 
    //     }
    //   }

    //   if(up.Labores_4){
    //     let labor_buscada = up.Labores_4;
    //     let labor_encontrada = lista_de_labores.find((x) => x.labor.toLowerCase() === labor_buscada.toLowerCase())
    //     if(labor_encontrada){
    //       contratista.labores.push(labor_encontrada)
    //     }else{
    //       contratista.labores.push({labor: labor_buscada.toLowerCase, uuid:uuid4()}) 
    //     }
    //   }

    //   return contratista
    // }



    // //console.log("CONT uc", this._uploaded_contratistas)
    // let todos_los_contratistas = this._uploaded_contratistas.map(up_to_contratista)

    // //console.log("CONT sin uuid", todos_los_contratistas, this._uploaded_contratistas)
    // let todos_los_contratistas_con_uuid : (Contratista & {uuid:string}) [] = todos_los_contratistas.map((c : Contratista) => {
    //   let nuevo_uuid = uuid4()
    //   c.uuid = nuevo_uuid
    //   return c;
    // })
    
    // //console.log("CONT", todos_los_contratistas_con_uuid)
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
      const insumo_a_row = (c : Insumo) => {
        let row = {
          "marca_comercial":c.marca_comercial,
          "principio_activo":c.principio_activo,
          "tipo":c.tipo,
          "subtipo":c.subtipo,
          "unidad":c.unidad,
        }
        return row;
      }


      let data = this._insumos.map(insumo_a_row)

      
      const worksheet = utils.json_to_sheet(data);
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Insumos");
      writeFile(workbook, "Insumos.xlsx");
      console.log(this._insumos)
    }else if(valor === 'nuevo'){
      ((this.shadowRoot.getElementById('insumo-crud')) as InsumoCrud).insumo = get_empty_insumo();
      ((this.shadowRoot.getElementById('insumo-crud')) as InsumoCrud).show();
      this._modal.hide()
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
              <h5 class="modal-title" id="exampleModalLabel">Insumos</h5>

              <vaadin-menu-bar
                theme="small"
                .items="${[{ text: 'Más Acciones', children: [{ text: 'Nuevo',value : "nuevo" }, { text: 'Importar Excel',value : "importar_excel" }, { text: 'Exportar Excel', value: 'exportar_excel' }] }]}"
                @item-selected=${this.menu_click}
                class='ms-1'
              ></vaadin-menu-bar>

            </div>
            <div class="modal-body">
              <vaadin-grid .items=${this._insumos} all-rows-visible>
                <vaadin-grid-column
                  header="Marca Comercial"
                  path="marca_comercial"
                  auto-width
                ></vaadin-grid-column>
                <vaadin-grid-column
                  header="Principio Activo"
                  path="principio_activo"
                ></vaadin-grid-column>
                <vaadin-grid-column
                  header="Tipo"
                  path="tipo"
                ></vaadin-grid-column>
                <vaadin-grid-column
                  header="Subtipo"
                  path="subtipo"
                ></vaadin-grid-column>
                <vaadin-grid-column
                  header="Unidad"
                  path="unidad"
                ></vaadin-grid-column>
                <vaadin-grid-column
                  header="Se aplica a"
                  .renderer=${this.seAplicaARenderer}
                ></vaadin-grid-column>
                <vaadin-grid-column
                  header="Acción"
                  .renderer=${this.actionsRenderer}
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

    

      <insumo-crud
        id="insumo-crud"
        .db=${this.db}
      ></insumo-crud> `;
  }
}

customElements.define("insumos-lista", InsumosLista);

declare global {
  interface HTMLElementTagNameMap {
    "insumos-lista": InsumosLista;
  }
}
