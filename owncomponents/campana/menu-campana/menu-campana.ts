import { html, LitElement, PropertyValueMap, render } from "lit";
import { customElement, state } from "lit/decorators.js";
import "@vaadin/menu-bar";
import "../upsert-campana/upsert-campana-dialog";
import { MenuBarItemSelectedEvent, SubMenuItem } from "@vaadin/menu-bar";
import {
  touchEvent,
  gbl_docs_starting,
  only_docs,
  deepcopy,
} from "../../helpers";
import { get, translate } from "lit-translate";
import { StateController } from "@lit-app/state";
import { gbl_state, gblStateLoaded, gblCampanaSeleccionadaLoaded } from "../../state";
import { until } from "lit/directives/until.js";
import uuid4 from "uuid4";

@customElement("menu-campana-button")
export class MenuCampanaButton extends LitElement {
  @state()
  private items = [
    {
      text: "no season",
      children: [],
    },
  ];

  @state()
  loaded: boolean = false;

  @state()
  campanas: Campana[];

  @state()
  dialogOpened: boolean = false;

  private campana_2_edit: Campana;
  private edit_campana: boolean;


  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    console.log("menu-campanas-willUpdate",gblCampanaSeleccionadaLoaded())
    if (!this.loaded && gblCampanaSeleccionadaLoaded()) {
      this.load_campanas();
    }
  }

  private bind = new StateController(
    this,
    gbl_state,
    () => {
      console.log("State Changed",gbl_state)
      if(!this.loaded && gblCampanaSeleccionadaLoaded()){
        this.load_campanas();
      }
    }
    // TODO Si cambia la db deberia recargar campanas
  );

  async load_campanas() {
    // Primero checkear
    console.count("load-campanas")
    if(gbl_state.campana_seleccionada === undefined){
      console.log("campaña seleccionada undef")
      return;
    }

    console.log("campaña seleccionada def")

    return gbl_docs_starting("campana", true)
      .then(only_docs)
      .then((c) => {
        console.log("campañas disponibes",c)

        this.campanas = c as unknown as Campana[];
        this.regenerateMenu();
        this.loaded = true;
      });
  }

  /* 
	Cuando gbl_state.db esta definido cargar las campañas y regenerar el menu
  */

  createItem(campana: Campana) {
    const item = document.createElement("vaadin-context-menu-item");
    item.style.padding = "0px";
    const nombre = document.createElement("span");
    nombre.textContent = campana.nombre;
    item.appendChild(nombre);

    const edit_btn = document.createElement("vaadin-button");
    edit_btn.style.margin = "10px";
    edit_btn.addEventListener(touchEvent, () => {
      console.log("CLICK en menu", campana);
      this.dialogOpened = true;
      this.campana_2_edit = campana;
      this.edit_campana = true;
    });
    edit_btn.textContent = get("editar");
    item.appendChild(edit_btn);

    return item;
  }

  regenerateMenu() {
    console.count("Regenerate Menu Campañas");
    let children: Object[] = this.campanas.map((c) => {
      return {
        component: this.createItem(c),
        seleccionar_campana: () => {
          gbl_state.campana_seleccionada = c;
        },
      };
    });



    children.push({ component: "hr" });
    children.push({
      text: get("nueva_campana"),
      value: "nueva",
      callback: () => {
        console.log("nueva_campana");
      },
    });

    let new_menu = {
      children: children,
      text: children.length === 0 ? get('sin_temporada') : gbl_state.campana_seleccionada.nombre,
    };
    this.items = [new_menu];

    console.log("Regenerate Menu", this.items);
  }

  guardar_campana(c: Campana) {
    if (!c._id) {
      // Nueva
      let uuid = uuid4();
      c._id = "campana:" + uuid;
      gbl_state.db.put(c).then(() => {
        // Seleccionar la nueva campaña por defecto
        gbl_state.campana_seleccionada = c;
        this.userdbUpdateCampanaSeleccionada();
        this.load_campanas();
      });
    } else {
      // Edicion
      gbl_state.db.put(c);
      this.load_campanas();
    }
  }

  borrar_campana(c: Campana) {
    gbl_state.db.remove(c as PouchDB.Core.RemoveDocument).then(() => {
      this.load_campanas();
    });
  }

  render() {
    if (this.loaded) {
      return html`
        <vaadin-menu-bar
          .items="${this.items}"
          @item-selected="${this.itemSelected}"
        >
          <upsert-campana-dialog
            .dialogOpened=${this.dialogOpened}
            .campanas=${this.campanas}
            .campana_to_edit=${this.campana_2_edit}
            @opened-changed=${(e) => {
              this.dialogOpened = e.detail.value;
            }}
            @save-campana=${(e) => {
              console.log("save-campana event", e);
              this.guardar_campana(e.detail);
            }}
            @borrar-campana=${(e) => {
              console.log("borrar-campana event", e);
              this.borrar_campana(e.detail);
            }}
            .edit=${this.edit_campana}
          ></upsert-campana-dialog>
        </vaadin-menu-bar>
      `;
    } else {
      return null;
    }
  }

  itemSelected(e: MenuBarItemSelectedEvent) {
    const item = e.detail.value;
    console.log("item seleccionado", e.detail.value);
    this.items[0].children.forEach((c) => {
      c.checked = false;
    });

    if (item.value !== "nueva") {
      (item as SubMenuItem).checked = !(item as SubMenuItem).checked;
      // Seleccionar
      item.seleccionar_campana();
      this.items[0].text = gbl_state.campana_seleccionada.nombre;
      this.items = [...this.items];
      this.userdbUpdateCampanaSeleccionada();
    } else {
      // Click en nueva
      this.dialogOpened = true;
      this.edit_campana = false;
    }
  }

  userdbUpdateCampanaSeleccionada() {
    let cs = gbl_state.campana_seleccionada;
    gbl_state.user_db
      .allDocs({ key: "campana_seleccionada", include_docs: true })
      .then((result) => {
        console.log("RESULT",result)
        if (result.rows.length > 0) {
          let actual: { _id: string; seleccionada: Campana } = result.rows[0]
            .doc as unknown as {
            _id: string;
            _rev: string;
            seleccionada: Campana;
          };
          actual.seleccionada = cs;
          gbl_state.user_db.put(actual);
        } else {
          //No existe
          let s = { _id: "campana_seleccionada", seleccionada: cs };
          gbl_state.user_db.put(s);
        }
      });
  }
}
