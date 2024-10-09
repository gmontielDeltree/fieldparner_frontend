import { LitElement, css, html } from "lit";
import { property } from "lit-element";

export class FPSidebar extends LitElement {

  static override styles = css`

.sidebar {
        position: absolute;
         top: 0;
         left: 0;
         bottom: 0; 
        width: 100%;
        background-color: #f5f5f5;
        border-radius: 10px;
        z-index: 3;
        display: flex;
        flex-direction: column;
      }

      .title {
        font-size: 24px;
        font-weight: bold;
        /* margin-bottom: 16px; */
        padding: 16px;
      }

      .content {
        /* margin-top: 16px; */
        padding: 16px;
        overflow-y: auto;
      }

      .close-button {
        position: relative;
        top: 8px;
        right: 8px;
        background-color: transparent;
        border: none;
        cursor: pointer;
      }
      .header{
        display:flex;
        justify-content:space-between;
        align-items:baseline;
      }
  `;

hideSidebar() {
  // this.style.display = 'none';
  this.dispatchEvent(new CustomEvent("onClose",{bubbles:true,composed:true}))
}
  render() {
    return html`
     <div class="sidebar">
   
     <div class="header">
       <div class="title">
          <slot name="title"></slot>
        </div>    
         <button class="close-button" @click="${this.hideSidebar}">

         <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0,0,256,256" width="30px" height="30px"><g fill="#331fd6" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(8.53333,8.53333)"><path d="M7,4c-0.25587,0 -0.51203,0.09747 -0.70703,0.29297l-2,2c-0.391,0.391 -0.391,1.02406 0,1.41406l7.29297,7.29297l-7.29297,7.29297c-0.391,0.391 -0.391,1.02406 0,1.41406l2,2c0.391,0.391 1.02406,0.391 1.41406,0l7.29297,-7.29297l7.29297,7.29297c0.39,0.391 1.02406,0.391 1.41406,0l2,-2c0.391,-0.391 0.391,-1.02406 0,-1.41406l-7.29297,-7.29297l7.29297,-7.29297c0.391,-0.39 0.391,-1.02406 0,-1.41406l-2,-2c-0.391,-0.391 -1.02406,-0.391 -1.41406,0l-7.29297,7.29297l-7.29297,-7.29297c-0.1955,-0.1955 -0.45116,-0.29297 -0.70703,-0.29297z"></path></g></g></svg>

          <!-- <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="none" d="M0 0h24v24H0z"/>
            <path d="M18.3 5.71a1 1 0 0 1 1.41 1.41L6.41 19.72a1 1 0 0 1-1.41-1.41L18.3 5.71z"/>
            <path fill="none" d="M0 0h24v24H0V0z"/>
          </svg> -->
        </button>
     </div>
       
        <div class="content">
          <slot name="content"></slot>
        </div>
      </div>

    `;
  }
}

customElements.define("fp-sidebar", FPSidebar);
