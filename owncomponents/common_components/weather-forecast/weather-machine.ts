import { createMachine, actions } from 'xstate';
import { OpenMeteoResponse } from "./weather-functions";
import { LngLatLike } from "mapbox-gl";

export const machine = createMachine(
    {
        /** @xstate-layout N4IgpgJg5mDOIC5QFkCGBjAFgSwHZgAIA5VAWzADoxSAHAFwE8BiAZQBUBBAJTYG0AGALqJQNAPaxsdbGNwiQAD0QAmAKwAWCv3UA2ABwBmVasN6A7PwMAaEA0QBGdZv4uX9vf332DynQF8-GzQsPEIScgoAGzFUCDwoJghZSjwANzEAaxTcdKyAWkwAKwAvMAyBYSQQcUlpWXklBHVVAwoDe2Vm4wBOHQN1PWUbOwQzMwpe8z7+e35u9TMddQCgjBx8YjJKaNj4pjAAJwOxA4oaSNQ6ADMT0go0zLACkrKK+RqpGTkqxtVOto6XVUvX6g2GKhmWnavlUS26LQMelUKxAwXWYS2FFgmDEAHc9lwAKIAMSJLAAEm8qh86t9QL9uvYKIDuoiWspumY9HpwQg8u4KOpusL5v0zByDPw1AFAiBcGIIHB5GjQptyO8JJ96j9EHkdLz+RzBSKzN1DAZJS1-LKVRtwpRqPQRqJNbSGoh1ENbA4nFpXPwPHpWcL+MibWtVfaojE4rgoBral93Qh7DodFouXMzJ7WapZvrvXz1EyRWas+4DDoLNbViE7ZjsXj4gmtXTFIgxvwKMZdMp7H8dPZTapebNVH63H2dAHVGYDCjbRiIodjgcW26daNPN2NDo+wOh-DecoXFCOsDtMXjPYZX4gA */
        id: "Machine Name",
        initial: "empty",
        states: {
            empty: {
                on: {
                    START: {
                        target: "loading",
                    },
                }
            },
            loading: {
                invoke: {
                    src: "fetchData",
                    id: "invoke-hjzek",
                    onDone: [
                        {
                            target: "showing",
                            actions: {
                                type: "assignData",
                            },
                        },
                    ],
                    onError: [
                        {
                            target: "error",
                        },
                    ],
                },
            },
            showing: {
                on: {
                    REFRESH: {
                        internal: true,
                    },
                },
            },
            error: {
                entry: ["log"]
            },
        },
        types: {} as {
            context: {
                data: OpenMeteoResponse;
                posicion: LngLatLike;
            };
        },
        schema: { events: {} as { type: "START" } | { type: "REFRESH" } },
        predictableActionArguments: true,
        preserveActionOrder: true,
    },
    {
        actions: {
            assignData: (context, event) => { },
            log: (ctx, event) => console.log("Machine CTX", ctx, "Event", event),
        },
        services: {
            fetchData: createMachine({
                /* ... */
            }),
        },
        guards: {},
        delays: {},
    },
);