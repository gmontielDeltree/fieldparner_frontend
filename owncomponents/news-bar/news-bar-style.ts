import { css } from "lit";

export const news_bar_css = css`
  :host {
    --color-text: #e0e0ec;
    --color-bg: #358c0b;
    --color-bg-accent: #ecdcc0;
    --size: clamp(10rem, 1rem + 40vmin, 30rem);
    --gap: calc(var(--size) / 14);
    --duration: 240s;
    --scroll-start: 0;
    --scroll-end: calc(-100% - var(--gap));
  }

  /* Parent wrapper */
  .total_wrapper {
    display: flex;
    flex-direction: row;
    margin: auto;
    /* width: 100vw; */
    background-color: var(--color-bg);
  }

  /* Parent wrapper */
  .wrapper {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-width: 0;
    gap: var(--gap);
    margin: auto;
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
    background-color: var(--color-bg);
    margin: 0px;
    color: var(--color-text);
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

  @keyframes fade {
    to {
      opacity: 0;
      visibility: hidden;
    }
  }
`;
