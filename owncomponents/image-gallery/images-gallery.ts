import { html, LitElement } from "lit";
import lgZoom from "lightgallery/plugins/zoom";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgRotate from "lightgallery/plugins/rotate";
import lgShare from "lightgallery/plugins/share";
import { customElement, property } from "lit/decorators.js";
import "./light-gallery-lit"
import { touchEvent } from "../helpers";
import { get } from "lit-translate";

const settings = {
  speed: 200,
  download: false,
  plugins: [lgZoom, lgThumbnail, lgRotate, lgShare]
};

@customElement('light-gallery-demo')
export class LightGalleryDemo extends LitElement {
 
	@property()
	list: any[]

  private selected_index : number = 0
 private button_eliminar_initialized = false
 private lgInstance : any;

  getRange(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
  }

  getItems() {
    return this.list.map(
      (item) => html` <a
        data-lg-size="${item.size}"
        class="gallery-item"
        data-src="${item.src}"
        data-html="${item.subHtml}"
      >
        <img class="img-responsive" width='64' height='64' src="${item.thumb}" />
      </a>`
    );
  }

  emit_bo(){
    this.dispatchEvent(new CustomEvent('beforeOpen',{detail:{},bubbles:true,composed:true}))
  }

  emit_ac(){
    this.dispatchEvent(new CustomEvent('afterClose',{detail:{},bubbles:true,composed:true}))
  }

  emit_borrar(index,instance){
    this.dispatchEvent(new CustomEvent('borrarImagen',{detail:{index:index,plugin:instance},bubbles:true,composed:true}))
  }
  render() {
    return html`
      <light-gallery .settings=${settings} id="lit-gallery"
      @lgInit=${
        (e)=>this.lgInstance = e.detail.instance
      }
      @lgAfterOpen=${(e)=>{

        console.log("After Open",e)

        if(!this.button_eliminar_initialized){
          let toolbar = document.getElementById('lg-toolbar-1')
          toolbar.style.display = 'flex'
  
  
          let button = document.createElement('button')
          button.id = 'lg-eliminar-btn'
          button.style.alignItems = 'center'
          button.textContent = get('eliminar')
          
          button.addEventListener(touchEvent,()=>{
            alert('borrar ' + this.selected_index)
            
            this.emit_borrar(this.selected_index,this.lgInstance)
            this.lgInstance.closeGallery()
          })
  
          toolbar.appendChild(button)
          this.button_eliminar_initialized = true
        }
      }} 
      @lgBeforeOpen=${()=>this.emit_bo()} 
      @lgAfterClose=${()=>this.emit_ac()}
      @lgSlideItemLoad=${(e)=>{
        console.log("slideitemload",e)
        this.selected_index = e.detail.index
      }}
      >
        ${this.getItems()}
      </light-gallery>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
      'light-gallery-demo': LightGalleryDemo;
  }
}