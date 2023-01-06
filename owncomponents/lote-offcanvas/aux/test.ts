import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@vaadin/menu-bar';
import type { MenuBar, MenuBarItemSelectedEvent, SubMenuItem } from '@vaadin/menu-bar';

@customElement('menu-bar-checkable')
export class ComboFilterButton extends LitElement {

  @property()
  items : string[]

  @state()
  private menu_items = [
    {
      component: this.createItem('filter', 'Filter'),
      children: [],
    },
  ];

  @property()
  selectedItems : string[]


  private checked_items : string []

  marcar_checkmarks(){
    this.menu_items[0].children.forEach((c) => {
        c.checked = this.selectedItems.includes("Todos") || this.selectedItems.includes(c.text);
    })
  }

  willUpdate(cp){
    if(cp.has('items')){
        let new_children = this.items.map((i)=>{return {text:i , checked:false}})
        this.menu_items[0].children = new_children;

        if(this.selectedItems){
           this.marcar_checkmarks()
        }
    }

    if(cp.has('selectedItems')){
        // Seleccionar
        console.log('Categorias INICIALES',this.selectedItems,this.menu_items[0].children)
        this.marcar_checkmarks()    

    }
  }

  render() {
    return html`
      <vaadin-menu-bar
        theme="tertiary-inline"
        open-on-hover
        .items="${this.menu_items}"
        @item-selected="${this.itemSelected}"
      ></vaadin-menu-bar>
    `;
  }

  itemSelected(e: MenuBarItemSelectedEvent) {
    const item = e.detail.value;
    (item as SubMenuItem).checked = !(item as SubMenuItem).checked;

    //console.log("ITEM",item,this.menu_items[0].children);

    let checked_menu_items = [...this.menu_items[0].children.filter((m) => m.checked)]
    let a = checked_menu_items.map((m)=>m.text)

    // //Emitir Evento de cambio de seleccion
    this.dispatchEvent(
        new CustomEvent("selectedItemsChanged",{detail:a,bubbles:true,composed:true})
    )

  }

  createItem(iconName: string, ariaLabel: string) {
    const item = document.createElement('vaadin-context-menu-item');
    const icon = document.createElement('vaadin-icon');
    item.setAttribute('aria-label', ariaLabel);
    icon.setAttribute('icon', `vaadin:${iconName}`);
    item.appendChild(icon);
    return item;
  }
}