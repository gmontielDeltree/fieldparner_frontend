import { html, LitElement } from "lit";
import lgZoom from "lightgallery/plugins/zoom";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgRotate from "lightgallery/plugins/rotate";
import lgShare from "lightgallery/plugins/share";
import { customElement, property } from "lit/decorators.js";
import "./light-gallery-lit"

const settings = {
  speed: 200,
  download: false,
  plugins: [lgZoom, lgThumbnail, lgRotate, lgShare]
};

@customElement('light-gallery-demo')
export class LightGalleryDemo extends LitElement {
 
	@property()
	list: any[]
 
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

  render() {
    return html`
      <light-gallery .settings=${settings} id="lit-gallery" @lgBeforeOpen=${()=>this.emit_bo()} @lgAfterClose=${()=>this.emit_ac()}>
        ${this.getItems()}
      </light-gallery>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
      'light-gallery-demo': LightGalleryDemo;
  }
}