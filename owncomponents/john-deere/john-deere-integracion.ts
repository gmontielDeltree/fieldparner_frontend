import { LitElement, PropertyValueMap, css, html } from "lit";
import "./fp-sidebar";
import { property, state } from "lit/decorators.js";
import {
  jd_get_farms_boundaries,
  jd_get_machine_position,
  jd_get_machines,
  jd_get_organizations,
  john_deere_login,
} from "./john-deere-functions";
import { RouterLocation } from "@vaadin/router";
import { gbl_state } from "../state";
import {
  FileResponse,
  JDMachine,
  LocationHistoryResponse,
  OrganizationsResponse,
  Value,
} from "./john-deere-types";
import "@vaadin/combo-box";
import "./john-deere-boundaries-list";
import { Task } from "@lit-labs/task";
import jwt_decode, { JwtPayload } from "jwt-decode";
import { ComboBoxSelectedItemChangedEvent } from "@vaadin/combo-box";
import "@vaadin/button";
import { GeoJSONSource, Marker, Popup } from "mapbox-gl";
import "@shoelace-style/shoelace/dist/components/tree/tree.js";
import "@shoelace-style/shoelace/dist/components/tree-item/tree-item.js";
import { campo_guardar, empty_feature_collection } from "../helpers";
import { FeatureCollection } from "@turf/helpers";
import bbox from "@turf/bbox";
import { Campo } from "../tipos/campos";
import { uuidv7 } from "uuidv7";
import { showNotification } from "../helpers/notificaciones";

const base_url = import.meta.env.VITE_INTEGRACIONES_SERVER_URL;

export class JohnDeereIntegracion extends LitElement {
  @property({ attribute: false })
  location: RouterLocation;

  @state()
  orgResp: OrganizationsResponse | undefined = undefined;

  @state()
  files: FileResponse | undefined = undefined;

  @state()
  boundaries: any[] = [];

  @state()
  equipment: JDMachine[] = [];

  login_to_john_deere() {
    john_deere_login();
  }

  static styles = css`
    .boundaries-and-machines {
      margin: 0 auto;
      width: 800px;
    }

    h1 {
      text-align: center;
    }

    ul {
      list-style-type: none;
      margin: 0;
      padding: 0;
    }

    li {
      margin-bottom: 10px;
      border-style: groove;
    }

    .machines {
      display: flex;
      flex-direction: column;
      border: 5px;
    }

    .combo {
      width: 80%;
    }
  `;

  private _loadTask = new Task(
    this,
    () => this.load_orgs(),
    () => [this.location]
  );

  async load_orgs() {
    if (this.is_logged_in()) {
      console.log("user is logged in to JD");
      this.orgResp = await jd_get_organizations(
        gbl_state.jd_integracion.access_token
      );
    } else {
      console.log("user is NOT logged in to JD");
    }
  }

  protected willUpdate(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has("location")) {
      const query = window.location.search;
      if (
        query.includes("token_type=") &&
        query.includes("expires_in=") &&
        query.includes("access_token=")
      ) {
        // Save token?
        let qp = new URLSearchParams(query);
        let ijd = { access_token: "", expires_in: 0 };
        ijd.access_token = qp.get("access_token") ?? "";
        ijd.expires_in = +(qp.get("expires_in") ?? 0);
        gbl_state.jd_integracion = ijd;
        console.log("State", gbl_state.jd_integracion, qp);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    }
  }

  is_logged_in() {
    try {
      let dt = jwt_decode<JwtPayload>(gbl_state.jd_integracion.access_token);

      if (dt.exp === undefined) {
        return false;
      }
      if (dt.exp < Date.now() / 1000) {
        //Expiro o no existe
        return false;
      } else {
        return true;
      }
    } catch (e) {
      return false;
    }
  }

  //*css*/`
  // http://localhost:5173/integraciones/john-deere?token_type=Bearer&expires_in=43200&access_token=eyJraWQiOiJNYy1mX1BROElHSFpVeHRKc3pKd0lUeHRHVjlLS081Q1J1Zm5ZbDZyN0xzIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULktqWmQ3RE5ZQ1RIZ01pZmluOUI4cmdXeUZnTTUzZDl1ak5uY085TnJaQUUub2FyMTR5cmd2cVFTcVZsZlA1ZDciLCJpc3MiOiJodHRwczovL3NpZ25pbi5qb2huZGVlcmUuY29tL29hdXRoMi9hdXM3OHRubGF5c01yYUZoQzF0NyIsImF1ZCI6ImNvbS5kZWVyZS5pc2cuYXhpb20iLCJpYXQiOjE2ODc1NTAzNzksImV4cCI6MTY4NzU5MzU3OSwiY2lkIjoiMG9hOXFzM2lydUdVTk9lS001ZDciLCJ1aWQiOiIwMHU5cG0ydG91VjRhMXdrVzVkNyIsInNjcCI6WyJhZzEiLCJvZmZsaW5lX2FjY2VzcyIsImZpbGVzIiwicHJvZmlsZSIsIm9wZW5pZCIsImVxMSJdLCJhdXRoX3RpbWUiOjE2ODc1NDk3NjYsInN1YiI6IkxhemxvUGFuYWZsZXgiLCJpc2NzYyI6dHJ1ZSwidGllciI6IlNBTkRCT1giLCJjbmFtZSI6IkZpZWxkUGFydG5lciIsInVzZXJUeXBlIjoiQ3VzdG9tZXIifQ.n0w_W7DqHK_noVRzaKadk1gLa4Rfj2js72U0IQmsqiiIu2LXgWQemupIhB66YA74o03Nfkn_zHG8MKOpGAkkAAs2G5K4gJdXad1sfSH46iwZwdKdfAsFiiEat2dc65M6Xm5I_j_ELza4aQQfOlGNUKCce8VCV3eTl8zcu9fl6VbnuUAMBh2VKJzCF7coIyuf-G7baeVQ7lXo0mTVUFgiWofHR7E-qvCWA6Sj9ttwlPdy3AVvlv3jS-CJTOIL8KjFMs-wNQzdklfGCvzJ_I89-h43ZTQ-eHgzOv3HwES45_L-0nxkdt4NIZSyfH_kkpnZz4mT-Yp-Cocf5nSW89e0zw&scope=ag1%20offline_access%20files%20profile%20openid%20eq1&refresh_token=f3GHtfFh67pWNyordjItZOqkuNjXX1mS3eZB55KCwaU&id_token=eyJraWQiOiJNYy1mX1BROElHSFpVeHRKc3pKd0lUeHRHVjlLS081Q1J1Zm5ZbDZyN0xzIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIwMHU5cG0ydG91VjRhMXdrVzVkNyIsIm5hbWUiOiJMYXpsbyBQYW5hZmxleCIsInZlciI6MSwiaXNzIjoiaHR0cHM6Ly9zaWduaW4uam9obmRlZXJlLmNvbS9vYXV0aDIvYXVzNzh0bmxheXNNcmFGaEMxdDciLCJhdWQiOiIwb2E5cXMzaXJ1R1VOT2VLTTVkNyIsImlhdCI6MTY4NzU1MDM3OSwiZXhwIjoxNjg3NTUzOTc5LCJqdGkiOiJJRC5aSFJNV2Nra194ZU9LQnd5ZmV2djdwblNzVkFpbmxoWU4yYmJlWGdTdHkwIiwiYW1yIjpbInB3ZCJdLCJpZHAiOiIwb2EyeXBpNG82N3dvN1BqQTF0NyIsInByZWZlcnJlZF91c2VybmFtZSI6IkxhemxvUGFuYWZsZXgiLCJhdXRoX3RpbWUiOjE2ODc1NDk3NjYsImF0X2hhc2giOiJTOTE4QXZsU0F1SjZsb1hCUzYxX1dRIiwiamRNZW1iZXIiOltdLCJ1c2VyVHlwZSI6IkN1c3RvbWVyIiwidXNlcklEIjoiTGF6bG9QYW5hZmxleCJ9.rW2krRfxMtc_R3WmSO0nLu2d3W9KIWe6QclsXHTVsYYmojHrZQjlyemV0R3Xwkg040qnNYWU-WFlr_visdRL_RDAOw_bUqAV6Hm83h-alVuSjl_BRPwXV6DGcvq6EbhPV99hDNtcpvmgEK2Sfmav51kN2qYRR6N57QsuOMzEykayulwllP46XLI7hrscfATeYOz6H4R_yRfS1Zof49qRvSH2-ezdYhMGjui6wVh3rhKRDcUdnSO9v5e6T4W89Dcj5cHMLeylE4ejeW9g3SOtRWQ7v-Arrh3j6mAKNEUzgi-34eDtn-lw1mWf1CUSoYSp2VEl2Q7hx9uG_hbIUcFZXQ

  render() {
    return html`
      <fp-sidebar>
        <div slot="title">JD Operations Center</div>
        <div slot="content">
          ${!this.is_logged_in()
            ? html`<form
                method="post"
                action=${base_url + "/api/john-deere-login"}
                style="display:flex; justify-content:center;"
              >
                <button type="submit">Acceder a JD Operations Center</button>
              </form>`
            : html`
                <div>
                  <vaadin-combo-box
                    class="combo"
                    label="Organización"
                    item-label-path="name"
                    item-value-path="id"
                    .items=${this.orgResp?.values ?? []}
                    @selected-item-changed="${async (
                      e: ComboBoxSelectedItemChangedEvent<Value>
                    ) => this.selectedOrgChanged(e)}"
                  ></vaadin-combo-box>
                  <h4>Bordes</h4>
                  <sl-tree>
                    ${this.boundaries.map(
                      (boundary) => html`
                        <sl-tree-item>
                          <vaadin-button theme="primary"
                            >${boundary.name}</vaadin-button
                          >
                          <sl-tree-item
                            @click=${() =>
                              this.display_boundary_in_map(boundary)}
                            >Ver en mapa</sl-tree-item
                          >
                          <sl-tree-item @click=${()=>this.importar_como_campo(boundary)}>Importar como Campo</sl-tree-item>
                        </sl-tree-item>
                      `
                    )}
                  </sl-tree>
                  <h4>Equipos</h4>
                  <ul class="machines">
                    ${this.equipment.map(
                      (machine) => html`
                        <li
                          @click=${() => {
                            console.log("Clicked on ", machine);
                            this.display_in_map(machine);
                          }}
                        >
                          ${machine.name}
                          <ul>
                            <li>
                              ${machine.equipmentType.name} -
                              ${machine.equipmentMake.name}
                              ${machine.equipmentModel.name}
                            </li>
                          </ul>
                        </li>
                      `
                    )}
                  </ul>
                </div>
              `}
        </div>
      </fp-sidebar>
    `;
  }

  selectedOrgChanged = async (e) => {
    if (e.detail.value) {
      let orgid = +e.detail.value.id;
      this.boundaries = (
        await jd_get_farms_boundaries(
          gbl_state.jd_integracion.access_token,
          orgid
        )
      ).values;
      this.equipment = (
        await jd_get_machines(gbl_state.jd_integracion.access_token, orgid)
      ).values as unknown as JDMachine[];
    }
  };

  jd_boundary_a_geojson = (boundary) => {
    let e = empty_feature_collection() as FeatureCollection;
    let points_array = boundary.multipolygons[0].rings[0].points as {
      lat: number;
      lon: number;
    }[];

    e.features[0].geometry.coordinates.push(
      points_array.map((p) => [p.lon, p.lat]) as [number, number][]
    );

    e.features[0].properties["name"] = boundary.name;
    e.features[0].properties["hectareas"] = 3;
    return e;
  };

  display_boundary_in_map = (boundary) => {
    let e = this.jd_boundary_a_geojson(boundary);

    console.log("display b t m", e);

    try {
      gbl_state.map.addSource("temp_geojson", { type: "geojson", data: e });
    } catch (_) {
      console.log("addSource already added temp_geojson");
      let sos = gbl_state.map.getSource("temp_geojson") as GeoJSONSource;
      sos.setData(e);
    }

    try {
      gbl_state.map.addLayer({
        id: "temp_geojson",
        type: "fill",
        source: "temp_geojson",
        paint: {
          "fill-color": "rgba(255, 0, 0, 1)",
        },
      });

      gbl_state.map.fitBounds(bbox(e));
    } catch {
      console.log("addLayer already added temp_geojson");
      gbl_state.map.fitBounds(bbox(e));
    }
  };

  importar_como_campo = async (boundary) => {
    let gj = this.jd_boundary_a_geojson(boundary);
    let nc: Campo = {
      _id: "campos_" + boundary.names,
      uuid: uuidv7(),
      nombre: boundary.name,
      campo_geojson: gj,
      lotes: [],

    };
    
    await campo_guardar(nc);
    showNotification("Campo agregado",undefined,'top-center')

  };

  display_in_map = async (machine: JDMachine) => {
    let position_machine: LocationHistoryResponse =
      await jd_get_machine_position(
        gbl_state.jd_integracion.access_token,
        machine
      );

    let punto = position_machine.values[0].point;
    const marker = new Marker().setLngLat([punto.lon, punto.lat]);

    marker.setPopup(
      new Popup().setHTML(`
        <h3>${machine.name}</h3>
        <h4>Model: ${machine.equipmentModel.name}</h4>
        <p>Engine Hours: ${machine.telematicsState}</p>
      `)
    );

    marker.addTo(gbl_state.map);
  };
}

customElements.define("john-deere-integracion", JohnDeereIntegracion);
