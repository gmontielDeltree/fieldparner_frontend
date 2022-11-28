import { LitElement, html, PropertyValueMap } from "lit";
import { customElement, state } from "lit/decorators.js";
import { Workspace } from "./workspace_types";
import gbl_state from "../state"

@customElement('workspace-rights')
export class WorkspaceRights extends LitElement {

  @state({hasChanged:(v,ov)=>false})
  workspace : Workspace

  @state()
  loaded : boolean = false

  protected willUpdate(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    let params = gbl_state.router.location.params;
    let uuid_workspace = params.uuid_workspace as string
    gbl_state.user_db.get(uuid_workspace).then((doc)=>{
      this.workspace = doc as unknown as Workspace
      this.loaded = true
    })
  }

  render() {
    return html``;
  }
}
