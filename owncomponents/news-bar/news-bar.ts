import { LitElement, html, css } from "lit";
import { property } from "lit/decorators.js";

class Newsbar extends LitElement {
  @property()
  news;

  static styles = css`
    :host {
      --color-text: #e0e0ec;
      --color-bg: #4bd857;
      --color-bg-accent: #ecdcc0;
      --size: clamp(10rem, 1rem + 40vmin, 30rem);
      --gap: calc(var(--size) / 14);
      --duration: 60s;
      --scroll-start: 0;
      --scroll-end: calc(-100% - var(--gap));
    }

    .marquee {
      display: flex;
      overflow: hidden;
      user-select: none;
      
      gap: var(--gap);
      mask-image: linear-gradient(
        var(--mask-direction, to right),
        hsl(0 0% 0% / 0),
        hsl(0 0% 0% / 1) 20%,
        hsl(0 0% 0% / 1) 80%,
        hsl(0 0% 0% / 0)
      );
    }

    .marquee__group {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-around;
      background-color:var(--color-bg);
      color:var(--color-text);
      gap: var(--gap);
      min-width: 100%;
      animation: scroll-x var(--duration) linear infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      .marquee__group {
        animation-play-state: paused;
      }
    }

    @keyframes scroll-x {
      from {
        transform: translateX(var(--scroll-start));
      }
      to {
        transform: translateX(var(--scroll-end));
      }
    }

    @keyframes scroll-y {
      from {
        transform: translateY(var(--scroll-start));
      }
      to {
        transform: translateY(var(--scroll-end));
      }
    }

    /* Element styles */
    .marquee svg {
      display: grid;
      place-items: center;
      width: var(--size);
      fill: var(--color-text);
      background: var(--color-bg-accent);
      aspect-ratio: 16/9;
      padding: calc(var(--size) / 10);
      border-radius: 0.5rem;
    }

    /* Parent wrapper */
    .wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--gap);
      margin: auto;
      max-width: 100vw;
    }

    @keyframes fade {
      to {
        opacity: 0;
        visibility: hidden;
      }
    }
  `;

  render() {
    return html`
      <div class="wrapper">
        <div class="marquee">
          <ul class="marquee__group">
            ${this.news.map((news) => {
              return html`
                <li class="marquee__item">
                  <a href="${news.link}" target="_blank">${news.title}</a>
                </li>
              `;
            })}
          </ul>

          <ul class="marquee__group" aria-hidden="true">
            ${this.news.map((news) => {
              return html`
                <li class="marquee__item">
                  <a href="${news.link}" target="_blank">${news.title}</a>
                </li>
              `;
            })}
          </ul>
        </div>
      </div>
    `;
  }
}

customElements.define("news-bar", Newsbar);
