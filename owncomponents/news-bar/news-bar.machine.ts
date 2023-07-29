import { state } from "lit/decorators.js";
import { createMachine, assign, send } from "xstate";

interface NewsBarContext {
  news: string[];
}

const fetch_news_feed = async (ctx, evt) => {
  return [
    "Un loco mato a un hamster!!!!",
    "Crecio la poblacion de ciudad Selenita",
  ];
};

const news_bar_machine = createMachine<NewsBarContext>(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QDswHdYH0BGBDATpgLa4DGAFgJaoB01lALpgGZgMUDEEA9rdQG7cA1mBqt25TKgyZ6pSrgA2AbQAMAXUSgADt1iNKvLSAAeiAEyqALDQDMqgJwA2KwFZXtqwA4rD114AaEABPRABGW1saKzCnJwB2K1VXcw8rePiAX0yg6Sw8QhIKalFxYuQoLl5RAWFStgopdFg1TSQQXX0GQ2RjMwR3G0dbeNcHMNHVVXNbINCECPMacbivJ0sw8w2nbNzmnAJiMipaWHJuNGpKgAkASQARAFFW406DI3b+wZph0fHJ6azEKILxLcy+Bx+GbmBy2PxhXYgPIHQrHEo0M4XK4cEywBi4BiiXDMQn4AAU9imAEoOMiCkdyqJMZcKi92m9uh9QF9XENYX8Jq4pjM5uEvKporEEq4nLYvP5XNkckjuBA4MY6YciicwK89O9ep9EABaJyihDG1zLSGQzxhVxhNZ+RGa1GMujIRgsBrkPVdHp9RBWczmsKqLySuLxMIOcMObwpF37ena9FlE5QP0GwMIeKeGjmLybJyqJwOeJxsKh4M0IVTVTxLyJcGpHbK10MnU0KgQNWGnT6zn90yIPM2QvF0vlyvmovRG0OcxlkszCJJmQptGnc4szPswcBo0IYPxH782xOUFL4MOUO2MLLKWjNYZRzmLJKoA */
    id: "news_bar_machine",
    initial: "init_fetch",
    context: { news: [] },
    states: {
      init_fetch: {
        invoke: {
          id: "fetch_news_inicial",
          src: fetch_news_feed,
          onDone: {
            target: "showing",
          },
        },
      },

      fetching: {
        invoke: {
          id: "fetch_news",
          src: fetch_news_feed,
          onDone: {
            target: "showing",
          },
        },
      },

      hidden: {
        type: "final",
      },

      showing: {
        after: { 3000: { target: "fetching" } },
        on: {
          HIDE: { target: "hidden" },
        },
      },
    },
  },
  {
    actions: {
      fetch_news: fetch_news_feed,
    },
  }
);
