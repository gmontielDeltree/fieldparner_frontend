/**
 * Basado en https://ryanmulligan.dev/blog/css-marquee/
 */

import { LitElement, html, css, PropertyValueMap } from "lit";
import { property } from "lit/decorators.js";
import { interpret } from "xstate";
import { news_bar_machine } from "./news-bar.machine";
import { news_bar_css } from "./news-bar-style";
import { SelectorController } from "xstate-lit/dist/select-controller";

class Newsbar extends LitElement {
  private machine = interpret(news_bar_machine).start();

  static styles = [news_bar_css];

  news = new SelectorController(
    this,
    this.machine,
    (state) => state.context.news
  );

  is_hidden = new SelectorController(
    this,
    this.machine,
    (state) => state.value === "hidden"
  );

  subscription = this.machine.subscribe((state) => {
    console.log(state);
  });


  protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    if(this.is_hidden.value){
      this.dispatchEvent(new CustomEvent("hidden"))
    }
  }


  render() {
    return !this.is_hidden.value
      ? html`
          <div class="total_wrapper">
            <div class="wrapper">
              <div class="marquee">
                <ul class="marquee__group">
                  ${this.news.value.map((news) => {
                    return html`
                      <li class="marquee__item">
                        <a href="${news.link}" target="_blank">${news.title}</a>
                      </li>
                    `;
                  })}
                </ul>

                <ul class="marquee__group" aria-hidden="true">
                  ${this.news.value.map((news) => {
                    return html`
                      <li class="marquee__item">
                        <a href="${news.link}" target="_blank">${news.title}</a>
                      </li>
                    `;
                  })}
                </ul>
              </div>
            </div>
            <button
              @click=${(e) => {
                this.machine.send("HIDE");
              }}
            >
              X
            </button>
          </div>
        `
      : null;
  }
}

customElements.define("news-bar", Newsbar);
