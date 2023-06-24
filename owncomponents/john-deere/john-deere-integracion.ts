import { LitElement, PropertyValueMap, css, html } from "lit";
import "./fp-sidebar";
import { property, state } from "lit/decorators.js";
import {
  jd_get_files,
  jd_get_organizations,
  john_deere_login,
} from "./john-deere-functions";
import { RouterLocation } from "@vaadin/router";
import { gbl_state } from "../state";
import { OrganizationsResponse } from "./john-deere-types";

export class JohnDeereIntegracion extends LitElement {
  @state()
  logged_in_to_johndeere: boolean = false;

  login_to_john_deere() {
    john_deere_login();
  }

  @property({ attribute: false })
  location: RouterLocation;

  @state()
  orgResp: OrganizationsResponse | undefined = undefined;

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

  //*css*/`
  // http://localhost:5173/integraciones/john-deere?token_type=Bearer&expires_in=43200&access_token=eyJraWQiOiJNYy1mX1BROElHSFpVeHRKc3pKd0lUeHRHVjlLS081Q1J1Zm5ZbDZyN0xzIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULktqWmQ3RE5ZQ1RIZ01pZmluOUI4cmdXeUZnTTUzZDl1ak5uY085TnJaQUUub2FyMTR5cmd2cVFTcVZsZlA1ZDciLCJpc3MiOiJodHRwczovL3NpZ25pbi5qb2huZGVlcmUuY29tL29hdXRoMi9hdXM3OHRubGF5c01yYUZoQzF0NyIsImF1ZCI6ImNvbS5kZWVyZS5pc2cuYXhpb20iLCJpYXQiOjE2ODc1NTAzNzksImV4cCI6MTY4NzU5MzU3OSwiY2lkIjoiMG9hOXFzM2lydUdVTk9lS001ZDciLCJ1aWQiOiIwMHU5cG0ydG91VjRhMXdrVzVkNyIsInNjcCI6WyJhZzEiLCJvZmZsaW5lX2FjY2VzcyIsImZpbGVzIiwicHJvZmlsZSIsIm9wZW5pZCIsImVxMSJdLCJhdXRoX3RpbWUiOjE2ODc1NDk3NjYsInN1YiI6IkxhemxvUGFuYWZsZXgiLCJpc2NzYyI6dHJ1ZSwidGllciI6IlNBTkRCT1giLCJjbmFtZSI6IkZpZWxkUGFydG5lciIsInVzZXJUeXBlIjoiQ3VzdG9tZXIifQ.n0w_W7DqHK_noVRzaKadk1gLa4Rfj2js72U0IQmsqiiIu2LXgWQemupIhB66YA74o03Nfkn_zHG8MKOpGAkkAAs2G5K4gJdXad1sfSH46iwZwdKdfAsFiiEat2dc65M6Xm5I_j_ELza4aQQfOlGNUKCce8VCV3eTl8zcu9fl6VbnuUAMBh2VKJzCF7coIyuf-G7baeVQ7lXo0mTVUFgiWofHR7E-qvCWA6Sj9ttwlPdy3AVvlv3jS-CJTOIL8KjFMs-wNQzdklfGCvzJ_I89-h43ZTQ-eHgzOv3HwES45_L-0nxkdt4NIZSyfH_kkpnZz4mT-Yp-Cocf5nSW89e0zw&scope=ag1%20offline_access%20files%20profile%20openid%20eq1&refresh_token=f3GHtfFh67pWNyordjItZOqkuNjXX1mS3eZB55KCwaU&id_token=eyJraWQiOiJNYy1mX1BROElHSFpVeHRKc3pKd0lUeHRHVjlLS081Q1J1Zm5ZbDZyN0xzIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIwMHU5cG0ydG91VjRhMXdrVzVkNyIsIm5hbWUiOiJMYXpsbyBQYW5hZmxleCIsInZlciI6MSwiaXNzIjoiaHR0cHM6Ly9zaWduaW4uam9obmRlZXJlLmNvbS9vYXV0aDIvYXVzNzh0bmxheXNNcmFGaEMxdDciLCJhdWQiOiIwb2E5cXMzaXJ1R1VOT2VLTTVkNyIsImlhdCI6MTY4NzU1MDM3OSwiZXhwIjoxNjg3NTUzOTc5LCJqdGkiOiJJRC5aSFJNV2Nra194ZU9LQnd5ZmV2djdwblNzVkFpbmxoWU4yYmJlWGdTdHkwIiwiYW1yIjpbInB3ZCJdLCJpZHAiOiIwb2EyeXBpNG82N3dvN1BqQTF0NyIsInByZWZlcnJlZF91c2VybmFtZSI6IkxhemxvUGFuYWZsZXgiLCJhdXRoX3RpbWUiOjE2ODc1NDk3NjYsImF0X2hhc2giOiJTOTE4QXZsU0F1SjZsb1hCUzYxX1dRIiwiamRNZW1iZXIiOltdLCJ1c2VyVHlwZSI6IkN1c3RvbWVyIiwidXNlcklEIjoiTGF6bG9QYW5hZmxleCJ9.rW2krRfxMtc_R3WmSO0nLu2d3W9KIWe6QclsXHTVsYYmojHrZQjlyemV0R3Xwkg040qnNYWU-WFlr_visdRL_RDAOw_bUqAV6Hm83h-alVuSjl_BRPwXV6DGcvq6EbhPV99hDNtcpvmgEK2Sfmav51kN2qYRR6N57QsuOMzEykayulwllP46XLI7hrscfATeYOz6H4R_yRfS1Zof49qRvSH2-ezdYhMGjui6wVh3rhKRDcUdnSO9v5e6T4W89Dcj5cHMLeylE4ejeW9g3SOtRWQ7v-Arrh3j6mAKNEUzgi-34eDtn-lw1mWf1CUSoYSp2VEl2Q7hx9uG_hbIUcFZXQ

  render() {
    return html`
      <fp-sidebar>
        <div slot="title">Integración JD</div>
        <div slot="content">
          ${gbl_state.jd_integracion.access_token === ""
            ? html`<form method="post" action="/api/john-deere-login">
                <button type="submit">Acceder a John</button>
              </form>`
            : html`<div>Usted esta loggeado en JD</div>
                <button
                  @click=${async () => {
                    let orgs = await jd_get_organizations(
                      gbl_state.jd_integracion.access_token
                    );
                    console.log("ORGS", orgs);
                    this.orgResp = orgs;
                    this.requestUpdate();
                  }}
                >
                  ORG
                </button>`}

          <div>
            ${this.orgResp?.values.map((org) => {
              html`<button>
                ${org.name}
              </button>`;
            })}
          </div>
        </div>
      </fp-sidebar>
    `;
  }
}

customElements.define("john-deere-integracion", JohnDeereIntegracion);
